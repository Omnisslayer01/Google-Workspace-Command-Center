import base64
from email import policy
from email.parser import BytesParser
from unittest.mock import Mock

from django.test import TestCase

from .services import GmailService


class GmailServiceTests(TestCase):
    def setUp(self):
        gmail_client = Mock()
        self.gmail_client = gmail_client
        self.service = GmailService.__new__(GmailService)
        self.service.gmail = gmail_client

    def test_list_messages_returns_gmail_response(self):
        self.gmail_client.users.return_value.messages.return_value.list.return_value.execute.return_value = {
            "messages": [{"id": "message-1"}],
            "nextPageToken": "next-page",
        }

        result = self.service.list_messages(max_results=10, page_token="page-token")

        self.assertEqual(result["messages"][0]["id"], "message-1")
        self.assertEqual(result["nextPageToken"], "next-page")
        self.gmail_client.users.return_value.messages.return_value.list.assert_called_once_with(
            userId="me",
            maxResults=10,
            pageToken="page-token",
        )

    def test_send_builds_and_sends_raw_message(self):
        self.gmail_client.users.return_value.messages.return_value.send.return_value.execute.return_value = {
            "id": "sent-message"
        }

        result = self.service.send("person@example.com", "Hello", "Message body")

        self.assertEqual(result["id"], "sent-message")
        request = self.gmail_client.users.return_value.messages.return_value.send
        payload = request.call_args.kwargs["body"]["raw"]
        message = BytesParser(policy=policy.default).parsebytes(
            base64.urlsafe_b64decode(payload)
        )
        self.assertEqual(message["To"], "person@example.com")
        self.assertEqual(message["Subject"], "Hello")
        self.assertEqual(message.get_content().strip(), "Message body")

    def test_create_draft_sends_raw_message_to_drafts_endpoint(self):
        self.gmail_client.users.return_value.drafts.return_value.create.return_value.execute.return_value = {
            "id": "draft-1"
        }

        result = self.service.create_draft(
            "person@example.com", "Draft subject", "Draft body"
        )

        self.assertEqual(result["id"], "draft-1")
        self.gmail_client.users.return_value.drafts.return_value.create.assert_called_once()
        request_body = (
            self.gmail_client.users.return_value.drafts.return_value.create.call_args.kwargs[
                "body"
            ]
        )
        self.assertIn("raw", request_body["message"])

    def test_get_attachment_returns_gmail_response(self):
        self.gmail_client.users.return_value.messages.return_value.attachments.return_value.get.return_value.execute.return_value = {
            "data": "attachment-data"
        }

        result = self.service.get_attachment("message-1", "attachment-1")

        self.assertEqual(result["data"], "attachment-data")
        self.gmail_client.users.return_value.messages.return_value.attachments.return_value.get.assert_called_once_with(
            userId="me",
            messageId="message-1",
            id="attachment-1",
        )