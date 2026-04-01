from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=50)
    icon = models.CharField(max_length=50) # Lucide icon name or emoji
    color = models.CharField(max_length=10) # hex
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'name')
        verbose_name_plural = 'categories'

    def __str__(self):
        return f"{self.icon} {self.name}"
