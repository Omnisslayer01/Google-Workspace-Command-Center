from django.urls import path

from .views import (
    NotificationListView,
    NotificationMarkAllReadView,
    NotificationMarkReadView,
)

app_name = "notifications"

urlpatterns = [
    # List notifications (GET) — supports ?unread_only=true
    path("", NotificationListView.as_view(), name="notification-list"),

    # Mark all notifications read
    path("read-all/", NotificationMarkAllReadView.as_view(), name="notification-mark-all-read"),

    # Mark a single notification read
    path("<int:pk>/read/", NotificationMarkReadView.as_view(), name="notification-mark-read"),
]
