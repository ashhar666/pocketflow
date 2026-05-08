from django.db import migrations


def promote_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    email = 'ashharshahan666@gmail.com'
    try:
        user = User.objects.get(email=email)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"[MIGRATION] Promoted {email} to staff/superuser.")
    except User.DoesNotExist:
        print(f"[MIGRATION] User {email} not found — skipping.")


def demote_admin(apps, schema_editor):
    """Reverse: remove staff/superuser status."""
    User = apps.get_model('users', 'User')
    email = 'ashharshahan666@gmail.com'
    try:
        user = User.objects.get(email=email)
        user.is_staff = False
        user.is_superuser = False
        user.save()
    except User.DoesNotExist:
        pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_user_preferred_currency'),
    ]

    operations = [
        migrations.RunPython(promote_admin, demote_admin),
    ]
