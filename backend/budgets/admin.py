from django.contrib import admin
from .models import Budget


def get_spent_amount(obj):
    return obj.spent_amount_calc()

get_spent_amount.short_description = 'Spent Amount'


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display   = ('category', 'user', 'monthly_limit', get_spent_amount, 'month', 'year', 'created_at')
    list_filter    = ('month', 'year', 'category')
    search_fields  = ('user__email', 'category__name')
    ordering       = ('-year', '-month')
    readonly_fields = (get_spent_amount, 'created_at', 'updated_at')
    fieldsets = (
        ('Budget',     {'fields': ('user', 'category', 'monthly_limit', 'month', 'year')}),
        ('Stats',      {'fields': (get_spent_amount,)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
