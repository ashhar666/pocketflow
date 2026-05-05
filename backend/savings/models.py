from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    title = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='INR')
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['deadline', 'created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['user', 'deadline']),
        ]

    def __str__(self):
        return f"{self.title} - {self.current_amount}/{self.target_amount}"
