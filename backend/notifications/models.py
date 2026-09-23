from django.conf import settings
from django.db import models


class Notification(models.Model):
    """
    In-app notification for a GWCC user.

    Created programmatically (e.g. by a Celery task or a signal).
    Exposed via REST API for the frontend notification centre.
    """

    class NotificationType(models.TextChoices):
        GMAIL = "gmail", "Gmail"
        CALENDAR = "calendar", "Calendar"
        DRIVE = "drive", "Drive"
        SHEETS = "sheets", "Sheets"
        SYSTEM = "system", "System"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
    )

    message = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "is_read"]),
        ]

    def __str__(self):
        status = "read" if self.is_read else "unread"
        return f"[{self.notification_type}] {self.user} — {status}"
