from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'action', 'target_type', 'target_id', 'created_at')
    list_filter = ('action', 'target_type')
    search_fields = ('user__username', 'action')
