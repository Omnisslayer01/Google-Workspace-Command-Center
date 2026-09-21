"""
Gmail integration tests.

Covers:
  - GmailService unit tests (existing, preserved)
  - Gmail API view tests (new): auth, credential guard, happy paths,
    validation errors, Google API error handling
"""

import base64
from email import policy
from email.parser import BytesParser
from unittest.mock import MagicMock, Mock, patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from googleapiclient.errors import HttpError
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .services import GmailService

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_http_error(http_status: int) -> HttpError:
    """Build a minimal googleapiclient HttpError with the given status."""
    resp = Mock()
    resp.status = http_status
    return HttpError(resp=resp, content=b"error")


def _jwt_for(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


# ---------------------------------------------------------------------------
# Existing GmailService unit tests (preserved exactly)
# ---------------------------------------------------------------------------

class GmailServiceTests(APITestCase):
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


# ---------------------------------------------------------------------------
# Base class for Gmail view tests
# ---------------------------------------------------------------------------

class GmailViewTestBase(APITestCase):
    """
    Creates a user + JWT token.
    Patches GmailService so no real Google credentials are needed.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )
        self.token = _jwt_for(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

        # Patch GmailService at the views module level
        self.mock_service_cls = patch(
            "gmail_integration.views.GmailService"
        ).start()
        self.mock_service = MagicMock()
        self.mock_service_cls.return_value = self.mock_service

        # Patch GoogleCredential existence check
        self.mock_cred_exists = patch(
            "gmail_integration.views.GoogleCredential.objects.filter"
        ).start()
        self.mock_cred_exists.return_value.exists.return_value = True

        self.addCleanup(patch.stopall)


# ---------------------------------------------------------------------------
# Authentication guard tests (shared across all endpoints)
# ---------------------------------------------------------------------------

class GmailAuthTests(APITestCase):
    """All Gmail endpoints must reject unauthenticated requests."""

    UNAUTHENTICATED_CASES = [
        ("get", "/api/gmail/messages/"),
        ("get", "/api/gmail/messages/msg123/"),
        ("get", "/api/gmail/search/?q=test"),
        ("post", "/api/gmail/send/"),
        ("post", "/api/gmail/drafts/"),
        ("get", "/api/gmail/attachments/msg1/att1/"),
    ]

    def test_unauthenticated_requests_are_rejected(self):
        for method, url in self.UNAUTHENTICATED_CASES:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method)(url)
                self.assertIn(
                    response.status_code,
                    [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
                    msg=f"{method.upper()} {url} should be protected",
                )


# ---------------------------------------------------------------------------
# GoogleCredential guard
# ---------------------------------------------------------------------------

class GmailNoCredentialTests(APITestCase):
    """Endpoints must return 400 when the user has no connected Google account."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="nocreduser", email="nocred@example.com", password="pass"
        )
        self.token = _jwt_for(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_list_messages_no_credential_returns_400(self):
        # No GoogleCredential row exists for this user → filter().exists() = False.
        # The project's success_response() always sets success=True in the envelope;
        # we verify the HTTP status code is 400 and the message is meaningful.
        response = self.client.get("/api/gmail/messages/", **self.auth)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Google account", response.data["message"])


# ---------------------------------------------------------------------------
# Message list view
# ---------------------------------------------------------------------------

class MessageListViewTests(GmailViewTestBase):
    URL = "/api/gmail/messages/"

    def test_returns_messages_and_next_page_token(self):
        self.mock_service.list_messages.return_value = {
            "messages": [{"id": "m1"}, {"id": "m2"}],
            "nextPageToken": "token-abc",
            "resultSizeEstimate": 42,
        }

        response = self.client.get(self.URL, **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(len(response.data["data"]["messages"]), 2)
        self.assertEqual(response.data["data"]["next_page_token"], "token-abc")
        self.assertEqual(response.data["data"]["result_size_estimate"], 42)

    def test_empty_inbox_returns_empty_list(self):
        self.mock_service.list_messages.return_value = {}

        response = self.client.get(self.URL, **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["messages"], [])
        self.assertIsNone(response.data["data"]["next_page_token"])

    def test_max_results_capped_at_100(self):
        self.mock_service.list_messages.return_value = {"messages": []}

        self.client.get(self.URL + "?max_results=9999", **self.auth)

        call_kwargs = self.mock_service.list_messages.call_args.kwargs
        self.assertLessEqual(call_kwargs["max_results"], 100)

    def test_invalid_max_results_defaults_to_20(self):
        self.mock_service.list_messages.return_value = {"messages": []}

        self.client.get(self.URL + "?max_results=abc", **self.auth)

        call_kwargs = self.mock_service.list_messages.call_args.kwargs
        self.assertEqual(call_kwargs["max_results"], 20)

    def test_page_token_forwarded(self):
        self.mock_service.list_messages.return_value = {"messages": []}

        self.client.get(self.URL + "?page_token=xyz", **self.auth)

        call_kwargs = self.mock_service.list_messages.call_args.kwargs
        self.assertEqual(call_kwargs["page_token"], "xyz")

    def test_gmail_api_error_returns_502(self):
        self.mock_service.list_messages.side_effect = _make_http_error(500)

        response = self.client.get(self.URL, **self.auth)

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)


# ---------------------------------------------------------------------------
# Message detail view
# ---------------------------------------------------------------------------

class MessageDetailViewTests(GmailViewTestBase):
    def _url(self, msg_id="msg123"):
        return f"/api/gmail/messages/{msg_id}/"

    def test_returns_message(self):
        self.mock_service.get_message.return_value = {"id": "msg123", "snippet": "hi"}

        response = self.client.get(self._url(), **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["id"], "msg123")

    def test_not_found_returns_404(self):
        self.mock_service.get_message.side_effect = _make_http_error(404)

        response = self.client.get(self._url("nonexistent"), **self.auth)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_gmail_api_error_returns_502(self):
        self.mock_service.get_message.side_effect = _make_http_error(500)

        response = self.client.get(self._url(), **self.auth)

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)


# ---------------------------------------------------------------------------
# Search view
# ---------------------------------------------------------------------------

class MessageSearchViewTests(GmailViewTestBase):
    URL = "/api/gmail/search/"

    def test_empty_query_returns_400(self):
        response = self.client.get(self.URL, **self.auth)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_whitespace_only_query_returns_400(self):
        response = self.client.get(self.URL + "?q=   ", **self.auth)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valid_query_returns_results(self):
        self.mock_service.search.return_value = {
            "messages": [{"id": "m1"}],
            "nextPageToken": None,
        }

        response = self.client.get(self.URL + "?q=invoice", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.mock_service.search.assert_called_once()
        call_kwargs = self.mock_service.search.call_args.kwargs
        self.assertEqual(call_kwargs["query"], "invoice")

    def test_page_token_and_max_results_forwarded(self):
        self.mock_service.search.return_value = {"messages": []}

        self.client.get(self.URL + "?q=test&max_results=5&page_token=tok", **self.auth)

        call_kwargs = self.mock_service.search.call_args.kwargs
        self.assertEqual(call_kwargs["max_results"], 5)
        self.assertEqual(call_kwargs["page_token"], "tok")

    def test_gmail_api_error_returns_502(self):
        self.mock_service.search.side_effect = _make_http_error(500)

        response = self.client.get(self.URL + "?q=test", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)


# ---------------------------------------------------------------------------
# Send view
# ---------------------------------------------------------------------------

class MessageSendViewTests(GmailViewTestBase):
    URL = "/api/gmail/send/"
    VALID_PAYLOAD = {"to": "a@b.com", "subject": "Hello", "body": "World"}

    def test_valid_send_returns_201(self):
        self.mock_service.send.return_value = {"id": "sent1", "threadId": "t1"}

        response = self.client.post(self.URL, self.VALID_PAYLOAD, format="json", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["message_id"], "sent1")

    def test_missing_to_returns_400(self):
        response = self.client.post(
            self.URL, {"subject": "Hi", "body": "Body"}, format="json", **self.auth
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("to", response.data["data"])

    def test_missing_subject_returns_400(self):
        response = self.client.post(
            self.URL, {"to": "a@b.com", "body": "Body"}, format="json", **self.auth
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("subject", response.data["data"])

    def test_missing_body_returns_400(self):
        response = self.client.post(
            self.URL, {"to": "a@b.com", "subject": "Hi"}, format="json", **self.auth
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("body", response.data["data"])

    def test_insufficient_scope_returns_403(self):
        self.mock_service.send.side_effect = _make_http_error(403)

        response = self.client.post(self.URL, self.VALID_PAYLOAD, format="json", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_gmail_api_error_returns_502(self):
        self.mock_service.send.side_effect = _make_http_error(500)

        response = self.client.post(self.URL, self.VALID_PAYLOAD, format="json", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)


# ---------------------------------------------------------------------------
# Draft view
# ---------------------------------------------------------------------------

class DraftCreateViewTests(GmailViewTestBase):
    URL = "/api/gmail/drafts/"
    VALID_PAYLOAD = {"to": "a@b.com", "subject": "Draft", "body": "Content"}

    def test_valid_draft_returns_201(self):
        self.mock_service.create_draft.return_value = {
            "id": "draft1",
            "message": {"id": "msg1"},
        }

        response = self.client.post(self.URL, self.VALID_PAYLOAD, format="json", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["draft_id"], "draft1")
        self.assertEqual(response.data["data"]["message_id"], "msg1")

    def test_missing_fields_return_400(self):
        for payload in [
            {"subject": "S", "body": "B"},
            {"to": "a@b.com", "body": "B"},
            {"to": "a@b.com", "subject": "S"},
        ]:
            with self.subTest(payload=payload):
                response = self.client.post(self.URL, payload, format="json", **self.auth)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_insufficient_scope_returns_403(self):
        self.mock_service.create_draft.side_effect = _make_http_error(403)

        response = self.client.post(self.URL, self.VALID_PAYLOAD, format="json", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ---------------------------------------------------------------------------
# Attachment view
# ---------------------------------------------------------------------------

class AttachmentViewTests(GmailViewTestBase):
    def _url(self, msg_id="msg1", att_id="att1"):
        return f"/api/gmail/attachments/{msg_id}/{att_id}/"

    def _encoded(self, content: bytes) -> str:
        return base64.urlsafe_b64encode(content).decode()

    def test_returns_binary_response(self):
        content = b"PDF file content"
        self.mock_service.get_attachment.return_value = {
            "data": self._encoded(content),
            "size": len(content),
        }

        response = self.client.get(self._url(), **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/octet-stream")
        self.assertIn("attachment", response["Content-Disposition"])
        self.assertEqual(b"".join(response.streaming_content) if hasattr(response, "streaming_content") else response.content, content)

    def test_empty_data_returns_404(self):
        self.mock_service.get_attachment.return_value = {"data": ""}

        response = self.client.get(self._url(), **self.auth)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_attachment_not_found_returns_404(self):
        self.mock_service.get_attachment.side_effect = _make_http_error(404)

        response = self.client.get(self._url(), **self.auth)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_gmail_api_error_returns_502(self):
        self.mock_service.get_attachment.side_effect = _make_http_error(500)

        response = self.client.get(self._url(), **self.auth)

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
