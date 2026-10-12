from django.db import models
from django.contrib.auth.models import User
import uuid


class Automation(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="automations"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Trigger(models.Model):
    TRIGGER_TYPES = [
        ("gmail_new", "New Gmail Message"),
        ("gmail_search", "Gmail Search Match"),
        ("calendar_new", "New Calendar Event"),
        ("calendar_upcoming", "Upcoming Calendar Event"),
        ("drive_new", "New Drive File"),
        ("scheduled", "Scheduled"),
        ("manual", "Manual"),
    ]

    automation = models.OneToOneField(
        Automation,
        on_delete=models.CASCADE,
        related_name="trigger"
    )
    type = models.CharField(max_length=50, choices=TRIGGER_TYPES)
    config = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.automation.name} - {self.type}"


class Condition(models.Model):
    OPERATORS = [
        ("equals", "Equals"),
        ("contains", "Contains"),
        ("starts_with", "Starts With"),
        ("ends_with", "Ends With"),
        ("greater_than", "Greater Than"),
        ("less_than", "Less Than"),
    ]

    automation = models.ForeignKey(
        Automation,
        on_delete=models.CASCADE,
        related_name="conditions"
    )
    field = models.CharField(max_length=100)
    operator = models.CharField(max_length=30, choices=OPERATORS)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.field} {self.operator} {self.value}"


class Action(models.Model):
    ACTION_TYPES = [
        ("gmail_send", "Send Gmail"),
        ("calendar_create", "Create Calendar Event"),
        ("calendar_update", "Update Calendar Event"),
        ("drive_folder", "Create Drive Folder"),
        ("drive_save", "Save File to Drive"),
        ("sheets_write", "Write to Sheets"),
        ("task_create", "Create Internal Task"),
        ("notify", "Send Notification"),
    ]

    automation = models.ForeignKey(
        Automation,
        on_delete=models.CASCADE,
        related_name="actions"
    )
    type = models.CharField(max_length=50, choices=ACTION_TYPES)
    config = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.automation.name} - {self.type}"


#task 4 part
class AutomationExecution(models.Model):
    STATUS_CHOICES = [
        ("queued", "Queued"),
        ("running", "Running"),
        ("succeeded", "Succeeded"),
        ("failed", "Failed"),
        ("partially_succeeded", "Partially Succeeded"),
    ]

    automation = models.ForeignKey(
        Automation,
        on_delete=models.CASCADE,
        related_name="executions",
    )

    idempotency_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="queued",
    )

    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.automation.name} - {self.status}"


class AutomationStepResult(models.Model):
    execution = models.ForeignKey(
        AutomationExecution,
        on_delete=models.CASCADE,
        related_name="step_results",
    )

    action = models.ForeignKey(
        Action,
        on_delete=models.CASCADE,
    )

    status = models.CharField(max_length=20)
    error = models.TextField(blank=True)

    executed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action.type} - {self.status}"
    

