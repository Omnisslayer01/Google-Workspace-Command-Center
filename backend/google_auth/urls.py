from django.urls import path
from .views import GoogleConnectView, GoogleCallbackView

urlpatterns = [
    # This will handle: GET /api/auth/google/
    path('', GoogleConnectView.as_view(), name='google_connect'),
    
    # This will handle: GET /api/auth/google/callback/
    path('callback/', GoogleCallbackView.as_view(), name='google_callback'),
]