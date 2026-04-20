from django.urls import path
from .dashboard_views import (
    RecentActivityView, 
    MonthlySummaryView, 
    WeeklySummaryView, 
    TrendSummaryView, 
    InsightsSummaryView
)
from .report_views import DownloadReportView, ComparisonReportView
from .comparison_views import ComparisonSummaryView

urlpatterns = [
    path('activity/', RecentActivityView.as_view(), name='recent-activity'),
    path('recent-activity/', RecentActivityView.as_view(), name='recent-activity-alias'),

    path('monthly/', MonthlySummaryView.as_view(), name='monthly-summary'),
    path('weekly/', WeeklySummaryView.as_view(), name='weekly-summary'),
    path('trend/', TrendSummaryView.as_view(), name='trend-summary'),
    path('insights/', InsightsSummaryView.as_view(), name='insights-summary'),
    path('export/', DownloadReportView.as_view(), name='download-report'),
    path('comparison/', ComparisonSummaryView.as_view(), name='comparison-summary'),
    path('comparison-report/', ComparisonReportView.as_view(), name='comparison-report'),
]
