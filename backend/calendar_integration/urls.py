from django.urls import path

from .views import (
    CalendarEventDetailView,
    CalendarEventsView,
)

urlpatterns = [
    path(
        "events/",
        CalendarEventsView.as_view(),
        name="calendar-events",
    ),
    path(
        "events/<str:event_id>/",
        CalendarEventDetailView.as_view(),
        name="calendar-event-detail",
    ),
]