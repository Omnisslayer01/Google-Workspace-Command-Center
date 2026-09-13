from unittest.mock import Mock, patch

from django.test import TestCase

from .services import GmailService


class GmailServiceTests(TestCase):
    @patch("google_auth.services.get_google_client")
    @patch("gmail_integration.services.build")
    def test_list_messages_returns_gmail_response(self, mock_build, mock_get_client):
        gmail_client = Mock()
        gmail_client.users.return_value.messages.return_value.list.return_value.execute.return_value = {
            "messages": [{"id": "message-1"}],
            "nextPageToken": "next-page",
        }

        mock_build.return_value = gmail_client

        service = GmailService(user=Mock())
        result = service.list_messages(max_results=10, page_token="page-token")

        self.assertEqual(result["messages"][0]["id"], "message-1")
        self.assertEqual(result["nextPageToken"], "next-page")
        gmail_client.users.return_value.messages.return_value.list.assert_called_once_with(
            userId="me",
            maxResults=10,
            pageToken="page-token",
        )