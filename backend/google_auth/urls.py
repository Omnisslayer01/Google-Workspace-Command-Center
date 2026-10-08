from django.urls import path
from .views import (
    GoogleConnectView,
    GoogleCallbackView,
    GoogleDisconnectView,
    AccountDeleteView,
)

urlpatterns = [
    # This will handle: GET /api/auth/google/
    path('', GoogleConnectView.as_view(), name='google_connect'),

    # This will handle: GET /api/auth/google/callback/
    path('callback/', GoogleCallbackView.as_view(), name='google_callback'),

    # This will handle: POST /api/auth/google/disconnect/
    path('disconnect/', GoogleDisconnectView.as_view(), name='google_disconnect'),

    # This will handle: POST /api/auth/google/account/delete/
    path('account/delete/', AccountDeleteView.as_view(), name='account_delete'),
]