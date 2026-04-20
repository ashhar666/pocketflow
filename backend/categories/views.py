from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from .models import Category
from .serializers import CategorySerializer
from rest_framework.exceptions import ValidationError

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        from django.db.models import Q
        return Category.objects.filter(user=self.request.user).annotate(
            transaction_count=Count('expenses', distinct=True) + Count('incomes', distinct=True)
        ).order_by('name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()
