from celery import shared_task
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def sync_google_data(self, user_id):
    """
    Syncs Google Data for a specific user (e.g. refresh token, profile info).
    """
    try:
        user = User.objects.get(id=user_id)
        # Fetch user's GoogleCredential and perform sync
        logger.info(f"Syncing Google data for user {user.username}")
        
        # Example logic to trigger credential refresh or data sync here
        if hasattr(user, 'google_credential'):
            # user.google_credential.refresh_token_if_needed()
            pass
            
    except User.DoesNotExist:
        logger.warning(f"User {user_id} does not exist. Cannot sync.")


@shared_task
def sync_all_google_data():
    """
    Periodic task that queues a sync job for all active users.
    """
    logger.info("Queuing sync tasks for all active users...")
    for user in User.objects.filter(is_active=True):
        sync_google_data.delay(user.id)
