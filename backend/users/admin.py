from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from users.models import SupportMessage, User


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


@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ('sender_email_display', 'email_sent', 'created_at')
    list_filter = ('email_sent', 'created_at')
    search_fields = ('sender_email', 'message')
    readonly_fields = ('sender_email', 'message', 'email_sent', 'email_error', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Sender')
    def sender_email_display(self, obj):
        return obj.sender_email or 'Anonymous'
