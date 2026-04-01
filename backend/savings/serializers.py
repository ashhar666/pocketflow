from rest_framework import serializers
from .models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = ['id', 'title', 'target_amount', 'current_amount', 'deadline', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
