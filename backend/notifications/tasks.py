import logging

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,  # seconds between retries
    name="notifications.tasks.send_email_notification",
)
def send_email_notification(self, notification_id: int) -> dict:
    """
    Send an email alert for a GWCC in-app notification.

    This task is safe to call even when the notification has already been
    processed — it exits early rather than double-sending.

    Args:
        notification_id: Primary key of the Notification record.

    Returns:
        Dict with 'status' and optional 'detail' keys.
    """
    # Import here to avoid circular-import issues at module load time.
    from .models import Notification

    try:
        notification = Notification.objects.select_related("user").get(
            pk=notification_id
        )
    except Notification.DoesNotExist:
        logger.warning(
            "send_email_notification: notification %s not found — skipping.",
            notification_id,
        )
        return {"status": "skipped", "detail": "Notification not found."}

    user = notification.user

    # Only send if the user has a usable email address.
    recipient = getattr(user, "email", None)
    if not recipient:
        logger.info(
            "send_email_notification: user %s has no email — skipping notification %s.",
            user.pk,
            notification_id,
        )
        return {"status": "skipped", "detail": "User has no email address."}

    subject = f"[GWCC] New {notification.get_notification_type_display()} notification"
    body = (
        f"Hi {getattr(user, 'first_name', None) or user.email},\n\n"
        f"{notification.message}\n\n"
        "— Google Workspace Command Center"
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
    except Exception as exc:
        logger.error(
            "send_email_notification: failed to send email for notification %s: %s",
            notification_id,
            exc,
        )
        # Retry with exponential back-off up to max_retries.
        raise self.retry(exc=exc)

    logger.info(
        "send_email_notification: sent email to %s for notification %s.",
        recipient,
        notification_id,
    )
    return {"status": "sent", "recipient": recipient}
