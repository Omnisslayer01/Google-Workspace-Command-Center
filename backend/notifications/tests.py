"""
Notification tests.

Covers:
  - Notification model
  - Notification API views: auth, user isolation, list, filtering,
    mark-read (single + all)
  - Celery email notification task
"""

from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Notification
from .tasks import send_email_notification

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _jwt_for(user):
    return str(RefreshToken.for_user(user).access_token)


def _make_notification(user, message="Test message", ntype="system", is_read=False):
    return Notification.objects.create(
        user=user,
        notification_type=ntype,
        message=message,
        is_read=is_read,
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class NotificationModelTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="modeluser", email="model@example.com", password="pass"
        )

    def test_default_is_read_is_false(self):
        n = _make_notification(self.user)
        self.assertFalse(n.is_read)

    def test_str_representation(self):
        n = _make_notification(self.user, ntype="gmail")
        self.assertIn("gmail", str(n))
        self.assertIn("unread", str(n))

    def test_ordering_newest_first(self):
        n1 = _make_notification(self.user, message="first")
        n2 = _make_notification(self.user, message="second")
        notifications = list(Notification.objects.filter(user=self.user))
        # Newest (n2) should come first
        self.assertEqual(notifications[0].pk, n2.pk)
        self.assertEqual(notifications[1].pk, n1.pk)

    def test_all_notification_types_are_valid(self):
        for ntype, _ in Notification.NotificationType.choices:
            n = Notification.objects.create(
                user=self.user, notification_type=ntype, message="msg"
            )
            self.assertEqual(n.notification_type, ntype)


# ---------------------------------------------------------------------------
# Auth guard tests
# ---------------------------------------------------------------------------

class NotificationAuthTests(APITestCase):
    UNAUTHENTICATED_CASES = [
        ("get", "/api/notifications/"),
        ("patch", "/api/notifications/1/read/"),
        ("post", "/api/notifications/read-all/"),
    ]

    def test_unauthenticated_requests_are_rejected(self):
        for method, url in self.UNAUTHENTICATED_CASES:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method)(url)
                self.assertIn(
                    response.status_code,
                    [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
                )


# ---------------------------------------------------------------------------
# Notification list view
# ---------------------------------------------------------------------------

class NotificationListViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="listuser", email="list@example.com", password="pass"
        )
        self.other = User.objects.create_user(
            username="otheruser", email="other@example.com", password="pass"
        )
        self.token = _jwt_for(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_returns_only_own_notifications(self):
        _make_notification(self.user, message="mine")
        _make_notification(self.other, message="theirs")

        response = self.client.get("/api/notifications/", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notifications = response.data["data"]["notifications"]
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0]["message"], "mine")

    def test_empty_list_returns_zero_count(self):
        response = self.client.get("/api/notifications/", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]["notifications"]), 0)
        self.assertEqual(response.data["data"]["unread_count"], 0)

    def test_unread_count_is_correct(self):
        _make_notification(self.user, is_read=False)
        _make_notification(self.user, is_read=False)
        _make_notification(self.user, is_read=True)

        response = self.client.get("/api/notifications/", **self.auth)

        self.assertEqual(response.data["data"]["unread_count"], 2)

    def test_unread_only_filter(self):
        _make_notification(self.user, message="unread", is_read=False)
        _make_notification(self.user, message="read", is_read=True)

        response = self.client.get("/api/notifications/?unread_only=true", **self.auth)

        notifications = response.data["data"]["notifications"]
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0]["message"], "unread")

    def test_response_shape_contains_expected_fields(self):
        _make_notification(self.user)

        response = self.client.get("/api/notifications/", **self.auth)

        n = response.data["data"]["notifications"][0]
        for field in ("id", "notification_type", "message", "is_read", "created_at"):
            self.assertIn(field, n, msg=f"Field '{field}' missing from response")


# ---------------------------------------------------------------------------
# Mark single notification read
# ---------------------------------------------------------------------------

class NotificationMarkReadViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="markuser", email="mark@example.com", password="pass"
        )
        self.other = User.objects.create_user(
            username="markother", email="markother@example.com", password="pass"
        )
        self.token = _jwt_for(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_marks_own_notification_as_read(self):
        n = _make_notification(self.user, is_read=False)

        response = self.client.patch(f"/api/notifications/{n.pk}/read/", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        n.refresh_from_db()
        self.assertTrue(n.is_read)
        self.assertTrue(response.data["data"]["is_read"])

    def test_cannot_mark_other_users_notification(self):
        other_n = _make_notification(self.other)

        response = self.client.patch(
            f"/api/notifications/{other_n.pk}/read/", **self.auth
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_nonexistent_notification_returns_404(self):
        response = self.client.patch("/api/notifications/99999/read/", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_already_read_notification_stays_read(self):
        n = _make_notification(self.user, is_read=True)

        response = self.client.patch(f"/api/notifications/{n.pk}/read/", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        n.refresh_from_db()
        self.assertTrue(n.is_read)


# ---------------------------------------------------------------------------
# Mark all notifications read
# ---------------------------------------------------------------------------

class NotificationMarkAllReadViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="allreaduser", email="allread@example.com", password="pass"
        )
        self.other = User.objects.create_user(
            username="allreadother", email="allreadother@example.com", password="pass"
        )
        self.token = _jwt_for(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_marks_all_own_unread_as_read(self):
        _make_notification(self.user, is_read=False)
        _make_notification(self.user, is_read=False)
        _make_notification(self.user, is_read=True)

        response = self.client.post("/api/notifications/read-all/", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["marked_read"], 2)
        self.assertEqual(
            Notification.objects.filter(user=self.user, is_read=False).count(), 0
        )

    def test_does_not_touch_other_users_notifications(self):
        other_n = _make_notification(self.other, is_read=False)

        self.client.post("/api/notifications/read-all/", **self.auth)

        other_n.refresh_from_db()
        self.assertFalse(other_n.is_read)

    def test_returns_zero_when_nothing_to_mark(self):
        response = self.client.post("/api/notifications/read-all/", **self.auth)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["marked_read"], 0)


# ---------------------------------------------------------------------------
# Celery task tests
# ---------------------------------------------------------------------------

class SendEmailNotificationTaskTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="taskuser",
            email="taskuser@example.com",
            password="pass",
        )

    def test_task_skips_when_notification_not_found(self):
        result = send_email_notification(99999)
        self.assertEqual(result["status"], "skipped")

    def test_task_skips_when_user_has_no_email(self):
        self.user.email = ""
        self.user.save()
        n = _make_notification(self.user)

        result = send_email_notification(n.pk)

        self.assertEqual(result["status"], "skipped")

    @patch("notifications.tasks.send_mail")
    def test_task_sends_email_to_user(self, mock_send_mail):
        n = _make_notification(self.user, message="You have a new Gmail message.")

        result = send_email_notification(n.pk)

        self.assertEqual(result["status"], "sent")
        self.assertEqual(result["recipient"], self.user.email)
        mock_send_mail.assert_called_once()
        call_kwargs = mock_send_mail.call_args
        # Recipient must be the user's email
        self.assertIn(self.user.email, call_kwargs.kwargs["recipient_list"])

    @patch("notifications.tasks.send_mail")
    def test_task_subject_contains_notification_type(self, mock_send_mail):
        n = _make_notification(self.user, ntype="gmail")

        send_email_notification(n.pk)

        subject = mock_send_mail.call_args.kwargs["subject"]
        self.assertIn("Gmail", subject)

    @patch("notifications.tasks.send_mail")
    def test_task_retries_on_send_failure(self, mock_send_mail):
        """Task should raise Retry (not swallow) when send_mail fails."""
        mock_send_mail.side_effect = Exception("SMTP down")
        n = _make_notification(self.user)

        # Calling the underlying function directly bypasses Celery retry machinery.
        # We verify that the task raises when send_mail raises.
        with self.assertRaises(Exception):
            # Call the task function's run() to bypass Celery retry wrapping in tests
            send_email_notification.run(n.pk)
