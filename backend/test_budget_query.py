import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from budgets.models import Budget
from expenses.models import Expense
from django.db.models import OuterRef, Subquery, Sum
from django.db.models.functions import Coalesce

User = get_user_model()
user = User.objects.first()

if not user:
    print("No user found.")
    sys.exit(0)

print(f"Testing for user: {user.email}")

expenses_sum = Expense.objects.filter(
    category=OuterRef('category'),
    user=user,
    date__month=OuterRef('month'),
    date__year=OuterRef('year')
).values('category').annotate(
    total=Sum('amount')
).values('total')

qs = Budget.objects.filter(user=user).annotate(
    spent_amount=Coalesce(Subquery(expenses_sum), 0.0)
).order_by('-year', '-month')

try:
    results = list(qs)
    print("Success! Budgets:")
    for b in results:
        print(f"- {b.category.name}: Limit={b.monthly_limit}, Spent={b.spent_amount}")
except Exception as e:
    print(f"ERROR OCCURRED: {type(e).__name__}: {str(e)}")
