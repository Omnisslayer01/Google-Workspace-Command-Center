from django.urls import path

from .views import AutomationCreateView

urlpatterns = [
    path("", AutomationCreateView.as_view(), name="automation-create"),
]