from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Remove admin privileges from a user by email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email address of the user to demote')

    def handle(self, *args, **options):
        User = get_user_model()
        email = options['email'].strip().lower()

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            self.stdout.write(self.style.WARNING(f'[SKIP] No user found with email: {email}'))
            return

        if not user.is_staff and not user.is_superuser:
            self.stdout.write(self.style.WARNING(f'[SKIP] {email} is already a regular user. No changes made.'))
            return

        user.is_staff = False
        user.is_superuser = False
        user.save(update_fields=['is_staff', 'is_superuser'])

        self.stdout.write(self.style.SUCCESS(f'[OK] {email} demoted to regular user.'))
        self.stdout.write(f'   is_staff     = False')
        self.stdout.write(f'   is_superuser = False')
