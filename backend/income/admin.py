from django.contrib import admin
from .models import Income


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display   = ('source', 'user', 'amount', 'date', 'created_at')
    list_filter    = ('date',)
    search_fields  = ('source', 'description', 'user__email')
    ordering       = ('-date', '-created_at')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Details',    {'fields': ('user', 'source', 'amount', 'date', 'description')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
