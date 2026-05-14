import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print(f"Total users: {User.objects.count()}")
for user in User.objects.all():
    status = []
    if user.is_staff: status.append("Staff")
    if user.is_superuser: status.append("Superuser")
    status_str = f" [{', '.join(status)}]" if status else ""
    print(f"- {user.email} (ID: {user.id}){status_str}")
