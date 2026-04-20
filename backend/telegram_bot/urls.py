from django.urls import path
from .views import GenerateLinkView, WebhookView, DisconnectView, StatusView, SyncWebhookView

urlpatterns = [
    path('generate-link/', GenerateLinkView.as_view(), name='telegram_generate_link'),
    path('webhook/',        WebhookView.as_view(),      name='telegram_webhook'),
    path('disconnect/',     DisconnectView.as_view(),   name='telegram_disconnect'),
    path('status/',         StatusView.as_view(),       name='telegram_status'),
    path('sync/',           SyncWebhookView.as_view(),   name='telegram_sync'),
]
