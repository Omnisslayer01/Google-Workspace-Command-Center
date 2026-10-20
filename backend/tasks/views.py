from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from .models import Task
from .serializers import TaskSerializer
from .services import GoogleTasksService

class GoogleTasksSyncError(APIException):
    status_code = 502
    default_detail = (
        "The task could not be synchronized with Google Tasks."
        )
    default_code = "google_tasks_sync_failed"


class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD for internal tasks with Google Tasks synchronization.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Scope task access to the authenticated user
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        task = serializer.save(owner=self.request.user)
        google_service = GoogleTasksService(self.request.user)
        
        try:
            if not google_service.is_connected():
                raise GoogleTasksSyncError(
                    "Google Tasks is not connected. Please reconnect your Google account."
                    )
                
            google_task_id = google_service.push_create(task)
            
            if not google_task_id:
                raise GoogleTasksSyncError()
            
        except Exception as exc:
            # Do not keep a local-only task if Google creation fails.
            task.delete()
            
            if isinstance(exc, GoogleTasksSyncError):
                raise
            
            raise GoogleTasksSyncError() from exc

    def perform_update(self, serializer):
        task = serializer.save()
        google_service = GoogleTasksService(self.request.user)
        google_service.push_update(task)

    def perform_destroy(self, instance):
        google_task_id = instance.google_task_id
        user = self.request.user
        super().perform_destroy(instance)
        if google_task_id:
            google_service = GoogleTasksService(user)
            google_service.push_delete(google_task_id)

    @action(detail=False, methods=['post'])
    def sync(self, request):
        """
        Pull and merge tasks from Google Tasks for the authenticated user.
        """
        google_service = GoogleTasksService(request.user)
        result = google_service.sync_from_google()
        return Response(result, status=status.HTTP_200_OK)
