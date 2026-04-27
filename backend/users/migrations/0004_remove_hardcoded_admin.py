from django.db import migrations


def delete_hardcoded_admin(apps, schema_editor):
    """Remove the admin user that was created by the now-deleted 0002_create_superuser migration."""
    User = apps.get_model('users', 'User')
    deleted_count, _ = User.objects.filter(email='ashharshahan666@gmail.com').delete()
    if deleted_count:
        print(f"[migration] Removed hardcoded admin user (ashharshahan666@gmail.com).")
    else:
        print(f"[migration] Hardcoded admin user not found — nothing to delete.")


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_password_reset_fields'),
    ]

    operations = [
        migrations.RunPython(delete_hardcoded_admin, migrations.RunPython.noop),
    ]
