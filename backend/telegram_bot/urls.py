from django.urls import path
from django.http import HttpResponse
from django.conf import settings
from .views import (
    WebhookView, 
    GenerateLinkView, 
    DisconnectView, 
    StatusView, 
    SyncWebhookView
)

# Step 12: Robust Proxy Bridge + versioned ping
urlpatterns = [
    path('ping/', lambda r: HttpResponse(f"pong - v26 - Token: {'SET' if settings.TELEGRAM_BOT_TOKEN else 'MISSING'}, Secret: {settings.TELEGRAM_WEBHOOK_SECRET[:3]}...{settings.TELEGRAM_WEBHOOK_SECRET[-3:] if settings.TELEGRAM_WEBHOOK_SECRET else ''}, Proxy: {settings.TELEGRAM_PROXY_ENABLED}, Gemini: {'SET' if os.getenv('GEMINI_API_KEY') else 'MISSING'}")),






    path('webhook/', WebhookView.as_view(), name='telegram-webhook'),
    path('generate-link/', GenerateLinkView.as_view(), name='telegram-link'),
    path('status/', StatusView.as_view(), name='telegram-status'),
    path('disconnect/', DisconnectView.as_view(), name='telegram-disconnect'),
    path('sync/', SyncWebhookView.as_view(), name='telegram-sync-webhook'),
]

if settings.DEBUG:
    from .debug_views import DebugLogsView, DebugEnvView, DebugWebhookStatusView, NetworkTestView

    urlpatterns += [
        path('debug-logs/', DebugLogsView.as_view(), name='debug-logs'),
        path('debug-env/', DebugEnvView.as_view(), name='debug-env'),
        path('debug-webhook/', DebugWebhookStatusView.as_view(), name='debug-webhook'),
        path('network-test/', NetworkTestView.as_view(), name='network-test'),
    ]


