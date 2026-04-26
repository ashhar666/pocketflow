import subprocess
import signal
import sys
import re
import time
import os

print("Starting Cloudflare tunnel...")
tunnel_proc = subprocess.Popen(
    [r"c:\expense tracker\cloudflared.exe", "tunnel", "--url", "http://localhost:8000"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    bufsize=1
)

url = None

# Read stderr which is where cloudflared prints
for line in iter(tunnel_proc.stderr.readline, ''):
    match = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', line)
    if match:
        url = match.group(0)
        break

if url:
    print(f"Tunnel URL captured: {url}")
    print("Setting Telegram webhook...")
    webhook_url = f"{url}/api/telegram/webhook/"
    
    # Call the Django management command
    # Assuming this script is run from the backend directory
    result = subprocess.run(
        [sys.executable, "manage.py", "set_telegram_webhook", f"--url={webhook_url}"],
        capture_output=True,
        text=True
    )
    
    print(result.stdout)
    if result.stderr:
        print("ERRORS:", result.stderr)

    print("---")
    print(f"✅ Your tunnel is running successfully! Leave this script running. URL: {url}")
    print("---")
    
    # Keep running to keep tunnel alive
    try:
        tunnel_proc.wait()
    except KeyboardInterrupt:
        tunnel_proc.terminate()
else:
    print("Failed to capture tunnel URL.")
    tunnel_proc.terminate()
