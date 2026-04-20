from rest_framework import serializers
from .models import Income
from categories.serializers import CategorySerializer
from categories.models import Category

class IncomeSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(), source='category', write_only=True, required=False, allow_null=True
    )
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Income
        fields = ['id', 'source', 'amount', 'category', 'category_id', 'date', 'description', 'is_recurring', 'recurrence_type', 'created_at']
        read_only_fields = ['id', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['category_id'].queryset = Category.objects.filter(user=request.user)

    def validate(self, data):
        if data.get('is_recurring') and data.get('recurrence_type') == 'none':
            raise serializers.ValidationError({"recurrence_type": "Recurring incomes must have a recurrence type."})
        return data

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be a positive number.")
        return value
