import requests
import json
import os

TOKEN = "8780848675:AAGcWeIB8u7Nz5M6v16TeDE6udHPcLPqRg8"
SECRET = "PocketFlow2026"
WEBHOOK_URL = "https://ashharshahan-pocketflow.hf.space/api/telegram/webhook/"

def sync():
    print(f"Setting webhook for bot to: {WEBHOOK_URL}")
    url = f"https://api.telegram.org/bot{TOKEN}/setWebhook"
    payload = {
        "url": WEBHOOK_URL,
        "secret_token": SECRET,
        "drop_pending_updates": True
    }
    
    resp = requests.post(url, json=payload)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")

    # Verify info
    info_url = f"https://api.telegram.org/bot{TOKEN}/getWebhookInfo"
    info_resp = requests.get(info_url)
    print(f"Webhook Info: {info_resp.text}")

if __name__ == "__main__":
    sync()
