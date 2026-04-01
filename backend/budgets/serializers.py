from rest_framework import serializers
from .models import Budget
from categories.serializers import CategorySerializer
from categories.models import Category

class BudgetSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    category = CategorySerializer(read_only=True)
    spent_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'category', 'category_id', 'monthly_limit', 'month', 'year', 'spent_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_category_id(self, value):
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("Invalid category.")
        return value
        
    def validate(self, data):
        # Ensure a budget for this category, month, and year doesn't already exist for this user on creation
        request = self.context.get('request')
        if request and request.method == 'POST':
            category = data.get('category')
            month = data.get('month', getattr(self.instance, 'month', None))
            year = data.get('year', getattr(self.instance, 'year', None))
            
            if Budget.objects.filter(user=request.user, category=category, month=month, year=year).exists():
                raise serializers.ValidationError("A budget for this category already exists for this month.")
        return data
