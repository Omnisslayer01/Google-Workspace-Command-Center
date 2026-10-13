from django.urls import path

from .views import (
    MessagesListView,
    MessageDetailView,
    SearchView,
    LabelsView,
    ActivityMetricsView,
    SendEmailView,
    DraftView,
    AttachmentView,
)

urlpatterns = [
    path("messages/", MessagesListView.as_view()),
    path("messages/<str:message_id>/", MessageDetailView.as_view()),
    path("search/", SearchView.as_view()),
    path("labels/", LabelsView.as_view()),
    path("activity-metrics/", ActivityMetricsView.as_view()),
    path("send/", SendEmailView.as_view()),
    path("drafts/", DraftView.as_view()),
    path(
        "attachments/<str:message_id>/<str:attachment_id>/",
        AttachmentView.as_view(),
    ),
]