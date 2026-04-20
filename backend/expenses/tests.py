import pytest
from django.urls import reverse
from model_bakery import baker
from expenses.models import Expense, Category

@pytest.mark.django_db
def test_expense_list_authenticated(auth_client, test_user):
    # Create some expenses
    baker.make(Expense, user=test_user, _quantity=5)
    
    url = reverse('expense-list')
    response = auth_client.get(url)
    
    assert response.status_code == 200
    assert len(response.data['results']) == 5

@pytest.mark.django_db
def test_expense_pagination_cap(auth_client, test_user):
    # Create more than the cap
    baker.make(Expense, user=test_user, _quantity=150)
    
    url = reverse('expense-list')
    response = auth_client.get(url, {'page_size': 200})
    
    assert response.status_code == 200
    # Should be capped at 100
    assert len(response.data['results']) == 100

@pytest.mark.django_db
def test_expense_create(auth_client, test_user):
    category = baker.make(Category, user=test_user, name="Food")
    url = reverse('expense-list')
    data = {
        "title": "Lunch",
        "amount": 50.0,
        "date": "2024-01-01",
        "category": category.id
    }
    response = auth_client.post(url, data)
    assert response.status_code == 201
    assert Expense.objects.filter(user=test_user, title="Lunch").exists()
