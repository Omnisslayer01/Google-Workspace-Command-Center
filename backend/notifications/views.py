import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.response import success_response

from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


class NotificationListView(APIView):
    """
    GET /api/notifications/
    Returns all notifications for the authenticated user, newest first.

    Query params:
        unread_only (bool, default false) — if "true", return only unread notifications
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(user=request.user)

        if request.query_params.get("unread_only", "").lower() == "true":
            qs = qs.filter(is_read=False)

        serializer = NotificationSerializer(qs, many=True)
        return success_response(
            data={
                "notifications": serializer.data,
                "unread_count": Notification.objects.filter(
                    user=request.user, is_read=False
                ).count(),
            }
        )


class NotificationMarkReadView(APIView):
    """
    PATCH /api/notifications/<pk>/read/
    Marks a single notification as read.
    Only the owning user may mark their own notifications.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return success_response(
                data=None,
                message="Notification not found.",
                status_code=404,
            )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return success_response(
            data=NotificationSerializer(notification).data,
            message="Notification marked as read.",
        )


class NotificationMarkAllReadView(APIView):
    """
    POST /api/notifications/read-all/
    Marks every unread notification as read for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(
            user=request.user, is_read=False
        ).update(is_read=True)

        return success_response(
            data={"marked_read": updated},
            message=f"{updated} notification(s) marked as read.",
        )
