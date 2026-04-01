from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
import calendar
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from expenses.models import Expense
from budgets.models import Budget
from income.models import Income
from savings.models import SavingsGoal

class MonthlySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        
        # Current month
        start_of_month = today.replace(day=1)
        _, last_day = calendar.monthrange(today.year, today.month)
        end_of_month = today.replace(day=last_day)
        
        # Previous month
        if today.month == 1:
            start_of_prev = today.replace(year=today.year-1, month=12, day=1)
            _, last_prev_day = calendar.monthrange(today.year-1, 12)
            end_of_prev = today.replace(year=today.year-1, month=12, day=last_prev_day)
        else:
            start_of_prev = today.replace(month=today.month-1, day=1)
            _, last_prev_day = calendar.monthrange(today.year, today.month-1)
            end_of_prev = today.replace(month=today.month-1, day=last_prev_day)

        # Get expenses
        current_expenses = Expense.objects.filter(
            user=request.user, 
            date__gte=start_of_month, 
            date__lte=end_of_month
        )
        prev_expenses = Expense.objects.filter(
            user=request.user, 
            date__gte=start_of_prev, 
            date__lte=end_of_prev
        )

        # Get Income
        current_incomes = Income.objects.filter(
            user=request.user,
            date__gte=start_of_month,
            date__lte=end_of_month
        )
        prev_incomes = Income.objects.filter(
            user=request.user,
            date__gte=start_of_prev,
            date__lte=end_of_prev
        )

        current_income_total = current_incomes.aggregate(total=Sum('amount'))['total'] or 0
        prev_income_total = prev_incomes.aggregate(total=Sum('amount'))['total'] or 0

        # Expense totals
        current_total = current_expenses.aggregate(total=Sum('amount'))['total'] or 0
        prev_total = prev_expenses.aggregate(total=Sum('amount'))['total'] or 0

        # Percentage change check for expenses
        percentage_change = 0
        if prev_total > 0:
            percentage_change = ((float(current_total) - float(prev_total)) / float(prev_total)) * 100
        elif current_total > 0:
            percentage_change = 100

        # Percentage change check for income
        income_percentage_change = 0
        if prev_income_total > 0:
            income_percentage_change = ((float(current_income_total) - float(prev_income_total)) / float(prev_income_total)) * 100
        elif current_income_total > 0:
            income_percentage_change = 100

        # Budget/Savings stats
        total_savings = SavingsGoal.objects.filter(user=request.user).aggregate(total=Sum('current_amount'))['total'] or 0
        
        # Balance = Total All Income - Total All Expenses
        all_income = Income.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        all_expenses = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        total_balance = float(all_income) - float(all_expenses)

        # Expenses by category
        category_data = []
        category_sums = current_expenses.values('category__name', 'category__color').annotate(amount=Sum('amount'))
        for entry in category_sums:
            category_data.append({
                'name': entry['category__name'],
                'amount': float(entry['amount']),
                'color': entry['category__color']
            })

        return Response({
            'current_month_total': float(current_total),
            'previous_month_total': float(prev_total),
            'percentage_change': percentage_change,
            'current_income_total': float(current_income_total),
            'income_percentage_change': income_percentage_change,
            'total_savings': float(total_savings),
            'total_balance': float(total_balance),
            'by_category': category_data
        })

class WeeklySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday()) # Monday
        end_of_week = start_of_week + timedelta(days=6) # Sunday

        expenses = Expense.objects.filter(
            user=request.user,
            date__gte=start_of_week,
            date__lte=end_of_week
        )

        daily_totals = {i: 0 for i in range(7)}
        for exp in expenses:
            day_idx = (exp.date - start_of_week).days
            daily_totals[day_idx] += float(exp.amount)

        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        week_data = [{'day': days[i], 'amount': daily_totals[i]} for i in range(7)]

        return Response(week_data)

class TrendSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        data = []

        # Get last 6 months including current
        for i in range(5, -1, -1):
            if today.month - i <= 0:
                m = today.month - i + 12
                y = today.year - 1
            else:
                m = today.month - i
                y = today.year
            
            _, last_day = calendar.monthrange(y, m)
            start_date = today.replace(year=y, month=m, day=1)
            end_date = today.replace(year=y, month=m, day=last_day)
            
            total = Expense.objects.filter(
                user=request.user,
                date__gte=start_date,
                date__lte=end_date
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            month_name = calendar.month_abbr[m]
            data.append({
                'month': f"{month_name} {y}",
                'amount': float(total)
            })

        return Response(data)

class InsightsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        insights = []
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        
        # 1. Biggest spending day this week
        start_of_week = today - timedelta(days=today.weekday())
        week_expenses = Expense.objects.filter(
            user=request.user,
            date__gte=start_of_week,
            date__lte=today
        ).values('date').annotate(total=Sum('amount')).order_by('-total')
        
        if week_expenses:
            biggest_day = week_expenses[0]
            day_name = calendar.day_name[biggest_day['date'].weekday()]
            insights.append({
                "type": "warning",
                "message": f"Your biggest spending day this week was {day_name} (₹{biggest_day['total']:.2f})"
            })

        # 2. Approaching budget limit
        budgets = Budget.objects.filter(user=request.user, month=today.month, year=today.year)
        for budget in budgets:
            spent = Expense.objects.filter(
                user=request.user, 
                category=budget.category,
                date__gte=start_of_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            if float(budget.monthly_limit) > 0:
                percentage = (float(spent) / float(budget.monthly_limit)) * 100
                if percentage >= 90:
                    insights.append({
                        "type": "danger",
                        "message": f"⚠️ You've spent {percentage:.1f}% of your {budget.category.name} budget!"
                    })
                elif percentage >= 75:
                    insights.append({
                        "type": "warning",
                        "message": f"You're approaching your {budget.category.name} budget limit ({percentage:.1f}%)."
                    })

        if not insights:
            insights.append({
                "type": "success",
                "message": "You're doing great! No immediate budget warnings."
            })

        return Response(insights)
