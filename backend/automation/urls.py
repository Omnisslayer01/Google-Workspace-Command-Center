from django.urls import path

from .views import AutomationCreateView
from .views import AutomationRunView

urlpatterns = [
    path("", AutomationCreateView.as_view(), name="automation-create"),
    path("<int:automation_id>/run/", AutomationRunView.as_view(), name="automation-run"),
]