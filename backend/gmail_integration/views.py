import base64
import logging

from django.http import HttpResponse
from googleapiclient.errors import HttpError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.response import success_response
from google_auth.models import GoogleCredential

from .services import GmailService

logger = logging.getLogger(__name__)


def _get_service(user):
    """
    Instantiate GmailService for the authenticated user.
    Raises ValueError if the user has no connected Google account.
    """
    if not GoogleCredential.objects.filter(user=user).exists():
        raise ValueError("No Google account connected. Please connect your Google account first.")
    return GmailService(user)


class MessageListView(APIView):
    """
    GET /api/gmail/messages/
    Returns the Gmail inbox message list for the authenticated user.
    Supports Google-native page token pagination.

    Query params:
        max_results (int, default 20, max 100)
        page_token  (str, optional)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            max_results = min(int(request.query_params.get("max_results", 20)), 100)
        except (TypeError, ValueError):
            max_results = 20

        page_token = request.query_params.get("page_token") or None

        try:
            service = _get_service(request.user)
            result = service.list_messages(
                max_results=max_results,
                page_token=page_token,
            )
        except ValueError as exc:
            return success_response(
                data=None,
                message=str(exc),
                status_code=400,
            )
        except HttpError as exc:
            logger.error("Gmail API error in list_messages: %s", exc)
            return success_response(
                data=None,
                message="Gmail API error. Please try again.",
                status_code=502,
            )

        return success_response(
            data={
                "messages": result.get("messages", []),
                "next_page_token": result.get("nextPageToken"),
                "result_size_estimate": result.get("resultSizeEstimate"),
            }
        )


class MessageDetailView(APIView):
    """
    GET /api/gmail/messages/<message_id>/
    Returns a single Gmail message in full format.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, message_id):
        try:
            service = _get_service(request.user)
            message = service.get_message(message_id)
        except ValueError as exc:
            return success_response(data=None, message=str(exc), status_code=400)
        except HttpError as exc:
            if exc.resp.status == 404:
                return success_response(
                    data=None,
                    message="Message not found.",
                    status_code=404,
                )
            logger.error("Gmail API error in get_message: %s", exc)
            return success_response(data=None, message="Gmail API error.", status_code=502)

        return success_response(data=message)


class MessageSearchView(APIView):
    """
    GET /api/gmail/search/?q=<query>
    Searches Gmail messages using Gmail query syntax.

    Query params:
        q           (str, required) — Gmail search query
        max_results (int, default 20, max 100)
        page_token  (str, optional)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query:
            return success_response(
                data=None,
                message="Search query 'q' is required and cannot be empty.",
                status_code=400,
            )

        try:
            max_results = min(int(request.query_params.get("max_results", 20)), 100)
        except (TypeError, ValueError):
            max_results = 20

        page_token = request.query_params.get("page_token") or None

        try:
            service = _get_service(request.user)
            result = service.search(
                query=query,
                max_results=max_results,
                page_token=page_token,
            )
        except ValueError as exc:
            return success_response(data=None, message=str(exc), status_code=400)
        except HttpError as exc:
            logger.error("Gmail API error in search: %s", exc)
            return success_response(data=None, message="Gmail API error.", status_code=502)

        return success_response(
            data={
                "messages": result.get("messages", []),
                "next_page_token": result.get("nextPageToken"),
                "result_size_estimate": result.get("resultSizeEstimate"),
            }
        )


class MessageSendView(APIView):
    """
    POST /api/gmail/send/
    Sends a Gmail message on behalf of the authenticated user.

    Body:
        to      (str, required)
        subject (str, required)
        body    (str, required)

    NOTE: Requires gmail.send scope. The current OAuth config only grants
    gmail.readonly. Until the scope is upgraded in google_auth/services.py
    and users re-authenticate, this endpoint will return a 403 from Google.
    See SCOPE_BLOCKER note in docs.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        to = request.data.get("to", "").strip()
        subject = request.data.get("subject", "").strip()
        body = request.data.get("body", "").strip()

        errors = {}
        if not to:
            errors["to"] = "Recipient email address is required."
        if not subject:
            errors["subject"] = "Subject is required."
        if not body:
            errors["body"] = "Message body is required."
        if errors:
            return success_response(data=errors, message="Validation failed.", status_code=400)

        try:
            service = _get_service(request.user)
            result = service.send(to=to, subject=subject, body=body)
        except ValueError as exc:
            return success_response(data=None, message=str(exc), status_code=400)
        except HttpError as exc:
            if exc.resp.status == 403:
                return success_response(
                    data=None,
                    message=(
                        "Insufficient Gmail permissions. "
                        "Please reconnect your Google account with send access."
                    ),
                    status_code=403,
                )
            logger.error("Gmail API error in send: %s", exc)
            return success_response(data=None, message="Gmail API error.", status_code=502)

        return success_response(
            data={"message_id": result.get("id"), "thread_id": result.get("threadId")},
            message="Message sent successfully.",
            status_code=201,
        )


class DraftCreateView(APIView):
    """
    POST /api/gmail/drafts/
    Creates a Gmail draft on behalf of the authenticated user.

    Body:
        to      (str, required)
        subject (str, required)
        body    (str, required)

    NOTE: Requires gmail.compose or gmail.modify scope. Same scope caveat
    as MessageSendView applies.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        to = request.data.get("to", "").strip()
        subject = request.data.get("subject", "").strip()
        body = request.data.get("body", "").strip()

        errors = {}
        if not to:
            errors["to"] = "Recipient email address is required."
        if not subject:
            errors["subject"] = "Subject is required."
        if not body:
            errors["body"] = "Message body is required."
        if errors:
            return success_response(data=errors, message="Validation failed.", status_code=400)

        try:
            service = _get_service(request.user)
            result = service.create_draft(to=to, subject=subject, body=body)
        except ValueError as exc:
            return success_response(data=None, message=str(exc), status_code=400)
        except HttpError as exc:
            if exc.resp.status == 403:
                return success_response(
                    data=None,
                    message=(
                        "Insufficient Gmail permissions. "
                        "Please reconnect your Google account with compose access."
                    ),
                    status_code=403,
                )
            logger.error("Gmail API error in create_draft: %s", exc)
            return success_response(data=None, message="Gmail API error.", status_code=502)

        draft = result.get("message", result)
        return success_response(
            data={"draft_id": result.get("id"), "message_id": draft.get("id")},
            message="Draft created successfully.",
            status_code=201,
        )


class AttachmentView(APIView):
    """
    GET /api/gmail/attachments/<message_id>/<attachment_id>/
    Downloads a Gmail attachment and streams it to the client.

    Returns the raw attachment bytes with appropriate Content-Type/
    Content-Disposition headers so the browser can download it.
    """
    permission_classes = [IsAuthenticated]

    # Maximum decoded attachment size we will serve (25 MB)
    MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024

    def get(self, request, message_id, attachment_id):
        try:
            service = _get_service(request.user)
            attachment = service.get_attachment(message_id, attachment_id)
        except ValueError as exc:
            return success_response(data=None, message=str(exc), status_code=400)
        except HttpError as exc:
            if exc.resp.status == 404:
                return success_response(data=None, message="Attachment not found.", status_code=404)
            logger.error("Gmail API error in get_attachment: %s", exc)
            return success_response(data=None, message="Gmail API error.", status_code=502)

        raw_data = attachment.get("data", "")
        if not raw_data:
            return success_response(data=None, message="Attachment data is empty.", status_code=404)

        try:
            decoded = base64.urlsafe_b64decode(raw_data)
        except Exception:
            return success_response(
                data=None, message="Failed to decode attachment data.", status_code=500
            )

        if len(decoded) > self.MAX_ATTACHMENT_BYTES:
            return success_response(
                data=None,
                message="Attachment exceeds the 25 MB download limit.",
                status_code=413,
            )

        # Gmail API doesn't return the filename here; the filename lives in
        # the parent message's part headers. Return as octet-stream — the
        # frontend can set a custom filename from the message detail payload.
        response = HttpResponse(decoded, content_type="application/octet-stream")
        response["Content-Disposition"] = (
            f'attachment; filename="attachment_{attachment_id}"'
        )
        response["Content-Length"] = len(decoded)
        return response
