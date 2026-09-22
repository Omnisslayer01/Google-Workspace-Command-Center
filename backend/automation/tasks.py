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


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=5)
def run_automation(self, execution_id, trigger_payload):
    """
    Executes the automation steps. Uses exponential backoff for retries.
    Checks idempotency before executing actions.
    """
    execution = AutomationExecution.objects.get(id=execution_id)
    if execution.status in ["succeeded", "failed"]:
        return # Already completed
        
    execution.status = "running"
    if not execution.started_at:
        execution.started_at = timezone.now()
    execution.save()

    actions = execution.automation.actions.all().order_by('order')
    
    try:
        for action in actions:
            # Idempotency Check
            existing_result = AutomationStepResult.objects.filter(
                execution=execution, action=action
            ).first()
            
            if existing_result and existing_result.status == "succeeded":
                logger.info(f"Skipping already succeeded action: {action.id}")
                continue

            # Execute action logic here (e.g., calling external Google APIs)
            # If an external call returns a 4xx error, mark it as failed and DO NOT raise Exception:
            # AutomationStepResult.objects.update_or_create(..., defaults={"status": "failed"})
            
            # For 5xx errors or transient issues, raise the exception to trigger backoff retries.

            # Assuming success for placeholder:
            AutomationStepResult.objects.update_or_create(
                execution=execution, action=action,
                defaults={"status": "succeeded", "error": ""}
            )
            
        execution.status = "succeeded"
        execution.finished_at = timezone.now()
        execution.save()

    except Exception as e:
        # Transient errors fall here and will be retried by Celery
        logger.warning(f"Transient error in execution {execution_id}: {str(e)}")
        raise
