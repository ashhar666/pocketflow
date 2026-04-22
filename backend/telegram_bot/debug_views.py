import os
import traceback
import logging
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

class DebugLogsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            log_file = os.path.join(settings.BASE_DIR, 'logs', 'app.log')
            if not os.path.exists(log_file):
                return Response({"error": "Log file not found", "path": log_file})
            
            with open(log_file, 'r', encoding='utf-8') as f:
                # Get last 200 lines
                lines = f.readlines()[-200:]
            return Response({"logs": lines})
        except Exception:
            return Response({"error": traceback.format_exc()}, status=500)

class DebugEnvView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            def mask(s):
                if not s: return "MISSING"
                if len(s) < 8: return "****"
                return f"{s[:4]}...{s[-4:]}"
            
            views_path = os.path.join(settings.BASE_DIR, 'telegram_bot', 'views.py')
            urls_path = os.path.join(settings.BASE_DIR, 'telegram_bot', 'urls.py')
            
            return Response({
                "TELEGRAM_BOT_TOKEN": mask(getattr(settings, 'TELEGRAM_BOT_TOKEN', None)),
                "TELEGRAM_WEBHOOK_SECRET": mask(getattr(settings, 'TELEGRAM_WEBHOOK_SECRET', None)),
                "TELEGRAM_WEBHOOK_URL": getattr(settings, 'TELEGRAM_WEBHOOK_URL', 'NOT_SET'),
                "DATABASE_CONNECTED": "default" in settings.DATABASES,
                "DEBUG": settings.DEBUG,
                "LOG_LEVEL": getattr(settings, 'LOG_LEVEL', 'NOT_SET'),
                "VIEWS_FILE_SIZE": os.path.getsize(views_path) if os.path.exists(views_path) else "MISSING",
                "URLS_FILE_SIZE": os.path.getsize(urls_path) if os.path.exists(urls_path) else "MISSING",
                "VERSION": "DEBUG_INFRA_V4_ISOLATED",
            })
        except Exception:
            return Response({"error": traceback.format_exc()}, status=500)

class DebugWebhookStatusView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            # We don't use the custom adapter here to avoid dependency on utils.py
            # which might be crashing.
            token = settings.TELEGRAM_BOT_TOKEN
            url = f"https://api.telegram.org/bot{token}/getWebhookInfo"
            resp = requests.get(url, timeout=10)
            return Response(resp.json())
        except Exception:
            return Response({"error": traceback.format_exc()}, status=500)

class NetworkTestView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        results = {}
        try:
            import socket
            results["dns_telegram"] = socket.gethostbyname("api.telegram.org")
            results["dns_google"] = socket.gethostbyname("google.com")
            
            # Test simple connect
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(5)
            try:
                s.connect(("google.com", 80))
                results["connect_google_80"] = "OK"
            except Exception as e:
                results["connect_google_80"] = str(e)
            finally:
                s.close()
                
            # Test Telegram connect
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(5)
            try:
                s.connect(("api.telegram.org", 443))
                results["connect_telegram_443"] = "OK"
            except Exception as e:
                results["connect_telegram_443"] = str(e)
            finally:
                s.close()
                
            # Test requests to google
            try:
                r = requests.get("https://google.com", timeout=5)
                results["request_google"] = f"OK ({r.status_code})"
            except Exception as e:
                results["request_google"] = str(e)
            
            # Test requests to telegram (Isolating SSL/Headers)
            try:
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
                # Try a very simple endpoint that doesn't need bot token
                r = requests.get("https://api.telegram.org/", timeout=10, verify=False, headers=headers)
                results["request_telegram_base"] = f"OK ({r.status_code})"
            except Exception as e:
                results["request_telegram_base"] = str(e)
                
            return Response(results)

        except Exception:
            return Response({"error": traceback.format_exc()}, status=500)

