from django.urls import path
from .views import GoogleConnectView, GoogleCallbackView, GoogleDisconnectView

urlpatterns = [
    # This will handle: GET /api/auth/google/
    path('', GoogleConnectView.as_view(), name='google_connect'),
    
    # This will handle: GET /api/auth/google/callback/
    path('callback/', GoogleCallbackView.as_view(), name='google_callback'),
    path('disconnect/', GoogleDisconnectView.as_view(), name='google_disconnect'),
]