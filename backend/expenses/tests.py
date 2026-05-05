import json
import pytest
from django.urls import reverse
from model_bakery import baker
from expenses.models import Expense, Category
from expenses.ocr_service import _classify_scan_exception

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
    category = Category.objects.get(user=test_user, name="Food")
    url = reverse('expense-list')
    data = {
        "title": "Lunch",
        "amount": "50.00",
        "date": "2024-01-01",
        "category_id": category.id
    }
    response = auth_client.post(url, data, format='json')
    assert response.status_code == 201
    assert Expense.objects.filter(user=test_user, title="Lunch").exists()


def test_classify_scan_exception_surfaces_invalid_key_reason():
    result = _classify_scan_exception(
        RuntimeError("400 INVALID_ARGUMENT. API Key not found. Please pass a valid API key."),
        model_errors=[
            {
                "model": "gemini-2.5-flash-lite",
                "message": "400 INVALID_ARGUMENT. API Key not found. Please pass a valid API key.",
            }
        ],
    )

    assert result["error_code"] == "gemini_key_invalid"
    assert result["status_code"] == 503
    assert "Gemini rejected the API key" in result["error"]
    assert result["details"]["exception_type"] == "RuntimeError"
    assert "API Key not found" in result["details"]["reason"]
    assert result["details"]["failed_models"][0]["model"] == "gemini-2.5-flash-lite"


def test_classify_scan_exception_masks_exposed_keys():
    leaked_key = "AIzaSyCvnOSrzVH2Nr11qURU23rBvz1fiXIn5GA"
    result = _classify_scan_exception(
        RuntimeError(f"api key expired: {leaked_key}"),
    )

    assert result["error_code"] == "gemini_key_expired"
    assert leaked_key not in result["details"]["reason"]
    assert "REDACTED" in result["details"]["reason"]


def test_classify_scan_exception_handles_invalid_json():
    result = _classify_scan_exception(
        json.JSONDecodeError("Expecting value", "", 0)
    )

    assert result["error_code"] == "gemini_invalid_json"
    assert result["status_code"] == 502
