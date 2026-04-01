from django.urls import path
from .views import MonthlySummaryView, WeeklySummaryView, TrendSummaryView, InsightsSummaryView

urlpatterns = [
    path('monthly/', MonthlySummaryView.as_view(), name='summary-monthly'),
    path('weekly/', WeeklySummaryView.as_view(), name='summary-weekly'),
    path('trend/', TrendSummaryView.as_view(), name='summary-trend'),
    path('insights/', InsightsSummaryView.as_view(), name='summary-insights'),
]
