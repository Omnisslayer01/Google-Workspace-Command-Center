from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD for internal tasks.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Scope task access to the authenticated user
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Set the owner automatically
        serializer.save(owner=self.request.user)
