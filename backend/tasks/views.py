from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from .services import GoogleTasksService


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
        # Set the owner automatically and push to Google Tasks if connected
        task = serializer.save(owner=self.request.user)
        google_service = GoogleTasksService(self.request.user)
        google_service.push_create(task)

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
