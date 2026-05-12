from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Promote a user to admin (is_staff=True, is_superuser=True) by email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email address of the user to promote')

    def handle(self, *args, **options):
        User = get_user_model()
        email = options['email'].strip().lower()

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'[ERROR] No user found with email: {email}'))
            self.stdout.write('Make sure the user has registered on the platform first.')
            return

        if user.is_staff and user.is_superuser:
            self.stdout.write(self.style.WARNING(f'[SKIP] {email} is already an admin. No changes made.'))
            return

        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(update_fields=['is_staff', 'is_superuser', 'is_active'])

        self.stdout.write(self.style.SUCCESS(f'[OK] Successfully promoted {email} to admin!'))
        self.stdout.write(f'   is_staff     = True')
        self.stdout.write(f'   is_superuser = True')
        self.stdout.write(f'   is_active    = True')
