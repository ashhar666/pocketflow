"""
Production Health Check Script
===============================
Verifies the application is production-ready by checking:
- Database connectivity and migrations
- Security settings
- Email configuration
- Static files
- Environment variables

Usage:
    python health_check.py [--verbose]
"""

import os
import sys
import django
from pathlib import Path
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.db import connection
from django.core.management import call_command


def log(message, level="INFO"):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    color_codes = {
        "INFO": "",
        "PASS": "\033[92m",  # Green
        "FAIL": "\033[91m",  # Red
        "WARN": "\033[93m",  # Yellow
    }
    reset = "\033[0m"
    
    prefix = color_codes.get(level, "")
    print(f"{prefix}[{timestamp}] {level}: {message}{reset}")


def check_database():
    """Check database connectivity"""
    log("Checking database connection...")
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        if result and result[0] == 1:
            db_engine = settings.DATABASES['default']['ENGINE']
            db_name = settings.DATABASES['default'].get('NAME', 'unknown')
            log(f"[OK] Database connected: {db_engine} ({db_name})", "PASS")
            
            # Check if PostgreSQL
            if 'postgresql' in db_engine:
                log("  [OK] Using PostgreSQL (production-ready)", "PASS")
                
                # Check connection pool settings
                conn_max_age = settings.DATABASES['default'].get('CONN_MAX_AGE', 0)
                if conn_max_age > 0:
                    log(f"  [OK] Connection pooling enabled: {conn_max_age}s", "PASS")
                else:
                    log("  [WARN] Connection pooling not configured", "WARN")
            else:
                log("  [WARN] Using SQLite (not recommended for production)", "WARN")
            
            return True
        else:
            log("[ERROR] Database query failed", "FAIL")
            return False
            
    except Exception as e:
        log(f"[ERROR] Database connection failed: {e}", "FAIL")
        return False


def check_migrations():
    """Check if all migrations have been applied"""
    log("Checking migrations...")
    
    try:
        from django.db.migrations.executor import MigrationExecutor
        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        
        if not plan:
            log("[OK] All migrations applied", "PASS")
            return True
        else:
            log(f"[ERROR] {len(plan)} migration(s) pending:", "FAIL")
            for migration in plan:
                log(f"    - {migration}", "FAIL")
            return False
            
    except Exception as e:
        log(f"[ERROR] Migration check failed: {e}", "FAIL")
        return False


def check_security_settings():
    """Check production security settings"""
    log("Checking security settings...")
    
    issues = []
    
    # Check DEBUG mode
    if settings.DEBUG:
        issues.append("DEBUG is True - should be False in production")
    
    # Check SECRET_KEY
    if 'django-insecure' in settings.SECRET_KEY or len(settings.SECRET_KEY) < 50:
        issues.append("SECRET_KEY appears weak or is using default")
    
    # Check ALLOWED_HOSTS
    if '*' in settings.ALLOWED_HOSTS:
        issues.append("ALLOWED_HOSTS allows all hosts (*) - should be restricted")
    
    # Check security middleware
    if not settings.DEBUG:
        middleware = settings.MIDDLEWARE
        
        if 'django.middleware.security.SecurityMiddleware' not in middleware:
            issues.append("SecurityMiddleware not installed")
        
        if 'django.middleware.clickjacking.XFrameOptionsMiddleware' not in middleware:
            issues.append("XFrameOptionsMiddleware not installed")
    
    # Check SSL settings
    if not settings.DEBUG:
        if not getattr(settings, 'SECURE_SSL_REDIRECT', False):
            issues.append("SECURE_SSL_REDIRECT not enabled")
        
        if not getattr(settings, 'SESSION_COOKIE_SECURE', False):
            issues.append("SESSION_COOKIE_SECURE not enabled")
        
        if not getattr(settings, 'CSRF_COOKIE_SECURE', False):
            issues.append("CSRF_COOKIE_SECURE not enabled")
    
    if issues:
        log(f"[ERROR] {len(issues)} security issue(s) found:", "FAIL")
        for issue in issues:
            log(f"    - {issue}", "FAIL")
        return False
    else:
        log("[OK] Security settings configured", "PASS")
        return True


def check_email_config():
    """Check email configuration"""
    log("Checking email configuration...")
    
    if hasattr(settings, 'EMAIL_HOST_USER') and settings.EMAIL_HOST_USER:
        log(f"[OK] Email configured: {settings.EMAIL_HOST_USER}", "PASS")
        
        # Test email connection
        try:
            from django.core.mail import get_connection
            connection = get_connection()
            connection.open()
            connection.close()
            log(f"[OK] Email connection successful: {settings.EMAIL_HOST_USER}", "PASS")
            return True
        except Exception as e:
            log(f"[ERROR] Email connection test failed: {e}", "FAIL")
            return False
    else:
        log("[ERROR] Email not configured (using console backend). SMTP is required for production.", "FAIL")
        return False


def check_static_files():
    """Check static files configuration"""
    log("Checking static files...")
    
    static_root = Path(settings.STATIC_ROOT) if hasattr(settings, 'STATIC_ROOT') else None
    
    if not static_root:
        log("[WARN] STATIC_ROOT not configured", "WARN")
        return False
    
    if static_root.exists():
        file_count = len(list(static_root.rglob('*')))
        log(f"[OK] Static files collected: {file_count} files", "PASS")
        return True
    else:
        log("[WARN] Static files not collected (run: python manage.py collectstatic)", "WARN")
        return False


def check_environment():
    """Check environment variables"""
    log("Checking environment variables...")
    
    required_vars = ['SECRET_KEY', 'TELEGRAM_WEBHOOK_SECRET']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        log(f"[ERROR] Missing required env vars: {', '.join(missing_vars)}", "FAIL")
        return False
    else:
        log("[OK] Required environment variables set", "PASS")
        return True


def check_dependencies():
    """Check installed dependencies"""
    log("Checking dependencies...")
    
    try:
        import importlib.metadata
        
        required_packages = {
            'psycopg2': 'PostgreSQL adapter (optional but recommended)',
            'dj_database_url': 'Database URL parser',
        }
        
        missing = []
        for package, description in required_packages.items():
            try:
                importlib.metadata.version(package)
                log(f"  [OK] {package}: {description}", "PASS")
            except importlib.metadata.PackageNotFoundError:
                missing.append(package)
                log(f"  [WARN] {package}: not installed", "WARN")
        
        if missing:
            log(f"  Note: {', '.join(missing)} recommended for production", "WARN")
        
        return True
        
    except Exception as e:
        log(f"[ERROR] Dependency check failed: {e}", "FAIL")
        return False


def check_api_endpoints():
    """Check if API endpoints are accessible"""
    log("Checking API endpoints...")
    
    try:
        from rest_framework.test import APIClient
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Create test client
        client = APIClient()
        
        # Test unauthenticated endpoint (should return 401, not 500)
        # Using a valid GET endpoint to verify API accessibility
        response = client.get('/api/summary/monthly/', HTTP_HOST='localhost')
        
        if response.status_code in [200, 401, 403, 301]:
            log(f"[OK] API endpoints accessible (summary endpoint: {response.status_code})", "PASS")
            return True
        else:
            log(f"[ERROR] API returned unexpected status: {response.status_code}", "FAIL")
            return False
            
    except Exception as e:
        log(f"[ERROR] API check failed: {e}", "FAIL")
        return False


def run_all_checks(verbose=False):
    """Run all health checks"""
    
    log("=" * 70)
    log("Production Health Check")
    log("=" * 70)
    log("")
    
    checks = [
        ("Database Connection", check_database),
        ("Migrations", check_migrations),
        ("Security Settings", check_security_settings),
        ("Email Configuration", check_email_config),
        ("Static Files", check_static_files),
        ("Environment Variables", check_environment),
        ("Dependencies", check_dependencies),
        ("API Endpoints", check_api_endpoints),
    ]
    
    results = {}
    
    for name, check_func in checks:
        try:
            results[name] = check_func()
        except Exception as e:
            log(f"[ERROR] {name} check crashed: {e}", "FAIL")
            results[name] = False
        log("")
    
    # Summary
    log("=" * 70)
    log("SUMMARY")
    log("=" * 70)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = "[OK] PASS" if result else "[ERROR] FAIL"
        log(f"  {status}: {name}")
    
    log("")
    log(f"Result: {passed}/{total} checks passed")
    
    if passed == total:
        log("\n[OK] Application is production-ready!", "PASS")
        return True
    else:
        log(f"\n[WARN] {total - passed} check(s) failed. Review issues before deploying.", "WARN")
        return False


def main():
    """Main function"""
    verbose = '--verbose' in sys.argv
    
    try:
        success = run_all_checks(verbose)
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        log("\n\nHealth check interrupted by user.", "WARN")
        sys.exit(1)
    except Exception as e:
        log(f"\nHealth check failed: {e}", "FAIL")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
