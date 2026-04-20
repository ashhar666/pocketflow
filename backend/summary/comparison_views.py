from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import calendar

from expenses.models import Expense
from categories.models import Category

class ComparisonSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_dummy_data(self):
        return {
            "is_demo": True,
            "total_net_diff": -5420.0,
            "total_net_diff_percent": -12.4,
            "this_month_total": 43500.0,
            "last_month_total": 48920.0,
            "comparison": [
                {"category": "Food & Dining", "this_month": 12450, "last_month": 15600, "diff": -3150, "diff_percent": -20.2, "color": "#f43f5e"},
                {"category": "Transportation", "this_month": 4200, "last_month": 3800, "diff": 400, "diff_percent": 10.5, "color": "#3b82f6"},
                {"category": "Entertainment", "this_month": 2100, "last_month": 4500, "diff": -2400, "diff_percent": -53.3, "color": "#a855f7"},
                {"category": "Shopping", "this_month": 8900, "last_month": 7200, "diff": 1700, "diff_percent": 23.6, "color": "#ec4899"},
                {"category": "Bills & Utilities", "this_month": 15000, "last_month": 15000, "diff": 0, "diff_percent": 0.0, "color": "#eab308"},
                {"category": "Health", "this_month": 1200, "last_month": 3170, "diff": -1970, "diff_percent": -62.1, "color": "#10b981"},
            ]
        }

    def get(self, request):
        try:
            today = timezone.now().date()
            start_cur = today.replace(day=1)
            _, last_day_cur = calendar.monthrange(today.year, today.month)
            end_cur = today.replace(day=last_day_cur)

            # Previous month
            first_of_cur = today.replace(day=1)
            end_prev = first_of_cur - timedelta(days=1)
            start_prev = end_prev.replace(day=1)
            
            # Totals
            cur_total = Expense.objects.filter(user=request.user, date__gte=start_cur, date__lte=end_cur).aggregate(total=Sum('amount'))['total'] or 0
            prev_total = Expense.objects.filter(user=request.user, date__gte=start_prev, date__lte=end_prev).aggregate(total=Sum('amount'))['total'] or 0
            
            # If no data exists for both months, return dummy data
            if cur_total == 0 and prev_total == 0:
                return Response(self._get_dummy_data())

            # Real data logic
            user_categories = Category.objects.filter(user=request.user)
            
            comparison_list = []
            for cat in user_categories:
                cur_cat_total = Expense.objects.filter(user=request.user, category=cat, date__gte=start_cur, date__lte=end_cur).aggregate(total=Sum('amount'))['total'] or 0
                prev_cat_total = Expense.objects.filter(user=request.user, category=cat, date__gte=start_prev, date__lte=end_prev).aggregate(total=Sum('amount'))['total'] or 0
                
                if cur_cat_total > 0 or prev_cat_total > 0:
                    diff = float(cur_cat_total) - float(prev_cat_total)
                    diff_percent = 0
                    if prev_cat_total > 0:
                        diff_percent = (diff / float(prev_cat_total)) * 100
                    elif cur_cat_total > 0:
                        diff_percent = 100

                    comparison_list.append({
                        "category": cat.name,
                        "this_month": float(cur_cat_total),
                        "last_month": float(prev_cat_total),
                        "diff": diff,
                        "diff_percent": round(diff_percent, 1),
                        "color": cat.color
                    })

            total_net_diff = float(cur_total) - float(prev_total)
            total_net_diff_percent = 0
            if prev_total > 0:
                total_net_diff_percent = (total_net_diff / float(prev_total)) * 100
            elif cur_total > 0:
                total_net_diff_percent = 100

            # Sort by absolute difference
            comparison_list.sort(key=lambda x: abs(x['diff']), reverse=True)

            return Response({
                "is_demo": False,
                "total_net_diff": total_net_diff,
                "total_net_diff_percent": round(total_net_diff_percent, 1),
                "this_month_total": float(cur_total),
                "last_month_total": float(prev_total),
                "comparison": comparison_list
            })
        except Exception as e:
            # Fallback to dummy data on error to keep UI alive
            return Response(self._get_dummy_data())
