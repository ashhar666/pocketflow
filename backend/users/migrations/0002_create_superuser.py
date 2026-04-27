from django.db import migrations
from django.contrib.auth import get_user_model
import os

def create_superuser(apps, schema_editor):
    User = get_user_model()
    username = 'admin'
    email = 'ashharshahan666@gmail.com'
    password = 'PocketFlowAdmin2026!'
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"Superuser {username} created successfully.")
    else:
        print(f"Superuser {username} already exists.")

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]
