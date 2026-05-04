import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from model_bakery import baker

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user(db):
    return baker.make(User, username='testuser', email='test@example.com')

@pytest.fixture
def auth_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client
