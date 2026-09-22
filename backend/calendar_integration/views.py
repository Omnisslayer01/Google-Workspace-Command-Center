from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    CalendarAnalyticsQuerySerializer,
    CalendarEventQuerySerializer,
    CalendarEventSerializer,
    CalendarEventUpdateSerializer,
)
from .services import CalendarService

class CalendarEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CalendarEventQuerySerializer(
            data=request.query_params
        )

        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data

        time_min = validated_data.get("start")
        time_max = validated_data.get("end")
        page_token = validated_data.get("page_token")

        service = CalendarService(request.user)

        events = service.list_events(
            time_min=time_min.isoformat() if time_min else None,
            time_max=time_max.isoformat() if time_max else None,
            page_token=page_token,
        )

        return Response(events)
    def post(self, request):
        serializer = CalendarEventSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data

        service = CalendarService(request.user)

        event = service.create_event(
            summary=validated_data["summary"],
            start_time=validated_data["start_time"].isoformat(),
            end_time=validated_data["end_time"].isoformat(),
            description=validated_data.get("description"),
            location=validated_data.get("location"),
            attendees=validated_data.get("attendees"),
        )

        return Response(
            event,
            status=status.HTTP_201_CREATED,
        )

class CalendarEventDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        service = CalendarService(request.user)

        event = service.get_event(event_id)

        return Response(event)

    def patch(self, request, event_id):
        serializer = CalendarEventUpdateSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data

        service = CalendarService(request.user)

        event = service.update_event(
            event_id=event_id,
            summary=validated_data.get("summary"),
            start_time=(
                validated_data["start_time"].isoformat()
                if validated_data.get("start_time")
                else None
            ),
            end_time=(
                validated_data["end_time"].isoformat()
                if validated_data.get("end_time")
                else None
            ),
            description=validated_data.get("description"),
            location=validated_data.get("location"),
            attendees=validated_data.get("attendees"),
        )

        return Response(event)

    def delete(self, request, event_id):
        service = CalendarService(request.user)

        service.delete_event(event_id)

        return Response(status=status.HTTP_204_NO_CONTENT)
class CalendarAnalyticsView(APIView):
    """
    Calendar analytics endpoint.

    GET /api/calendar/analytics/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CalendarAnalyticsQuerySerializer(
            data=request.query_params
        )

        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data

        start = validated_data.get("start")
        end = validated_data.get("end")

        try:
            service = CalendarService(request.user)

            analytics = service.get_analytics(
                time_min=(
                    start.isoformat()
                    if start
                    else None
                ),
                time_max=(
                    end.isoformat()
                    if end
                    else None
                ),
            )

            return Response(analytics)

        except CalendarServiceError as exc:
            return handle_calendar_error(exc)