from django.db import models
from django.contrib.auth import get_user_model
from categories.models import Category
from datetime import datetime

User = get_user_model()

def current_month():
    return datetime.now().month

def current_year():
    return datetime.now().year

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.IntegerField(default=current_month)
    year = models.IntegerField(default=current_year)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')

    def __str__(self):
        return f"{self.category.name} Budget - {self.month}/{self.year}"

    @property
    def spent_amount(self):
        from expenses.models import Expense
        from django.db.models import Sum
        expenses = Expense.objects.filter(
            user=self.user,
            category=self.category,
            date__year=self.year,
            date__month=self.month
        ).aggregate(total=Sum('amount'))
        return expenses['total'] or 0.00
