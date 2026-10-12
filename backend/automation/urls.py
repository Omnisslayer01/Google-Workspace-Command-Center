from django.urls import path

from .views import (
    AutomationCreateView,
    AutomationDetailView,
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
        "<int:automation_id>/",
        AutomationDetailView.as_view(),
        name="automation-detail",
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