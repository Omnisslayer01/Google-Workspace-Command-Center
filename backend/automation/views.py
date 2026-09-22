from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import AutomationCreateSerializer
from .models import Automation
from .executor import AutomationExecutor

class AutomationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AutomationCreateSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        automation = serializer.save()

        return Response(
            {
                "message": "Automation created successfully.",
                "automation_id": automation.id,
            },
            status=status.HTTP_201_CREATED,
        )


#task 4 part
class AutomationRunView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, automation_id):

        automation = Automation.objects.get(
            id=automation_id,
            owner=request.user,
        )

        execution = AutomationExecutor(automation).run()

        return Response(
            {
                "execution_id": execution.id,
                "status": execution.status,
            },
            status=status.HTTP_200_OK,
        )