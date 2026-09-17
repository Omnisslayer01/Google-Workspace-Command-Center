from googleapiclient.discovery import build


class CalendarService:
    """
    Service layer for Google Calendar API operations.

    Google authentication and token handling are owned by BE1.
    This service only consumes the authenticated Google client.
    """

    def __init__(self, user):
        self.user = user

        from google_auth.services import get_google_client

        credentials = get_google_client(user)

        self.calendar = build(
            "calendar",
            "v3",
            credentials=credentials,
        )

    def list_events(
        self,
        time_min=None,
        time_max=None,
        max_results=50,
        page_token=None,
    ):
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

        response = (
            self.calendar.events()
            .list(**params)
            .execute()
        )

        return response

    def get_event(self, event_id):
        response = (
            self.calendar.events()
            .get(
                calendarId="primary",
                eventId=event_id,
            )
            .execute()
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

        response = (
            self.calendar.events()
            .insert(
                calendarId="primary",
                body=event,
            )
            .execute()
        )

        return response