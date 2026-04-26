from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

# We must import Category inside the receiver or locally to avoid circular imports 
# depending on app load order, or import it here if it's safe.
from categories.models import Category

User = get_user_model()

@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    if created:
        default_categories = [
            {'name': 'Food', 'icon': '🍔', 'color': '#EF4444'},
            {'name': 'Transport', 'icon': '🚗', 'color': '#3B82F6'},
            {'name': 'Shopping', 'icon': '🛍️', 'color': '#EC4899'},
            {'name': 'Health', 'icon': '💊', 'color': '#10B981'},
            {'name': 'Entertainment', 'icon': '🎬', 'color': '#8B5CF6'},
            {'name': 'Bills', 'icon': '💡', 'color': '#F59E0B'},
            {'name': 'Education', 'icon': '📚', 'color': '#6366F1'},
            {'name': 'Other', 'icon': '📦', 'color': '#6B7280'},
        ]
        
        categories_to_create = [
            Category(user=instance, name=cat['name'], icon=cat['icon'], color=cat['color'])
            for cat in default_categories
        ]
        
        Category.objects.bulk_create(categories_to_create)
