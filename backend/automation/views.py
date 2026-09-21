from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import AutomationCreateSerializer


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