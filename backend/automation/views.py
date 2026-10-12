from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import AutomationCreateSerializer, AutomationListSerializer
from .models import Automation, AutomationExecution
from .executor import AutomationExecutor


class AutomationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        automations = (
            Automation.objects
            .filter(owner=request.user)
            .select_related("trigger")
            .prefetch_related("conditions", "actions")
            .order_by("-created_at")
        )
        serializer = AutomationListSerializer(automations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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


class AutomationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, automation_id):
        try:
            automation = (
                Automation.objects
                .select_related("trigger")
                .prefetch_related("conditions", "actions")
                .get(id=automation_id, owner=request.user)
            )
        except Automation.DoesNotExist:
            return Response(
                {"error": "Automation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = AutomationListSerializer(automation)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, automation_id):
        try:
            automation = Automation.objects.get(id=automation_id, owner=request.user)
        except Automation.DoesNotExist:
            return Response(
                {"error": "Automation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if "is_active" in request.data:
            automation.is_active = bool(request.data["is_active"])
            automation.save(update_fields=["is_active"])
        if "name" in request.data:
            automation.name = str(request.data["name"]).strip()
            automation.save(update_fields=["name"])
        serializer = AutomationListSerializer(automation)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, automation_id):
        try:
            automation = Automation.objects.get(id=automation_id, owner=request.user)
        except Automation.DoesNotExist:
            return Response(
                {"error": "Automation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        automation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AutomationRunView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, automation_id):
        try:
            automation = Automation.objects.get(
                id=automation_id,
                owner=request.user,
            )
        except Automation.DoesNotExist:
            return Response(
                {"error": "Automation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        execution = AutomationExecution.objects.create(
            automation=automation,
            status="running",
            started_at=timezone.now(),
        )

        trigger_payload = (
            request.data.get("trigger_payload", {})
            if isinstance(request.data, dict)
            else {}
        )
        execution = AutomationExecutor(execution, trigger_payload).run()

        return Response(
            {
                "execution_id": execution.id,
                "status": execution.status,
            },
            status=status.HTTP_200_OK,
        )


class AutomationExecutionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        executions = (
            AutomationExecution.objects
            .filter(automation__owner=request.user)
            .select_related("automation")
            .prefetch_related(
                "step_results__action"
            )
            .order_by("-started_at", "-id")
        )

        history = []

        for execution in executions:
            step_results = []

            for result in execution.step_results.all():
                step_results.append(
                    {
                        "id": result.id,
                        "action": result.action.type,
                        "status": result.status,
                        "error": result.error,
                        "executed_at": result.executed_at,
                    }
                )

            history.append(
                {
                    "id": execution.id,
                    "automation_id": execution.automation.id,
                    "automation_name": execution.automation.name,
                    "status": execution.status,
                    "started_at": execution.started_at,
                    "finished_at": execution.finished_at,
                    "step_results": step_results,
                }
            )

        return Response(
            {
                "executions": history,
            },
            status=status.HTTP_200_OK,
        )