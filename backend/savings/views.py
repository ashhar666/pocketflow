from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SavingsGoal
from .serializers import SavingsGoalSerializer

class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def add_money(self, request, pk=None):
        goal = self.get_object()
        amount = request.data.get('amount')

        if not amount:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError("Amount must be positive")
        except (TypeError, ValueError):
            return Response({"error": "Amount must be a positive number"}, status=status.HTTP_400_BAD_REQUEST)

        goal.current_amount = float(goal.current_amount) + amount

        # Warn if overfunded
        overfunded = False
        if goal.current_amount > float(goal.target_amount):
            overfunded = True

        goal.save()

        serializer = self.get_serializer(goal)
        response_data = serializer.data
        if overfunded:
            response_data['warning'] = 'Current amount exceeds target amount'
        return Response(response_data)
