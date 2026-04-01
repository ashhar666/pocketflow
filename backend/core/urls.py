from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/budgets/', include('budgets.urls')),
    path('api/savings/', include('savings.urls')),
    path('api/summary/', include('summary.urls')),
    path('api/income/', include('income.urls')),
]
