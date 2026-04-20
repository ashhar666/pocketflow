from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
import calendar
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from itertools import chain

from expenses.models import Expense
from budgets.models import Budget
from income.models import Income
from savings.models import SavingsGoal
from expenses.serializers import ExpenseSerializer
from income.serializers import IncomeSerializer

class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            incomes = Income.objects.filter(user=request.user).order_by('-date', '-created_at')[:10]
            expenses = Expense.objects.filter(user=request.user).order_by('-date', '-created_at')[:10]

            # Pass context to serializers for better consistency
            income_data = IncomeSerializer(incomes, many=True, context={'request': request}).data
            expense_data = ExpenseSerializer(expenses, many=True, context={'request': request}).data

            normalized_data = []
            
            for item in income_data:
                normalized_data.append({
                    'id': item.get('id'),
                    'type': 'income',
                    'title': item.get('source') or 'Untitled Income',
                    'amount': float(item.get('amount', 0)),
                    'date': item.get('date'),
                    'created_at': item.get('created_at', ''),
                    'category': item.get('category'),
                })

            for item in expense_data:
                normalized_data.append({
                    'id': item.get('id'),
                    'type': 'expense',
                    'title': item.get('title') or 'Untitled Expense',
                    'amount': float(item.get('amount', 0)),
                    'date': item.get('date'),
                    'created_at': item.get('created_at', ''),
                    'category': item.get('category'),
                })

            # Robust sorting
            activity = sorted(
                normalized_data,
                key=lambda x: (str(x.get('date') or '0000-00-00'), str(x.get('created_at') or '')),
                reverse=True
            )[:10]

            return Response(activity)
        except Exception as e:
            import traceback
            print(f"RecentActivityView Error: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": "Failed to load activity"}, status=500)


class MonthlySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_previous_month_defaults(self, today):
        first_of_current = today.replace(day=1)
        end_of_prev = first_of_current - timedelta(days=1)
        start_of_prev = end_of_prev.replace(day=1)
        return start_of_prev, end_of_prev

    def get(self, request):
        today = timezone.now().date()
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if start_date_str and end_date_str:
            try:
                from datetime import datetime
                start_of_month = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_of_month = datetime.strptime(end_date_str, '%Y-%m-%d').date()

                delta = (end_of_month - start_of_month).days + 1
                start_of_prev = start_of_month - timedelta(days=delta)
                end_of_prev = start_of_month - timedelta(days=1)
            except ValueError:
                start_of_month = today.replace(day=1)
                _, last_day = calendar.monthrange(today.year, today.month)
                end_of_month = today.replace(day=last_day)
                start_of_prev, end_of_prev = self._get_previous_month_defaults(today)
        else:
            start_of_month = today.replace(day=1)
            _, last_day = calendar.monthrange(today.year, today.month)
            end_of_month = today.replace(day=last_day)
            start_of_prev, end_of_prev = self._get_previous_month_defaults(today)

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

        current_total = current_expenses.aggregate(total=Sum('amount'))['total'] or 0
        prev_total = prev_expenses.aggregate(total=Sum('amount'))['total'] or 0

        percentage_change = 0
        if prev_total > 0:
            percentage_change = ((float(current_total) - float(prev_total)) / float(prev_total)) * 100
        elif current_total > 0:
            percentage_change = 100

        income_percentage_change = 0
        if prev_income_total > 0:
            income_percentage_change = ((float(current_income_total) - float(prev_income_total)) / float(prev_income_total)) * 100
        elif current_income_total > 0:
            income_percentage_change = 100

        total_savings = SavingsGoal.objects.filter(user=request.user).aggregate(total=Sum('current_amount'))['total'] or 0

        all_income = Income.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        all_expenses = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total'] or 0
        total_balance = float(all_income) - float(all_expenses)

        category_data = []
        category_sums = current_expenses.values('category__name', 'category__color').annotate(amount=Sum('amount'))
        for entry in category_sums:
            if entry['category__name']:
                category_data.append({
                    'name': entry['category__name'],
                    'amount': float(entry['amount']),
                    'color': entry['category__color']
                })

        income_category_data = []
        income_category_sums = current_incomes.values('category__name', 'category__color').annotate(amount=Sum('amount'))
        for entry in income_category_sums:
            if entry['category__name']:
                income_category_data.append({
                    'name': entry['category__name'],
                    'amount': float(entry['amount']),
                    'color': entry['category__color']
                })
            else:
                income_category_data.append({
                    'name': 'Uncategorized',
                    'amount': float(entry['amount']),
                    'color': '#71717a' # zinc-500
                })

        return Response({
            'current_month_total': float(current_total),
            'previous_month_total': float(prev_total),
            'percentage_change': percentage_change,
            'current_income_total': float(current_income_total),
            'income_percentage_change': income_percentage_change,
            'total_savings': float(total_savings),
            'total_balance': float(total_balance),
            'by_category': category_data,
            'income_by_category': income_category_data
        })

class WeeklySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')

            if not start_date_str or not end_date_str:
                today = timezone.now().date()
                start_date = today - timedelta(days=today.weekday())
                end_date = today
            else:
                try:
                    from datetime import datetime
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                except ValueError:
                    today = timezone.now().date()
                    start_date = today - timedelta(days=today.weekday())
                    end_date = today

            expenses = Expense.objects.filter(
                user=request.user,
                date__gte=start_date,
                date__lte=end_date
            )
            incomes = Income.objects.filter(
                user=request.user,
                date__gte=start_date,
                date__lte=end_date
            )

            delta = (end_date - start_date).days + 1
            daily_data = []

            for i in range(delta):
                current_day = start_date + timedelta(days=i)
                exp_total = expenses.filter(date=current_day).aggregate(total=Sum('amount'))['total'] or 0
                inc_total = incomes.filter(date=current_day).aggregate(total=Sum('amount'))['total'] or 0
                daily_data.append({
                    'day': current_day.strftime('%a %d'),
                    'expense': float(exp_total),
                    'income': float(inc_total),
                    'full_date': current_day.strftime('%Y-%m-%d')
                })

            return Response(daily_data)
        except Exception as e:
            import traceback
            print("WeeklySummaryView Error:", traceback.format_exc())
            return Response({"error": str(e)}, status=500)

class TrendSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        data = []
        for i in range(5, -1, -1):
            y = today.year
            m = today.month - i
            while m <= 0:
                m += 12
                y -= 1

            import calendar
            last_day = calendar.monthrange(y, m)[1]

            from datetime import date
            start_date = date(y, m, 1)
            end_date = date(y, m, last_day)

            exp_total = Expense.objects.filter(
                user=request.user,
                date__gte=start_date,
                date__lte=end_date
            ).aggregate(total=Sum('amount'))['total'] or 0

            inc_total = Income.objects.filter(
                user=request.user,
                date__gte=start_date,
                date__lte=end_date
            ).aggregate(total=Sum('amount'))['total'] or 0

            month_name = calendar.month_abbr[m]
            data.append({
                'month': month_name + ' ' + str(y),
                'amount': float(exp_total),
                'income': float(inc_total),
                'expense': float(exp_total)
            })

        return Response(data)

class InsightsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        insights = []
        today = timezone.now().date()
        start_of_month = today.replace(day=1)

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
                "message": "Your biggest spending day this week was " + day_name + " (Rs." + str(round(float(biggest_day['total']), 2)) + ")"
            })

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
                        "message": "You've spent " + str(round(percentage, 1)) + "% of your " + budget.category.name + " budget!"
                    })
                elif percentage >= 75:
                    insights.append({
                        "type": "warning",
                        "message": "You're approaching your " + budget.category.name + " budget limit (" + str(round(percentage, 1)) + "%)."
                    })

        if not insights:
            insights.append({
                "type": "success",
                "message": "You're doing great! No immediate budget warnings."
            })

        return Response(insights)
