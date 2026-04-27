from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Category(models.Model):
    TYPE_CHOICES = [
        ('EXPENSE', 'Expense'),
        ('INCOME', 'Income'),
        ('BOTH', 'Both'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=50)
    icon = models.CharField(max_length=50) # Lucide icon name or emoji
    color = models.CharField(max_length=10) # hex
    category_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='EXPENSE')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'name')
        verbose_name_plural = 'categories'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['user', 'category_type']),
        ]

    def __str__(self):
        return f"{self.icon} {self.name} ({self.category_type})"
