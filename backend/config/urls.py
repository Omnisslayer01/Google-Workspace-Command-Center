from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),

    # Google OAuth endpoints
    # Keep Google OAuth before the general accounts auth routes.
    path("api/auth/google/", include("google_auth.urls")),

    # General authentication endpoints
    path("api/auth/", include("accounts.urls")),

    # Gmail API endpoints
    path("api/gmail/", include("gmail_integration.urls")),

    # Notifications API endpoints
    path("api/notifications/", include("notifications.urls")),

    # Google Drive API endpoints
    path("api/drive/", include("drive.urls")),
]