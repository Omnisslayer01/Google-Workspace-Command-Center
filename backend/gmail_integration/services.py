from googleapiclient.discovery import build


class GmailService:
    """
    Service layer for Gmail API operations.

    Google authentication and token handling are owned by BE1.
    This service only consumes the authenticated Google client.
    """

    def __init__(self, user):
        self.user = user

       
        from google_auth.services import get_google_client

        credentials = get_google_client(user)

        self.gmail = build(
            "gmail",
            "v1",
            credentials=credentials,
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

        return response

    def get_message(self, message_id):
        return (
            self.gmail.users()
            .messages()
            .get(
                userId="me",
                id=message_id,
                format="full",
            )
            .execute()
        )

    def search(self, query, max_results=20, page_token=None):
        response = (
            self.gmail.users()
            .messages()
            .list(
                userId="me",
                q=query,
                maxResults=max_results,
                pageToken=page_token,
            )
            .execute()
        )

        return response

    def send(self, to, subject, body):
        
        pass

    def create_draft(self, to, subject, body):
        
        pass

    def get_attachment(self, message_id, attachment_id):
        
        pass