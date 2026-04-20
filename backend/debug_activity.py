import os
import django
import sys

# Set up Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from summary.dashboard_views import RecentActivityView
from rest_framework.test import APIRequestFactory, force_authenticate
import traceback
import json

User = get_user_model()
user = User.objects.first()

if not user:
    print("No users found.")
    sys.exit(0)

print(f"Verifying RecentActivityView for user: {user.username}")

factory = APIRequestFactory()
request = factory.get('/api/summary/activity/')
force_authenticate(request, user=user)

view = RecentActivityView.as_view()
try:
    response = view(request)
    print("Status:", response.status_code)
    # Use json.dumps to handle Decimals if any (though we converted to float)
    # print(json.dumps(response.data, indent=2))
    for item in response.data:
        print(f"[{item['type'].upper()}] {item['date']} - {item['title']}: {item['amount']}")
except Exception as e:
    print("ERROR:")
    traceback.print_exc()
