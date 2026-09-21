from django.urls import path

from .views import TestOrgPermissionView

urlpatterns = [
    path('test-permission/', TestOrgPermissionView.as_view(), name='test_org_permission'),
]