from django.db import models
from django.contrib.auth.models import User
from automation.models import Automation

class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, default='todo')
    
    # Existing project ownership/security pattern
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    
    # Nullable FK to automation, as per specification
    created_by_automation = models.ForeignKey(
        Automation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tasks'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
