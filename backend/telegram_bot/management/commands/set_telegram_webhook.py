import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Register the Telegram webhook URL with the Bot API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--url',
            required=True,
            help='Full public HTTPS URL of the webhook, e.g. https://xxxx.ngrok.io/api/telegram/webhook/',
        )

    def handle(self, *args, **options):
        token = settings.TELEGRAM_BOT_TOKEN
        if not token:
            raise CommandError(
                'TELEGRAM_BOT_TOKEN is not set in .env — cannot register webhook.'
            )

        webhook_url = options['url']
        if not webhook_url.startswith('https://'):
            raise CommandError('Telegram requires an HTTPS URL. Make sure you are using ngrok or similar.')

        api_url = f'https://api.telegram.org/bot{token}/setWebhook'
        payload = {'url': webhook_url}
        if settings.TELEGRAM_WEBHOOK_SECRET:
            payload['secret_token'] = settings.TELEGRAM_WEBHOOK_SECRET
        try:
            response = requests.post(api_url, json=payload, timeout=15)
            data = response.json()
        except requests.exceptions.RequestException as exc:
            raise CommandError(f'Request to Telegram API failed: {exc}')

        if data.get('ok'):
            self.stdout.write(self.style.SUCCESS(
                f'Webhook set successfully!\n'
                f'   URL: {webhook_url}\n'
                f'   Response: {data.get("description", "OK")}'
            ))
        else:
            raise CommandError(
                f'Telegram API rejected the webhook:\n'
                f'  error_code: {data.get("error_code")}\n'
                f'  description: {data.get("description")}'
            )
