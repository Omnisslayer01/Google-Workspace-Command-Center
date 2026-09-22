from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path(
        "api/calendar/",
        include("calendar_integration.urls"),
    ),
    path('api/rbac/', include('rbac.urls')),
    
    # Google OAuth endpoints
    path('api/auth/google/', include('google_auth.urls')),
    
    # General authentication endpoints
    path('api/auth/', include('accounts.urls')), 
    
    # Gmail API endpoints
    path("api/gmail/", include("gmail_integration.urls")),

    # Notifications API endpoints
    path('api/notifications/', include('notifications.urls')),
    
    # Google Drive API endpoints
    path("api/drive/", include("drive.urls")),
    
    # sheets app from BE2 task 1 add by Krushna 
    path("api/sheets/", include("sheets.urls")),

    # automation model added 
    path("api/automations/", include("automation.urls")),
]
