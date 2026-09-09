from googleapiclient.discovery import build

from google_auth.services import get_google_client


class GmailService:
    """
    Service layer for Gmail API operations.

    Views should use this service instead of calling
    the Gmail API directly.
    """

    def __init__(self, user):
        self.user = user
        self.client = get_google_client(user)
        self.gmail = build(
            "gmail",
            "v1",
            credentials=self.client,
        )

    def list_messages(self, max_results=20, page_token=None):
        response = (
            self.gmail.users()
            .messages()
            .list(
                userId="me",
                maxResults=max_results,
                pageToken=page_token,
            )
            .execute()
        )
