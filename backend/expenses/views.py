import csv
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Expense
from .serializers import ExpenseSerializer

class ExpensePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'

class ExpenseFilter(filters.FilterSet):
    min_amount = filters.NumberFilter(field_name="amount", lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name="amount", lookup_expr='lte')
    start_date = filters.DateFilter(field_name="date", lookup_expr='gte')
    end_date = filters.DateFilter(field_name="date", lookup_expr='lte')

    class Meta:
        model = Expense
        fields = ['category', 'is_recurring', 'recurrence_type']

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ExpensePagination
    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    filterset_class = ExpenseFilter
    search_fields = ['title', 'notes']
    ordering_fields = ['date', 'amount', 'title']
    ordering = ['-date']

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['GET'])
    def export(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="expenses.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Title', 'Category', 'Amount', 'Recurring', 'Recurrence Type', 'Notes'])
        
        for expense in queryset:
            writer.writerow([
                expense.date,
                expense.title,
                expense.category.name,
                expense.amount,
                'Yes' if expense.is_recurring else 'No',
                expense.recurrence_type,
                expense.notes or ''
            ])
            
        return response
