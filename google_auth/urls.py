from django.urls import path
from .views import GoogleConnectView, GoogleCallbackView, GoogleDisconnectView

urlpatterns = [
    path('connect/', GoogleConnectView.as_view(), name='google_connect'),
    path('callback/', GoogleCallbackView.as_view(), name='google_callback'),
    path('disconnect/', GoogleDisconnectView.as_view(), name='google_disconnect'),
]