from django.urls import path

from .views import (
    AttachmentView,
    DraftCreateView,
    MessageDetailView,
    MessageListView,
    MessageSearchView,
    MessageSendView,
)

app_name = "gmail_integration"

urlpatterns = [
    # List inbox messages
    path("messages/", MessageListView.as_view(), name="message-list"),

    # Single message detail
    path("messages/<str:message_id>/", MessageDetailView.as_view(), name="message-detail"),

    # Search messages (GET /api/gmail/search/?q=...)
    path("search/", MessageSearchView.as_view(), name="message-search"),

    # Send a message
    path("send/", MessageSendView.as_view(), name="message-send"),

    # Create a draft
    path("drafts/", DraftCreateView.as_view(), name="draft-create"),

    # Download attachment
    path(
        "attachments/<str:message_id>/<str:attachment_id>/",
        AttachmentView.as_view(),
        name="attachment-download",
    ),
]
