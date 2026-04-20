import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from rest_framework.test import APIClient
from users.models import User
client = APIClient()
user = User.objects.get(email='ashharshahan666@gmail.com')
client.force_authenticate(user=user)
endpoints = [
    '/api/summary/monthly/',
    '/api/summary/weekly/',
    '/api/summary/trend/',
    '/api/summary/insights/',
    '/api/expenses/?page_size=5'
]
for p in endpoints:
    r = client.get(p)
    print(f"{p}: {r.status_code}")
    if r.status_code != 200:
        print(r.data)
