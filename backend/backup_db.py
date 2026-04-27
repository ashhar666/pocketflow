"""
PostgreSQL Database Backup Utility
===================================
Creates compressed backups of the PostgreSQL database with:
- Timestamped backup files
- Automatic cleanup of old backups
- Integrity verification
- Optional upload to cloud storage

Usage:
    python backup_db.py [--days-to-keep=30] [--verify]

Options:
    --days-to-keep=N  Delete backups older than N days (default: 30)
    --verify          Verify backup integrity after creation
"""

import os
import sys
import django
import subprocess
from datetime import datetime
from pathlib import Path
import gzip
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.db import connection


def log(message, level="INFO"):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")


def is_postgresql():
    """Check if current database is PostgreSQL"""
    return 'postgresql' in settings.DATABASES['default']['ENGINE']


def get_db_config():
    """Get PostgreSQL connection parameters"""
    config = settings.DATABASES['default']
    return {
        'NAME': config['NAME'],
        'USER': config.get('USER', ''),
        'PASSWORD': config.get('PASSWORD', ''),
        'HOST': config.get('HOST', 'localhost'),
        'PORT': config.get('PORT', '5432'),
    }


def backup_using_pgdump(backup_dir, timestamp, verify=False):
    """Create backup using pg_dump (recommended for PostgreSQL)"""
    
    db_config = get_db_config()
    backup_file = backup_dir / f'postgres_backup_{timestamp}.sql'
    
    # Set environment variables for pg_dump
    env = os.environ.copy()
    if db_config['PASSWORD']:
        env['PGPASSWORD'] = db_config['PASSWORD']
    
    # Build pg_dump command
    cmd = [
        'pg_dump',
        '-h', db_config['HOST'],
        '-p', str(db_config['PORT']),
        '-U', db_config['USER'],
        '-d', db_config['NAME'],
        '-F', 'c',  # Custom format (compressed)
        '-f', str(backup_file.with_suffix('.dump')),
        '--no-owner',
        '--no-privileges',
    ]
    
    log(f"Running pg_dump: {' '.join(cmd[:-1])}")
    
    try:
        result = subprocess.run(
            cmd,
            env=env,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            log(f"✓ PostgreSQL backup created: {backup_file.with_suffix('.dump')}")
            
            if verify:
                verify_backup(backup_file.with_suffix('.dump'), method='pg_restore')
            
            return backup_file.with_suffix('.dump')
        else:
            log(f"pg_dump failed: {result.stderr}", "ERROR")
            return None
            
    except FileNotFoundError:
        log("pg_dump not found. Falling back to Django's dumpdata...", "WARNING")
        return backup_using_django_dumpdata(backup_dir, timestamp, verify)
    except subprocess.TimeoutExpired:
        log("Backup timed out. Database may be too large.", "ERROR")
        return None


def backup_using_django_dumpdata(backup_dir, timestamp, verify=False):
    """Fallback backup using Django's dumpdata command"""
    
    from django.core.management import call_command
    
    backup_file = backup_dir / f'django_backup_{timestamp}.json'
    gz_file = backup_file.with_suffix('.json.gz')
    
    log("Creating backup using Django dumpdata...")
    
    try:
        with open(backup_file, 'w', encoding='utf-8') as f:
            call_command('dumpdata', '--natural-foreign', '--natural-primary',
                        '--indent=2', stdout=f)
        
        # Compress the backup
        log("Compressing backup...")
        with open(backup_file, 'rb') as f_in:
            with gzip.open(gz_file, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # Remove uncompressed file
        backup_file.unlink()
        
        log(f"✓ Django backup created: {gz_file}")
        
        if verify:
            verify_backup(gz_file, method='django')
        
        return gz_file
        
    except Exception as e:
        log(f"Backup failed: {e}", "ERROR")
        if backup_file.exists():
            backup_file.unlink()
        return None


def verify_backup(backup_file, method='django'):
    """Verify backup integrity"""
    log(f"Verifying backup: {backup_file.name}")
    
    try:
        if method == 'pg_restore' and backup_file.suffix == '.dump':
            # Verify PostgreSQL dump
            env = os.environ.copy()
            db_config = get_db_config()
            if db_config['PASSWORD']:
                env['PGPASSWORD'] = db_config['PASSWORD']
            
            result = subprocess.run(
                ['pg_restore', '-l', str(backup_file)],
                env=env,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                log("✓ Backup verification passed")
                return True
            else:
                log(f"Backup verification failed: {result.stderr}", "WARNING")
                return False
                
        elif method == 'django':
            # Verify Django backup
            import json
            if backup_file.suffix == '.gz':
                with gzip.open(backup_file, 'rt', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                with open(backup_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            
            log(f"✓ Backup verification passed: {len(data)} records")
            return True
        
    except Exception as e:
        log(f"Verification failed: {e}", "ERROR")
        return False
    
    return False


def cleanup_old_backups(backup_dir, days_to_keep=30):
    """Delete backups older than specified days"""
    log(f"Cleaning up backups older than {days_to_keep} days...")
    
    if not backup_dir.exists():
        return
    
    deleted_count = 0
    for backup_file in backup_dir.glob('*backup*'):
        if backup_file.is_file():
            age_days = (datetime.now().timestamp() - backup_file.stat().st_mtime) / 86400
            if age_days > days_to_keep:
                log(f"  Deleting old backup: {backup_file.name} ({age_days:.0f} days old)")
                backup_file.unlink()
                deleted_count += 1
    
    log(f"  Deleted {deleted_count} old backup(s)")


def main():
    """Main backup function"""
    
    # Parse arguments
    days_to_keep = 30
    verify = False
    
    for arg in sys.argv[1:]:
        if arg.startswith('--days-to-keep='):
            days_to_keep = int(arg.split('=')[1])
        elif arg == '--verify':
            verify = True
    
    log("=" * 70)
    log("Database Backup Utility")
    log("=" * 70)
    
    # Check if PostgreSQL
    if not is_postgresql():
        log("Current database is SQLite. Use SQLite backup tools instead.", "WARNING")
        response = input("Continue with Django dumpdata backup? (yes/no): ")
        if response.lower() not in ['yes', 'y']:
            log("Backup cancelled.")
            return
    
    # Create backup directory
    backup_dir = settings.BASE_DIR / 'backups'
    backup_dir.mkdir(exist_ok=True)
    
    # Create timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Perform backup
    if is_postgresql():
        backup_file = backup_using_pgdump(backup_dir, timestamp, verify)
    else:
        backup_file = backup_using_django_dumpdata(backup_dir, timestamp, verify)
    
    if backup_file:
        log(f"\n✓ Backup successful: {backup_file}")
        log(f"  Size: {backup_file.stat().st_size / 1024 / 1024:.2f} MB")
    else:
        log("\n✗ Backup failed!", "ERROR")
        sys.exit(1)
    
    # Cleanup old backups
    cleanup_old_backups(backup_dir, days_to_keep)
    
    log("\nBackup completed successfully!")


if __name__ == '__main__':
    main()
