from django.urls import path

from .views import (
    AutomationCreateView,
    AutomationRunView,
    AutomationExecutionHistoryView,
)


urlpatterns = [
    path(
        "",
        AutomationCreateView.as_view(),
        name="automation-create",
    ),
    path(
        "executions/",
        AutomationExecutionHistoryView.as_view(),
        name="automation-execution-history",
    ),
    path(
        "<int:automation_id>/run/",
        AutomationRunView.as_view(),
        name="automation-run",
    ),
]