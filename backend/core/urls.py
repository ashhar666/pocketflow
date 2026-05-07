from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    checks = {
        'status': 'healthy',
        'database': 'unknown',
    }
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks['database'] = 'ok'
        checks['vendor'] = connection.vendor
        checks['db_name'] = connection.settings_dict.get('NAME', 'unknown')
    except Exception as e:
        checks['database'] = 'error'
        checks['error'] = str(e)
        checks['status'] = 'unhealthy'
    
    status_code = 200 if checks['status'] == 'healthy' else 503
    return JsonResponse(checks, status=status_code)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda r: JsonResponse({'status': 'PocketFlow API is running', 'version': '1.0.0'})),
    path('api/health/',     health_check),
    path('api/auth/',       include('users.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/expenses/',   include('expenses.urls')),
    path('api/budgets/',    include('budgets.urls')),
    path('api/savings/',    include('savings.urls')),
    path('api/summary/',    include('summary.urls')),
    path('api/income/',     include('income.urls')),
    path('api/telegram/',   include('telegram_bot.urls')),
]
