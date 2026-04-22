from django.urls import path
from django.http import HttpResponse
from .views import (
    WebhookView, 
    GenerateLinkView, 
    DisconnectView, 
    StatusView, 
    SyncWebhookView
)
from .debug_views import DebugLogsView, DebugEnvView, DebugWebhookStatusView, NetworkTestView

# Step 9: Vercel Proxy Bridge + versioned ping
urlpatterns = [
    path('ping/', lambda r: HttpResponse('pong - v18')),



    path('webhook/', WebhookView.as_view(), name='telegram-webhook'),
    path('generate-link/', GenerateLinkView.as_view(), name='telegram-link'),
    path('status/', StatusView.as_view(), name='telegram-status'),
    path('disconnect/', DisconnectView.as_view(), name='telegram-disconnect'),
    path('sync/', SyncWebhookView.as_view(), name='telegram-sync-webhook'),
    
    # Debug Endpoints
    path('debug-logs/', DebugLogsView.as_view(), name='debug-logs'),
    path('debug-env/', DebugEnvView.as_view(), name='debug-env'),
    path('debug-webhook/', DebugWebhookStatusView.as_view(), name='debug-webhook'),
    path('network-test/', NetworkTestView.as_view(), name='network-test'),
]



