from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/google/', include('google_auth.urls')),
    path('api/rbac/', include('rbac.urls')),
    path('api/audit/', include('audit.urls')),
]