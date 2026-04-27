from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('icon', 'name', 'user', 'color', 'created_at')
    list_filter   = ('created_at',)
    search_fields = ('name', 'user__email')
    ordering      = ('name',)
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Details',    {'fields': ('user', 'name', 'icon', 'color')}),
        ('Timestamps', {'fields': ('created_at',), 'classes': ('collapse',)}),
    )
