from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/rbac/', include('rbac.urls')),
    path('api/audit/', include('audit.urls')),

    # 1. Send /api/auth/google/... traffic to Madhura's app FIRST
    path('api/auth/google/', include('google_auth.urls')),

    # 2. Send the rest of /api/auth/... traffic to Jay's accounts app
    path('api/auth/', include('accounts.urls')),

    # Gmail API endpoints
    path('api/gmail/', include('gmail_integration.urls')),

    # Notifications API endpoints
    path('api/notifications/', include('notifications.urls')),

    # sheets app from BE2 task 1 add by Krushna
    path("api/sheets/", include("sheets.urls")),

    # automation model added (Validates the trigger,Validates every action)
    # Creates:(Automation,Trigger,Conditions,Actions) in one requiest
    # BE2 Task 2 and 3 done by krushna
    path("api/automations/", include("automation.urls")),
]