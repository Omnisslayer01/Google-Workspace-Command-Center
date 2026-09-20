from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 1. Send /api/auth/google/... traffic to Madhura's app FIRST
    path('api/auth/google/', include('google_auth.urls')),
    
    # 2. Send the rest of /api/auth/... traffic to Jay's accounts app
    path('api/auth/', include('accounts.urls')), 
    
    # Gmail API endpoints
    path('api/gmail/', include('gmail_integration.urls')),

    # Notifications API endpoints
    path('api/notifications/', include('notifications.urls')),
]
