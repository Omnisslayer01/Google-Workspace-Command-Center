from celery import shared_task
from django.utils import timezone
from .models import Trigger, AutomationExecution, AutomationStepResult
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_scheduled_triggers():
    """
    Periodic task to check for time-based triggers that are due.
    For each due trigger, it initiates an execution.
    """
    logger.info("Checking for scheduled triggers...")
    
    # Example logic for fetching scheduled triggers
    # In a real scenario, we'd parse Trigger.config to check the schedule
    triggers = Trigger.objects.filter(type='scheduled')
    for trigger in triggers:
        # Placeholder for actual due-check logic
        is_due = True
        
        if is_due:
            # Create execution
            execution = AutomationExecution.objects.create(automation=trigger.automation)
            run_automation.delay(execution.id, {"source": "scheduled"})


from automation.executor import AutomationExecutor

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=5)
def run_automation(self, execution_id, trigger_payload):
    """
    Executes the automation steps. Uses exponential backoff for retries.
    Checks idempotency before executing actions.
    """
    execution = AutomationExecution.objects.get(id=execution_id)
    if execution.status in ["succeeded", "failed", "partially_succeeded"]:
        return # Already completed
        
    execution.status = "running"
    if not execution.started_at:
        execution.started_at = timezone.now()
    execution.save()

    executor = AutomationExecutor(execution, trigger_payload)
    executor.run()

@shared_task
def poll_gmail_triggers():
    logger.info("Polling Gmail triggers...")
    triggers = Trigger.objects.filter(type='gmail_new', automation__is_active=True)
    for trigger in triggers:
        from gmail_integration.services import GmailService
        try:
            service = GmailService(trigger.automation.owner)
            last_polled = trigger.last_polled_at
            query = f"after:{int(last_polled.timestamp())}" if last_polled else ""
            response = service.list_messages(query=query, max_results=10)
            messages = response.get("messages", [])
            for msg in messages:
                execution = AutomationExecution.objects.create(automation=trigger.automation)
                run_automation.delay(execution.id, {"message_id": msg["id"]})
            trigger.last_polled_at = timezone.now()
            trigger.save()
        except Exception as e:
            logger.warning(f"Error polling gmail for trigger {trigger.id}: {e}")

@shared_task
def poll_calendar_triggers():
    logger.info("Polling Calendar triggers...")
    triggers = Trigger.objects.filter(type='calendar_new', automation__is_active=True)
    for trigger in triggers:
        from calendar_integration.services import CalendarService
        try:
            service = CalendarService(trigger.automation.owner)
            last_polled = trigger.last_polled_at
            time_min = last_polled.isoformat() if last_polled else None
            response = service.list_events(time_min=time_min, max_results=10)
            events = response.get("items", [])
            for event in events:
                execution = AutomationExecution.objects.create(automation=trigger.automation)
                run_automation.delay(execution.id, {"event_id": event["id"]})
            trigger.last_polled_at = timezone.now()
            trigger.save()
        except Exception as e:
            logger.warning(f"Error polling calendar for trigger {trigger.id}: {e}")

@shared_task
def poll_drive_triggers():
    logger.info("Polling Drive triggers...")
    triggers = Trigger.objects.filter(type='drive_new', automation__is_active=True)
    for trigger in triggers:
        from drive.services import DriveService
        try:
            service = DriveService(trigger.automation.owner)
            last_polled = trigger.last_polled_at
            query = f"createdTime > '{last_polled.isoformat()}'" if last_polled else ""
            response = service.list_files(query=query, page_size=10)
            files = response.get("files", [])
            for f in files:
                execution = AutomationExecution.objects.create(automation=trigger.automation)
                run_automation.delay(execution.id, {"file_id": f["id"]})
            trigger.last_polled_at = timezone.now()
            trigger.save()
        except Exception as e:
            logger.warning(f"Error polling drive for trigger {trigger.id}: {e}")

@shared_task
def cleanup_expired_records():
    logger.info("Cleaning up expired records...")
    threshold = timezone.now() - timezone.timedelta(days=30)
    
    # Delete old executions
    deleted_executions, _ = AutomationExecution.objects.filter(created_at__lt=threshold).delete()
    logger.info(f"Deleted {deleted_executions} old automation executions.")
    
    from notifications.models import Notification
    # Delete old notifications
    deleted_notifications, _ = Notification.objects.filter(created_at__lt=threshold).delete()
    logger.info(f"Deleted {deleted_notifications} old notifications.")
