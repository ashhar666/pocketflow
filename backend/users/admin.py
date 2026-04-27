from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from users.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # ── List view ─────────────────────────────────────────────────────────────
    list_display  = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter   = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering      = ('-date_joined',)

    # ── Detail / edit view ────────────────────────────────────────────────────
    # Must NOT include 'username' in fieldsets because our login field is 'email'
    fieldsets = (
        (None,                  {'fields': ('email', 'password')}),
        (_('Personal info'),    {'fields': ('first_name', 'last_name')}),
        (_('Telegram'),         {'fields': ('telegram_chat_id', 'telegram_link_token', 'telegram_link_expiry')}),
        (_('Permissions'),      {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'),  {'fields': ('last_login', 'date_joined')}),
    )

    # ── Add user view ─────────────────────────────────────────────────────────
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )

    readonly_fields = ('last_login', 'date_joined')
