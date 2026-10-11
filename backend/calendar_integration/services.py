from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class CalendarServiceError(Exception):
    """
    Application-level error raised by CalendarService.

    This keeps Google API-specific errors inside the service layer
    instead of exposing them directly to Django views.
    """

    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class CalendarService:
    """
    Service layer for Google Calendar API operations.

    Google authentication and token handling are owned by BE1.
    This service only consumes the authenticated Google credentials.
    """

    def __init__(self, user):
        self.user = user

        # BE1 owns Google authentication/token handling.
        from google_auth.services import get_google_client

        credentials = get_google_client(user)

        self.calendar = build(
            "calendar",
            "v3",
            credentials=credentials,
        )

    def _execute(self, request):
        """
        Execute a Google Calendar API request and convert Google API
        errors into application-level errors.
        """
        try:
            return request.execute()

        except HttpError as exc:
            google_status = (
                exc.resp.status
                if exc.resp is not None
                else None
            )

            if google_status == 404:
                raise CalendarServiceError(
                    "Calendar event not found.",
                    status_code=404,
                ) from exc

            if google_status in (401, 403):
                raise CalendarServiceError(
                    "Google Calendar authorization is invalid or unavailable.",
                    status_code=403,
                ) from exc

            if google_status == 429:
                raise CalendarServiceError(
                    "Google Calendar rate limit reached. Please try again later.",
                    status_code=429,
                ) from exc

            if google_status and google_status >= 500:
                raise CalendarServiceError(
                    "Google Calendar is temporarily unavailable.",
                    status_code=503,
                ) from exc

            raise CalendarServiceError(
                "Google Calendar request failed.",
                status_code=502,
            ) from exc

    def list_events(
        self,
        time_min=None,
        time_max=None,
        max_results=50,
        page_token=None,
    ):
        """
        List events from the user's primary calendar.
        """

        params = {
            "calendarId": "primary",
            "maxResults": max_results,
            "singleEvents": True,
            "orderBy": "startTime",
        }

        if time_min:
            params["timeMin"] = time_min

        if time_max:
            params["timeMax"] = time_max

        if page_token:
            params["pageToken"] = page_token

        response = self._execute(
            self.calendar.events()
            .list(**params)
        )

        return response

    def get_event(self, event_id):
        """
        Retrieve one event by Google Calendar event ID.
        """

        response = self._execute(
            self.calendar.events()
            .get(
                calendarId="primary",
                eventId=event_id,
            )
        )

        return response

    def create_event(
        self,
        summary,
        start_time,
        end_time,
        description=None,
        location=None,
        attendees=None,
    ):
        """
        Create an event on the user's primary calendar.
        """

        event = {
            "summary": summary,
            "start": {
                "dateTime": start_time,
            },
            "end": {
                "dateTime": end_time,
            },
        }

        if description:
            event["description"] = description

        if location:
            event["location"] = location

        if attendees:
            event["attendees"] = [
                {"email": email}
                for email in attendees
            ]

        response = self._execute(
            self.calendar.events()
            .insert(
                calendarId="primary",
                body=event,
                conferenceDataVersion=1,
            )
        )

        return response

    def update_event(
        self,
        event_id,
        summary=None,
        start_time=None,
        end_time=None,
        description=None,
        location=None,
        attendees=None,
    ):
        """
        Partially update an existing event.
        """

        event = {}

        if summary is not None:
            event["summary"] = summary

        if start_time is not None:
            event["start"] = {
                "dateTime": start_time,
            }

        if end_time is not None:
            event["end"] = {
                "dateTime": end_time,
            }

        if description is not None:
            event["description"] = description

        if location is not None:
            event["location"] = location

        if attendees is not None:
            event["attendees"] = [
                {"email": email}
                for email in attendees
            ]

        if not event:
            raise ValueError(
                "At least one field is required to update the event."
            )

        response = self._execute(
            self.calendar.events()
            .patch(
                calendarId="primary",
                eventId=event_id,
                body=event,
            )
        )

        return response

    def delete_event(self, event_id):
        """
        Delete an existing event.
        """

        self._execute(
            self.calendar.events()
            .delete(
                calendarId="primary",
                eventId=event_id,
            )
        )
    def get_analytics(self, time_min=None, time_max=None):
        """
        Calculate meeting analytics from Google Calendar.

        Returns:
            total_meetings
            meetings_by_day
            meetings_by_week
        """

        events = []
        page_token = None

        while True:
            response = self.list_events(
                time_min=time_min,
                time_max=time_max,
                max_results=2500,
                page_token=page_token,
            )

            events.extend(response.get("items", []))

            page_token = response.get("nextPageToken")

            if not page_token:
                break

        meetings_by_day = {}
        meetings_by_week = {}

        for event in events:
            start = event.get("start", {})

            # All-day event
            event_date = start.get("date")

            # Timed event
            if not event_date:
                date_time = start.get("dateTime")

                if date_time:
                    event_date = date_time[:10]

            if not event_date:
                continue

            # Count by day
            meetings_by_day[event_date] = (
                meetings_by_day.get(event_date, 0) + 1
            )

            # Count by week.
            # Monday is used as the week identifier.
            from datetime import date, timedelta

            event_date_obj = date.fromisoformat(event_date)

            monday = event_date_obj - timedelta(
                days=event_date_obj.weekday()
            )

            week_key = monday.isoformat()

            meetings_by_week[week_key] = (
                meetings_by_week.get(week_key, 0) + 1
            )

        return {
            "total_meetings": len(events),
            "meetings_by_day": meetings_by_day,
            "meetings_by_week": meetings_by_week,
        }