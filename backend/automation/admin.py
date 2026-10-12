from django.contrib import admin
from .models import (
    Automation,
    Trigger,
    Condition,
    Action,
    AutomationExecution,
    AutomationStepResult,
)

admin.site.register(Automation)
admin.site.register(Trigger)
admin.site.register(Condition)
admin.site.register(Action)
admin.site.register(AutomationExecution)
admin.site.register(AutomationStepResult)