from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "notification_type", "is_read", "created_at", "short_message")
    list_filter = ("notification_type", "is_read")
    search_fields = ("user__email", "message")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)

    def short_message(self, obj):
        return obj.message[:80] + "..." if len(obj.message) > 80 else obj.message
    short_message.short_description = "Message"
