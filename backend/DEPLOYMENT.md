# Production Deployment Guide
## SQLite → PostgreSQL Migration & Production Readiness

This guide covers migrating your PocketFlow from SQLite to PostgreSQL and deploying to production.

---

## Table of Contents

1. [Why PostgreSQL?](#why-postgresql)
2. [Prerequisites](#prerequisites)
3. [Step 1: Install Dependencies](#step-1-install-dependencies)
4. [Step 2: Setup PostgreSQL Database](#step-2-setup-postgresql-database)
5. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
6. [Step 4: Migrate Data](#step-4-migrate-data)
7. [Step 5: Run Health Checks](#step-5-run-health-checks)
8. [Step 6: Deploy to Production](#step-6-deploy-to-production)
9. [Database Backup & Recovery](#database-backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## Why PostgreSQL?

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Concurrent Writes | ❌ Limited | ✅ Excellent |
| Data Safety | ⚠️ File-based | ✅ ACID compliant |
| Scalability | ⚠️ Single file | ✅ Unlimited growth |
| Backup/Restore | ⚠️ Manual copy | ✅ pg_dump tools |
| Production Ready | ❌ Development only | ✅ Industry standard |
| Connection Pooling | ❌ No | ✅ Built-in |

---

## Prerequisites

- Python 3.8+
- PostgreSQL 12+ (local or cloud-hosted)
- Django 4.2.9 project with existing SQLite data
- Access to terminal/command line

### Cloud PostgreSQL Options

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| [Supabase](https://supabase.com) | 500MB | Quick setup, global CDN |
| [Render](https://render.com) | 90 days | Easy Django deployment |
| [Railway](https://railway.app) | $5 credit | Developer-friendly |
| [Neon](https://neon.tech) | 500MB | Serverless PostgreSQL |
| [Aiven](https://aiven.io) | Free tier | Multi-cloud |

---

## Step 1: Install Dependencies

```bash
cd backend

# Install Python packages
pip install -r requirements.txt

# Verify PostgreSQL adapter installed
python -c "import psycopg2; print('psycopg2 version:', psycopg2.__version__)"
```

**New dependencies added:**
- `psycopg2-binary==2.9.9` - PostgreSQL adapter
- `dj-database-url==2.1.0` - Database URL parser

---

## Step 2: Setup PostgreSQL Database

### Option A: Local PostgreSQL

```bash
# Create database
createdb expense_tracker

# Or using psql
psql -U postgres
CREATE DATABASE expense_tracker;
CREATE USER expense_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;
\q
```

### Option B: Supabase (Cloud)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings → Database
4. Copy the **Connection string** (URI format)

Example Supabase URL:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Option C: Render (Cloud)

1. Create account at [render.com](https://render.com)
2. Create new PostgreSQL database
3. Copy the **Internal Database URL**

---

## Step 3: Configure Environment Variables

Update your `.env` file:

```bash
# .env file

# ── Django Core ─────────────────────────────────────────────
SECRET_KEY=your-super-secret-key-min-50-chars-long-change-in-production
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# ── Database ────────────────────────────────────────────────
# Replace with your PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker

# ── Email (Gmail) ──────────────────────────────────────────
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=PocketFlow <your-email@gmail.com>

# ── Frontend URL ───────────────────────────────────────────
FRONTEND_URL=https://yourdomain.com

# ── Telegram Bot ───────────────────────────────────────────
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
```

### 🔒 Security Checklist

- [ ] Generate a new `SECRET_KEY` (min 50 characters)
- [ ] Set `DEBUG=False`
- [ ] Restrict `ALLOWED_HOSTS` to your domain
- [ ] Use HTTPS for all URLs
- [ ] Never commit `.env` to git

Generate a secure SECRET_KEY:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Step 4: Migrate Data

### Option 1: Automated Migration (Recommended)

The migration script safely transfers all data from SQLite to PostgreSQL:

```bash
# Dry run (shows what would be migrated without changes)
python migrate_to_postgresql.py --dry-run

# Create backup and migrate
python migrate_to_postgresql.py --backup

# Verify the migration
python manage.py shell -c "
from users.models import User
from expenses.models import Expense
print(f'Users: {User.objects.count()}')
print(f'Expenses: {Expense.objects.count()}')
"
```

**Migration features:**
- ✅ Automatic SQLite backup before migration
- ✅ Transaction safety (rollback on failure)
- ✅ Data integrity validation
- ✅ Detailed logging
- ✅ Respects foreign key relationships

### Option 2: Fresh Start (No Data Migration)

If you don't need existing data:

```bash
# Apply migrations to PostgreSQL
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Migration Order

Data is migrated in this order to respect foreign keys:
1. Users
2. Categories
3. Expenses
4. Budgets
5. Savings Goals
6. Income Records

---

## Step 5: Run Health Checks

Verify your application is production-ready:

```bash
# Run comprehensive health check
python health_check.py

# Expected output:
# ✓ Database connected: postgresql
# ✓ All migrations applied
# ✓ Security settings configured
# ✓ Email configured
# ✓ API endpoints accessible
# ✓ Application is production-ready!
```

**Health checks performed:**
- Database connectivity
- Migration status
- Security settings (DEBUG, SSL, cookies)
- Email configuration
- Static files
- Environment variables
- Dependencies
- API endpoint accessibility

---

## Step 6: Deploy to Production

### Deploy to Render

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Configure PostgreSQL support"
   git push origin main
   ```

2. **Create Render Account** at [render.com](https://render.com)

3. **Create New Web Service**
   - Connect your GitHub repository
   - Build Command: `cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - Start Command: `cd backend && gunicorn core.wsgi:application`
   - Add PostgreSQL database from Render dashboard

4. **Set Environment Variables**
   - Copy all values from your `.env` file
   - Use Render's Internal Database URL for `DATABASE_URL`

5. **Deploy**
   - Render will automatically build and deploy
   - Run migrations: `python manage.py migrate`

### Deploy with Gunicorn (VPS/Dedicated Server)

```bash
# Install gunicorn
pip install gunicorn

# Collect static files
python manage.py collectstatic --noinput

# Run with gunicorn
gunicorn core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
```

### Nginx Configuration (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /static/ {
        alias /path/to/backend/staticfiles/;
    }
    
    location /media/ {
        alias /path/to/backend/media/;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Database Backup & Recovery

### Automated Backups

```bash
# Create backup
python backup_db.py --verify

# Keep backups for 90 days
python backup_db.py --days-to-keep=90 --verify
```

**Backup features:**
- ✅ Uses `pg_dump` (PostgreSQL native)
- ✅ Compressed backup files
- ✅ Integrity verification
- ✅ Automatic cleanup of old backups
- ✅ Timestamped backups

### Manual Backup

```bash
# Using pg_dump
pg_dump -h HOST -U USER -d DATABASE -F c -f backup.dump

# Restore from backup
pg_restore -h HOST -U USER -d DATABASE -c backup.dump
```

### Scheduled Backups (Cron)

```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/backend && python backup_db.py --days-to-keep=30 >> /var/log/db_backup.log 2>&1
```

---

## PostgreSQL Optimizations

### Connection Pooling

Add to your `.env`:
```bash
# Keep connections alive for 10 minutes
DATABASE_URL=postgresql://user:pass@host:5432/dbname?conn_max_age=600
```

### Database Indexes

The migration preserves all Django indexes. For additional performance:

```sql
-- Add indexes for common queries
CREATE INDEX idx_expenses_user_date ON expenses_expense(user_id, date DESC);
CREATE INDEX idx_budgets_user_month ON budgets_budget(user_id, year, month);
CREATE INDEX idx_income_user_date ON income_income(user_id, date DESC);
```

### Monitoring

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('expense_tracker'));

-- Check table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;
```

---

## Troubleshooting

### Migration Fails

**Problem**: `pg_dump: command not found`
```bash
# Install PostgreSQL client tools
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install libpq
brew link --force libpq

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

**Problem**: `FATAL: password authentication failed`
```bash
# Verify DATABASE_URL format
# Correct: postgresql://USER:PASSWORD@HOST:PORT/DBNAME
# Check for special characters in password (URL encode them)
```

### Connection Issues

**Problem**: `connection timeout`
```bash
# Test connection
psql "postgresql://user:pass@host:5432/dbname"

# Check PostgreSQL is running
pg_isready -h HOST -p PORT
```

### Data Mismatch After Migration

```bash
# Verify record counts
python manage.py shell
>>> from expenses.models import Expense
>>> Expense.objects.count()

# Compare with SQLite backup
# Check backup file or re-run migration with --dry-run
```

### Health Check Fails

```bash
# Run with verbose output
python health_check.py --verbose

# Common fixes:
# 1. Collect static files
python manage.py collectstatic --noinput

# 2. Apply pending migrations
python manage.py migrate

# 3. Check .env file is loaded
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('DATABASE_URL'))"
```

---

## Post-Deployment Checklist

- [ ] Database migrated to PostgreSQL
- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` is secure and unique
- [ ] `ALLOWED_HOSTS` restricted to your domain
- [ ] HTTPS enabled (SSL certificate)
- [ ] Static files collected (`collectstatic`)
- [ ] Email sending working
- [ ] Telegram bot webhook configured
- [ ] Automated backups scheduled
- [ ] Health checks passing
- [ ] Monitoring/logging configured
- [ ] CORS origins restricted
- [ ] CSRF trusted origins set

---

## Support & Resources

- **Django Docs**: https://docs.djangoproject.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **dj-database-url**: https://github.com/jazzband/dj-database-url
- **psycopg2**: https://www.psycopg.org/docs/

---

## Quick Reference Commands

```bash
# Migration
python migrate_to_postgresql.py --dry-run     # Test migration
python migrate_to_postgresql.py --backup      # Perform migration

# Health & Monitoring
python health_check.py                        # Run health checks
python backup_db.py --verify                  # Create backup

# Django Management
python manage.py migrate                      # Apply migrations
python manage.py collectstatic --noinput     # Collect static files
python manage.py createsuperuser             # Create admin user
python manage.py showmigrations              # Check migration status

# Database Shell
python manage.py dbshell                     # Open PostgreSQL shell
```

---

**Last Updated**: April 10, 2026  
**Django Version**: 4.2.9  
**PostgreSQL Adapter**: psycopg2-binary 2.9.9
