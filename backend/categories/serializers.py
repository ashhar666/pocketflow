from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        request = self.context.get('request')
        if not request:
            return value
        
        user = request.user
        category_id = self.instance.id if self.instance else None
        
        query = Category.objects.filter(user=user, name__iexact=value)
        if category_id:
            query = query.exclude(id=category_id)
            
        if query.exists():
            raise serializers.ValidationError("You already have a category with this name.")
        
        return value
