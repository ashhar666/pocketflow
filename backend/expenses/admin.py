from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display  = ('title', 'user', 'category', 'amount', 'date', 'is_recurring', 'recurrence_type', 'created_at')
    list_filter   = ('is_recurring', 'recurrence_type', 'category', 'date')
    search_fields = ('title', 'notes', 'user__email')
    ordering      = ('-date', '-created_at')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Details',     {'fields': ('user', 'category', 'title', 'amount', 'date', 'notes')}),
        ('Recurrence',  {'fields': ('is_recurring', 'recurrence_type')}),
        ('Timestamps',  {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
