from django.contrib import admin
from .models import SavingsGoal


@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display   = ('title', 'user', 'current_amount', 'target_amount', 'progress_pct', 'deadline', 'created_at')
    list_filter    = ('deadline',)
    search_fields  = ('title', 'user__email')
    ordering       = ('deadline',)
    date_hierarchy = 'deadline'
    readonly_fields = ('progress_pct', 'created_at', 'updated_at')
    fieldsets = (
        ('Goal',       {'fields': ('user', 'title', 'target_amount', 'current_amount', 'deadline')}),
        ('Progress',   {'fields': ('progress_pct',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    @admin.display(description='Progress %')
    def progress_pct(self, obj):
        if obj.target_amount and obj.target_amount > 0:
            pct = (obj.current_amount / obj.target_amount) * 100
            return f"{pct:.1f}%"
        return "0%"
