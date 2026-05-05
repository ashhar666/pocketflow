import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from model_bakery import baker

User = get_user_model()

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
