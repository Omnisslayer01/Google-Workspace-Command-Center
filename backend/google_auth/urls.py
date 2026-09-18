from django.urls import path
from .views import GoogleConnectView, GoogleCallbackView

urlpatterns = [
    path('connect/', GoogleConnectView.as_view(), name='google_connect'),
    path('callback/', GoogleCallbackView.as_view(), name='google_callback'),
]