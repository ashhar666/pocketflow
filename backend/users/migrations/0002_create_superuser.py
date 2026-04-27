from django.db import migrations


def noop(apps, schema_editor):
    """
    This migration used to create a hardcoded superuser.
    It is now a no-op — the user creation has been removed for security.
    The migration file is kept to preserve the dependency chain.
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(noop, migrations.RunPython.noop),
    ]
