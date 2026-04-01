from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer
from rest_framework.exceptions import ValidationError

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Categories don't need pagination generally, useful for dropdowns

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by('name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        # Allow deletion; associated expenses will be set to NULL (handled by model)
        instance.delete()
