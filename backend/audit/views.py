from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    """
    Read-only API - GET /api/audit/
    Filtering by user, action, and date range via query params.
    No write access from the frontend (ListAPIView only supports GET).
    """

    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AuditLog.objects.all()

        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)

        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        return queryset
