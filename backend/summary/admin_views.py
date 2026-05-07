from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from expenses.models import Expense
from income.models import Income
from users.models import SupportMessage

User = get_user_model()

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        
        # Basic Counts
        total_users = User.objects.count()
        total_expenses = Expense.objects.count()
        total_income = Income.objects.count()
        
        # Financial Totals (Simplified, ignoring currency conversion for now)
        total_expense_amount = Expense.objects.aggregate(total=Sum('amount'))['total'] or 0
        total_income_amount = Income.objects.aggregate(total=Sum('amount'))['total'] or 0
        
        # Registration Trend (Last 7 days)
        seven_days_ago = now - timedelta(days=7)
        registrations = (
            User.objects.filter(date_joined__gte=seven_days_ago)
            .extra(select={'day': "date(date_joined)"})
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        
        # Format Trend Data
        trend_data = []
        for i in range(8):
            day = (seven_days_ago + timedelta(days=i)).date()
            count = next((item['count'] for item in registrations if str(item['day']) == str(day)), 0)
            trend_data.append({
                'date': day.strftime('%b %d'),
                'count': count
            })

        return Response({
            'total_users': total_users,
            'total_expenses': total_expenses,
            'total_income': total_income,
            'total_expense_amount': total_expense_amount,
            'total_income_amount': total_income_amount,
            'registration_trend': trend_data,
        })

class AdminSupportMessagesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        messages = SupportMessage.objects.all()[:50]
        data = [{
            'id': m.id,
            'sender_email': m.sender_email,
            'message': m.message,
            'created_at': m.created_at,
            'email_sent': m.email_sent
        } for m in messages]
        return Response(data)
