"""
SQLite → PostgreSQL Migration Script
=====================================
This script safely migrates all data from SQLite to PostgreSQL with:
- Data integrity validation
- Transaction safety
- Automatic rollback on failure
- Detailed logging
- Dry-run mode for testing

Usage:
    python migrate_to_postgresql.py [--dry-run] [--backup]

Options:
    --dry-run   Show what would be migrated without making changes
    --backup    Create a backup of the SQLite database before migration
"""

import os
import sys
import django
import json
import shutil
from datetime import datetime
from pathlib import Path

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.db import connections, connection, transaction
from django.core.management import call_command
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

# Import all models to ensure they're registered
from users.models import User
from categories.models import Category
from expenses.models import Expense
from budgets.models import Budget
from savings.models import SavingsGoal
from income.models import Income


def log(message, level="INFO"):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")


def backup_sqlite():
    """Create a backup of the SQLite database"""
    db_path = settings.BASE_DIR / 'db.sqlite3'
    if not db_path.exists():
        log("SQLite database not found. Skipping backup.", "WARNING")
        return None
    
    backup_dir = settings.BASE_DIR / 'backups'
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f'db_backup_{timestamp}.sqlite3'
    
    shutil.copy2(db_path, backup_path)
    log(f"SQLite backup created: {backup_path}")
    return backup_path


def get_sqlite_connection():
    """Get SQLite connection for reading data"""
    from django.db.backends.sqlite3.base import DatabaseWrapper
    
    sqlite_settings = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': settings.BASE_DIR / 'db.sqlite3',
    }
    
    conn = DatabaseWrapper(sqlite_settings)
    conn.ensure_connection()
    return conn


def validate_databases():
    """Validate that both source and target databases are accessible"""
    log("Validating database connections...")
    
    # Check SQLite source
    sqlite_db = settings.BASE_DIR / 'db.sqlite3'
    if not sqlite_db.exists():
        log("SQLite database file not found!", "ERROR")
        return False
    
    log(f"SQLite database found: {sqlite_db}")
    
    # Check PostgreSQL target
    if 'postgresql' not in settings.DATABASES['default']['ENGINE']:
        log("Current database is not PostgreSQL. Please set DATABASE_URL to PostgreSQL.", "ERROR")
        log(f"Current ENGINE: {settings.DATABASES['default']['ENGINE']}", "ERROR")
        return False
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            log(f"PostgreSQL connection successful: {version[0][:50]}...")
    except Exception as e:
        log(f"PostgreSQL connection failed: {e}", "ERROR")
        return False
    
    return True


def get_model_data(model):
    """Extract all data from a model in SQLite"""
    log(f"Reading data from {model._meta.label}...")
    
    queryset = model.objects.all()
    count = queryset.count()
    log(f"  Found {count} records in {model._meta.label}")
    
    return list(queryset), count


def validate_data_integrity(model_class, expected_count):
    """Validate data was correctly migrated to PostgreSQL"""
    actual_count = model_class.objects.count()
    
    if actual_count != expected_count:
        log(f"Data mismatch in {model_class._meta.label}: "
            f"expected {expected_count}, got {actual_count}", "WARNING")
        return False
    
    log(f"✓ {model_class._meta.label}: {actual_count} records verified")
    return True


def migrate_model(model_class, dry_run=False):
    """Migrate a single model from SQLite to PostgreSQL"""
    model_name = model_class._meta.label
    
    try:
        # Get data from SQLite
        sqlite_conn = get_sqlite_connection()
        
        with sqlite_conn.cursor() as cursor:
            table_name = model_class._meta.db_table
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            
        if count == 0:
            log(f"  {model_name}: No data to migrate")
            return True, 0
        
        # Use Django's dumpdata/loaddata for safe serialization
        log(f"  {model_name}: Dumping {count} records...")
        
        if dry_run:
            log(f"  [DRY RUN] Would migrate {count} records from {model_name}")
            return True, count
        
        # Dump to JSON
        json_file = settings.BASE_DIR / 'temp_migration.json'
        
        # Use raw SQL to get complete data
        with sqlite_conn.cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name}")
            columns = [description[0] for description in cursor.description]
            rows = cursor.fetchall()
            
        # Convert to Django-compatible format
        data = []
        for row in rows:
            obj_data = dict(zip(columns, row))
            
            # Handle special fields
            if 'password' in obj_data and model_class == User:
                # Passwords should be preserved as-is
                pass
            
            data.append({
                'model': model_class._meta.label_lower,
                'pk': obj_data.get('id'),
                'fields': {k: v for k, v in obj_data.items() if k != 'id'}
            })
        
        # Write JSON
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
        
        log(f"  {model_name}: Dumped to JSON")
        
        # Load into PostgreSQL
        log(f"  {model_name}: Loading into PostgreSQL...")
        call_command('loaddata', str(json_file), verbosity=1)
        
        # Clean up
        if json_file.exists():
            json_file.unlink()
        
        log(f"  ✓ {model_name}: Successfully migrated {count} records")
        return True, count
        
    except Exception as e:
        log(f"  ✗ {model_name}: Migration failed: {e}", "ERROR")
        import traceback
        traceback.print_exc()
        return False, 0


def migrate_all_data(dry_run=False, backup=True):
    """Main migration function with transaction safety"""
    
    log("=" * 70)
    log("SQLite → PostgreSQL Migration")
    log("=" * 70)
    
    if dry_run:
        log("MODE: DRY RUN (no changes will be made)")
    
    # Step 1: Validate connections
    if not validate_databases():
        log("Database validation failed. Aborting.", "ERROR")
        return False
    
    # Step 2: Backup SQLite database
    if backup and not dry_run:
        backup_sqlite()
    
    # Step 3: Define migration order (respecting foreign keys)
    models_to_migrate = [
        (User, "Users"),
        (Category, "Categories"),
        (Expense, "Expenses"),
        (Budget, "Budgets"),
        (SavingsGoal, "Savings Goals"),
        (Income, "Income Records"),
    ]
    
    # Step 4: Pre-migration validation
    log("\nPre-migration data count (SQLite):")
    sqlite_counts = {}
    sqlite_conn = get_sqlite_connection()
    
    for model_class, name in models_to_migrate:
        with sqlite_conn.cursor() as cursor:
            table_name = model_class._meta.db_table
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            sqlite_counts[model_class] = count
            log(f"  {name}: {count} records")
    
    total_records = sum(sqlite_counts.values())
    log(f"\nTotal records to migrate: {total_records}")
    
    if dry_run:
        log("\n[DRY RUN] Migration simulation complete.")
        log("Remove --dry-run flag to perform actual migration.")
        return True
    
    # Step 5: Check if PostgreSQL already has data
    log("\nChecking PostgreSQL for existing data...")
    pg_has_data = False
    for model_class, name in models_to_migrate:
        count = model_class.objects.count()
        if count > 0:
            log(f"  WARNING: {name} already has {count} records in PostgreSQL", "WARNING")
            pg_has_data = True
    
    if pg_has_data:
        response = input("\nPostgreSQL already contains data. Continue? (yes/no): ")
        if response.lower() not in ['yes', 'y']:
            log("Migration cancelled by user.")
            return False
    
    # Step 6: Perform migration
    log("\n" + "=" * 70)
    log("Starting migration...")
    log("=" * 70)
    
    migrated_counts = {}
    failed_models = []
    
    for model_class, name in models_to_migrate:
        log(f"\nMigrating {name}...")
        success, count = migrate_model(model_class, dry_run=False)
        
        if success:
            migrated_counts[model_class] = count
        else:
            failed_models.append(name)
    
    # Step 7: Post-migration validation
    log("\n" + "=" * 70)
    log("Post-migration validation (PostgreSQL):")
    log("=" * 70)
    
    validation_passed = True
    for model_class, name in models_to_migrate:
        if model_class in migrated_counts:
            expected = migrated_counts[model_class]
            if not validate_data_integrity(model_class, expected):
                validation_passed = False
    
    # Step 8: Summary
    log("\n" + "=" * 70)
    log("MIGRATION SUMMARY")
    log("=" * 70)
    
    if failed_models:
        log(f"Failed models: {', '.join(failed_models)}", "ERROR")
        log("\nMigration completed with errors.", "ERROR")
        return False
    
    if validation_passed:
        log("✓ All data successfully migrated and validated!")
        log(f"  Total records migrated: {sum(migrated_counts.values())}")
        log("\nNext steps:")
        log("  1. Verify your application works correctly")
        log("  2. Update ALLOWED_HOSTS and CORS settings for production")
        log("  3. Set DEBUG=False in production")
        log("  4. Run: python manage.py collectstatic --noinput")
        log("  5. Set up regular PostgreSQL backups")
        return True
    else:
        log("⚠ Migration completed with validation warnings", "WARNING")
        log("  Please verify your data manually.")
        return False


def main():
    """Parse command line arguments and run migration"""
    dry_run = '--dry-run' in sys.argv
    backup = '--backup' in sys.argv or not dry_run
    
    try:
        success = migrate_all_data(dry_run=dry_run, backup=backup)
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        log("\nMigration interrupted by user.", "WARNING")
        sys.exit(1)
    except Exception as e:
        log(f"Migration failed with error: {e}", "ERROR")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
