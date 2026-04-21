#!/bin/bash
# Exit immediately if a command fails and print each command (set -ex)
set -ex

echo "==> [HF-BOOT] Starting production startup script..."
echo "==> [HF-BOOT] User: $(whoami)"
echo "==> [HF-BOOT] Directory: $(pwd)"

# Create logs directory manually just in case
mkdir -p logs

echo "==> [HF-BOOT] Collecting static files..."
python manage.py collectstatic --no-input || echo "==> [WARNING] Collectstatic failed, continuing..."

echo "==> [HF-BOOT] Applying database migrations..."
python manage.py migrate || echo "==> [WARNING] Migrations failed, continuing..."

echo "==> [HF-BOOT] Starting Gunicorn on port 7860..."
exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:7860 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level debug
