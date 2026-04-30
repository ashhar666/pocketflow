import logging
import os
from django.core.management.base import BaseCommand
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Test email configuration and send a test email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='test@example.com',
            help='Email address to send test email to'
        )

    def handle(self, *args, **options):
        test_email = options['email']
        
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('PocketFlow Email Configuration Test'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Check email backend
        self.stdout.write('\n[1] Email Backend Configuration')
        self.stdout.write('-' * 60)
        email_backend = settings.EMAIL_BACKEND
        self.stdout.write(f"Backend: {email_backend}")
        
        if 'console' in email_backend:
            self.stdout.write(self.style.WARNING(
                "⚠️  Using Console Backend (emails print to console)"
            ))
            self.stdout.write(self.style.WARNING(
                "   To enable real emails, set EMAIL_HOST_USER in .env"
            ))
        elif 'smtp' in email_backend:
            self.stdout.write(self.style.SUCCESS("✓ SMTP Backend configured"))
            self.stdout.write(f"   Host: {settings.EMAIL_HOST}")
            self.stdout.write(f"   Port: {settings.EMAIL_PORT}")
            self.stdout.write(f"   Use TLS: {settings.EMAIL_USE_TLS}")
            self.stdout.write(f"   Use SSL: {settings.EMAIL_USE_SSL}")
            self.stdout.write(f"   From Email: {settings.DEFAULT_FROM_EMAIL}")
        
        # Check environment variables
        self.stdout.write('\n[2] Environment Variables')
        self.stdout.write('-' * 60)
        
        env_vars = {
            'EMAIL_HOST_USER': os.getenv('EMAIL_HOST_USER', 'NOT SET'),
            'EMAIL_HOST_PASSWORD': '***' if os.getenv('EMAIL_HOST_PASSWORD') else 'NOT SET',
            'DEFAULT_FROM_EMAIL': os.getenv('DEFAULT_FROM_EMAIL', settings.DEFAULT_FROM_EMAIL),
            'FRONTEND_URL': os.getenv('FRONTEND_URL', settings.FRONTEND_URL),
            'DEBUG': os.getenv('DEBUG', 'False'),
        }
        
        for key, value in env_vars.items():
            status = self.style.WARNING("⚠️") if value == 'NOT SET' else self.style.SUCCESS("✓")
            self.stdout.write(f"{status} {key}: {value}")
        
        # Send test email
        self.stdout.write('\n[3] Sending Test Email')
        self.stdout.write('-' * 60)
        
        try:
            subject = "PocketFlow - Test Email"
            text_body = "This is a test email from PocketFlow."
            html_body = """
            <html>
                <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
                        <h2>PocketFlow Email Test</h2>
                        <p>If you see this, emails are working correctly! ✓</p>
                        <p style="color: #999; font-size: 12px;">
                            Backend: {}<br>
                            From: {}<br>
                            To: {}
                        </p>
                    </div>
                </body>
            </html>
            """.format(settings.EMAIL_BACKEND, settings.DEFAULT_FROM_EMAIL, test_email)
            
            msg = EmailMultiAlternatives(
                subject,
                text_body,
                settings.DEFAULT_FROM_EMAIL,
                [test_email]
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send(fail_silently=False)
            
            self.stdout.write(self.style.SUCCESS(f"✓ Test email sent to {test_email}"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ Failed to send email: {str(e)}"))
            logger.exception("Email sending failed")
        
        # Summary
        self.stdout.write('\n[4] Database Check')
        self.stdout.write('-' * 60)
        
        user_count = User.objects.count()
        self.stdout.write(f"Total users in database: {user_count}")
        
        if user_count > 0:
            self.stdout.write("\nSample users:")
            for user in User.objects.all()[:5]:
                reset_token_set = bool(user.password_reset_token)
                self.stdout.write(
                    f"  • {user.email} (Reset token: {'YES' if reset_token_set else 'NO'})"
                )
        
        # Instructions
        self.stdout.write('\n[5] Configuration Instructions')
        self.stdout.write('-' * 60)
        
        if 'console' in settings.EMAIL_BACKEND:
            self.stdout.write(self.style.WARNING(
                """
To enable real email sending (SMTP):

1. Enable 2FA on your Gmail account:
   https://myaccount.google.com/security

2. Create an App Password:
   https://myaccount.google.com/apppasswords
   (Select "Mail" and "Windows Computer")

3. Add to your .env file:
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-16-char-app-password
   DEFAULT_FROM_EMAIL=PocketFlow <your-email@gmail.com>

4. Restart the Django server

5. Run this test again:
   python manage.py test_email
                """
            ))
        
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('Test Complete'))
        self.stdout.write('=' * 60 + '\n')
