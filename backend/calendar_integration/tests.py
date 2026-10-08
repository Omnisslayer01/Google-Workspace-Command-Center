import google_auth.services

from unittest.mock import Mock, patch

from django.test import TestCase

from .services import CalendarService


class CalendarServiceTests(TestCase):

    @patch("google_auth.services.get_google_client")
    @patch("calendar_integration.services.build")
    def test_list_events(
        self,
        mock_build,
        mock_get_google_client,
    ):
        mock_get_google_client.return_value = Mock()

        mock_calendar = Mock()
        mock_build.return_value = mock_calendar

        mock_request = Mock()

        expected_response = {
            "items": [
                {
                    "id": "event123",
                    "summary": "Team Meeting",
                }
            ]
        }

        mock_request.execute.return_value = expected_response
        mock_calendar.events().list.return_value = mock_request

        service = CalendarService(user=Mock())

        result = service.list_events()

        self.assertEqual(result, expected_response)

        mock_calendar.events().list.assert_called_once_with(
            calendarId="primary",
            maxResults=50,
            singleEvents=True,
            orderBy="startTime",
        )