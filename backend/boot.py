import os
import subprocess
import sys
import time

def log(msg):
    print(f"==> [HF-BOOT] {msg}", flush=True)

def run_command(cmd):
    log(f"Executing: {cmd}")
    try:
        # Use subprocess.run to capture execution and force output
        process = subprocess.run(
            cmd, 
            shell=True, 
            check=False,
            text=True,
            capture_output=False # Allow output to flow direct to stdout/stderr
        )
        if process.returncode == 0:
            log(f"Command succeeded: {cmd}")
        else:
            log(f"Command failed with exit code {process.returncode}: {cmd}")
    except Exception as e:
        log(f"Error executing {cmd}: {str(e)}")

log("Python Bootstrapper Initializing...")

# Diagnostic: List files to confirm pathing
log("Checking file structure...")
run_command("ls -R . | head -n 20")

# 1. Collectstatic
log("Collecting static files...")
run_command("python manage.py collectstatic --no-input")

# 2. Migrations
log("Applying database migrations...")
run_command("python manage.py migrate --no-input")

# 3. Final Handover to Gunicorn
log("Starting Gunicorn on 0.0.0.0:7860...")
# Using os.execvp perfectly hands over PID 1 to Gunicorn
os.execvp("gunicorn", [
    "gunicorn", 
    "core.wsgi:application", 
    "--bind", "0.0.0.0:7860",
    "--workers", "2",
    "--timeout", "120",
    "--access-logfile", "-",
    "--error-logfile", "-",
    "--log-level", "debug"
])
