from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """
    Sensitive operations chi record thevnara model.
    Ha model फक्त backend code(log_action helper) varunach bharla
    jato - frontend kadun thet write nahi hote (append-only, read-only API).
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )

   
    action = models.CharField(max_length=100)

    
    target_type = models.CharField(max_length=100, blank=True)

    
    target_id = models.CharField(max_length=100, blank=True, null=True)

    
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['action']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user} - {self.action} @ {self.created_at}"