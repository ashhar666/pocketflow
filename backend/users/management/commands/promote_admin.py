from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
    help = 'Promote a user to admin and optionally set a password (works for Google OAuth accounts too)'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email address of the user to promote')
        parser.add_argument(
            '--password',
            type=str,
            default=None,
            help='Set a Django password for this account (required for Google OAuth users to login via admin portal)',
        )

    def handle(self, *args, **options):
        User = get_user_model()
        email = options['email'].strip().lower()
        password = options.get('password') or os.getenv('ADMIN_PORTAL_PASSWORD')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'[ERROR] No user found with email: {email}'))
            self.stdout.write('Make sure the user has registered on the platform first.')
            return

        changed = []

        if not user.is_staff:
            user.is_staff = True
            changed.append('is_staff')
        if not user.is_superuser:
            user.is_superuser = True
            changed.append('is_superuser')
        if not user.is_active:
            user.is_active = True
            changed.append('is_active')

        # Set password — needed for Google OAuth accounts that have no usable password
        if password:
            user.set_password(password)
            changed.append('password')
            self.stdout.write(self.style.SUCCESS(f'[OK] Password set for {email}'))
        elif not user.has_usable_password():
            self.stdout.write(self.style.WARNING(
                f'[WARN] {email} has no usable password (Google OAuth account). '
                f'Set ADMIN_PORTAL_PASSWORD env var or pass --password to enable admin login.'
            ))

        if changed:
            user.save()
            self.stdout.write(self.style.SUCCESS(f'[OK] {email} promoted to admin! Updated: {", ".join(changed)}'))
        else:
            self.stdout.write(self.style.WARNING(f'[SKIP] {email} is already fully configured. No changes needed.'))
