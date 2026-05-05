from rest_framework import serializers
from .models import Expense
from categories.serializers import CategorySerializer
from categories.models import Category

class ExpenseSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category', 
        write_only=True,
        required=False,
        allow_null=True
    )
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'currency', 'category', 'category_id', 'date',
            'notes', 'is_recurring', 'recurrence_type', 'created_at', 'updated_at', 'user'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Scope category queryset to current user's categories only
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['category_id'].queryset = Category.objects.filter(user=request.user)

    def validate_category_id(self, value):
        if value is None:
            return None
        request = self.context.get('request')
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("Invalid category.")
        return value

    def validate(self, data):
        if data.get('is_recurring') and data.get('recurrence_type') == 'none':
            raise serializers.ValidationError({"recurrence_type": "Recurring expenses must have a recurrence type."})
        if not data.get('is_recurring') and data.get('recurrence_type') != 'none':
            data['recurrence_type'] = 'none'
        return data

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be a positive number.")
        return value
