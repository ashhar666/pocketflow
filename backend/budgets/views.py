from rest_framework import viewsets, serializers as drf_serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q
from .models import Budget
from .serializers import BudgetSerializer


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['month', 'year', 'category']
    pagination_class = None

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).select_related('category').order_by('-year', '-month')

    def _inject_spent(self, budgets, user):
        """Inject spent_amount onto Budget instances using one aggregate query."""
        from expenses.models import Expense

        if not budgets:
            return

        q_objects = None
        for b in budgets:
            q = Q(category_id=b.category_id, date__year=b.year, date__month=b.month)
            q_objects = q_objects | q if q_objects else q

        expense_totals = Expense.objects.filter(
            user=user
        ).filter(q_objects).values('category_id', 'date__year', 'date__month').annotate(
            total=Sum('amount')
        )

        spent_map = {}
        for row in expense_totals:
            key = (row['category_id'], row['date__year'], row['date__month'])
            spent_map[key] = row['total'] or 0

        for budget in budgets:
            key = (budget.category_id, budget.year, budget.month)
            budget.spent_amount = spent_map.get(key, 0) or 0

    def list(self, request, *args, **kwargs):
        budgets = list(self.filter_queryset(self.get_queryset()))
        if not budgets:
            return Response([])
        self._inject_spent(budgets, request.user)
        serializer = self.get_serializer(budgets, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        self._inject_spent([instance], request.user)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        from django.db import IntegrityError
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            raise drf_serializers.ValidationError(
                {'non_field_errors': ['A budget for this category already exists for this month.']}
            )
