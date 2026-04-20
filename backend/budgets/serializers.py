from rest_framework import serializers
from .models import Budget
from categories.serializers import CategorySerializer
from categories.models import Category

class BudgetSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    category = CategorySerializer(read_only=True)
    spent_amount = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'category', 'category_id', 'monthly_limit', 'month', 'year', 'spent_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_spent_amount(self, obj):
        # Return the injected value if present (from list view), otherwise calculate it fallback
        return getattr(obj, 'spent_amount', None) or obj.spent_amount_calc()

    def validate_category_id(self, value):
        request = self.context.get('request')
        if value.user != request.user:
            raise serializers.ValidationError("Invalid category.")
        return value
        
    def validate(self, data):
        # Ensure a budget for this category/month/year doesn't already exist (on creation)
        request = self.context.get('request')
        if request and request.method == 'POST':
            from datetime import datetime
            now = datetime.now()
            category = data.get('category')
            month = data.get('month') or now.month
            year = data.get('year') or now.year

            if Budget.objects.filter(user=request.user, category=category, month=month, year=year).exists():
                raise serializers.ValidationError(
                    f"A budget for {category.name} already exists for {now.strftime('%B %Y')}."
                )
        return data
