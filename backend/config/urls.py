from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 1. Send /api/auth/google/... traffic to Madhura's app FIRST
    path('api/auth/google/', include('google_auth.urls')),
    
    # 2. Send the rest of /api/auth/... traffic to Jay's accounts app
    path('api/auth/', include('accounts.urls')), 
    
    # (If Jay added other apps like gmail_integration, they go here too)
    # path('api/gmail/', include('gmail_integration.urls')),
]
