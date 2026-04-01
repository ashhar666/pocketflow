from rest_framework import serializers
from .models import Income

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'source', 'amount', 'date', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']
