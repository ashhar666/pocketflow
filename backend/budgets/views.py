from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Budget
from .serializers import BudgetSerializer

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['month', 'year', 'category']
    pagination_class = None

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).order_by('-year', '-month')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
