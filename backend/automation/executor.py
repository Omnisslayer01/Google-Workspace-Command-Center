from django.utils import timezone
from .models import AutomationExecution, AutomationStepResult
from notifications.models import Notification
from tasks.models import Task
from gmail_integration.services import GmailService
from calendar_integration.services import CalendarService
from drive.services import DriveService
from sheets.services import SheetsService

class AutomationExecutor:
    def __init__(self, execution, trigger_payload):
        self.execution = execution
        self.automation = execution.automation
        self.trigger_payload = trigger_payload
        self.user = self.automation.owner

    def execute_action(self, action):
        config = action.config
        
        if action.type == "gmail_send":
            service = GmailService(self.user)
            to = config.get("to")
            subject = config.get("subject")
            body = config.get("body")
            service.send(to, subject, body)
            
        elif action.type == "calendar_create":
            service = CalendarService(self.user)
            summary = config.get("summary")
            start_time = config.get("start_time")
            end_time = config.get("end_time")
            description = config.get("description")
            location = config.get("location")
            attendees = config.get("attendees")
            service.create_event(summary, start_time, end_time, description, location, attendees)
            
        elif action.type == "calendar_update":
            service = CalendarService(self.user)
            event_id = config.get("event_id")
            service.update_event(
                event_id,
                summary=config.get("summary"),
                start_time=config.get("start_time"),
                end_time=config.get("end_time"),
                description=config.get("description"),
                location=config.get("location"),
                attendees=config.get("attendees")
            )
            
        elif action.type == "drive_folder":
            service = DriveService(self.user)
            name = config.get("name")
            parent_id = config.get("parent_id")
            service.create_folder(name, parent_id)
            
        elif action.type == "drive_save":
            from gmail_integration.tasks import process_large_attachment
            # In a real scenario, the trigger_payload provides the message_id and attachment_id.
            message_id = self.trigger_payload.get("message_id")
            attachment_id = self.trigger_payload.get("attachment_id")
            folder_id = config.get("folder_id")
            if message_id and attachment_id:
                process_large_attachment.delay(self.user.id, message_id, attachment_id, folder_id)
                
        elif action.type == "sheets_write":
            service = SheetsService(self.user)
            spreadsheet_id = config.get("spreadsheet_id")
            range_name = config.get("range_name")
            values = config.get("values")
            service.append_values(spreadsheet_id, range_name, values)
            
        elif action.type == "task_create":
            Task.objects.create(
                title=config.get("title", "Automated Task"),
                description=config.get("description", ""),
                due_date=config.get("due_date"),
                owner=self.user,
                created_by_automation=self.automation
            )
            
        elif action.type == "notify":
            Notification.objects.create(
                user=self.user,
                notification_type=config.get("notification_type", Notification.NotificationType.SYSTEM),
                message=config.get("message", "Automated Notification")
            )
        else:
            raise ValueError(f"Unknown action type: {action.type}")

    def run(self):
        success_count = 0
        failure_count = 0

        actions = self.automation.actions.all().order_by('order')

        for action in actions:
            # Idempotency check:
            existing_result = AutomationStepResult.objects.filter(
                execution=self.execution, action=action
            ).first()
            if existing_result and existing_result.status == "succeeded":
                success_count += 1
                continue

            try:
                self.execute_action(action)

                AutomationStepResult.objects.update_or_create(
                    execution=self.execution,
                    action=action,
                    defaults={"status": "succeeded", "error": ""}
                )
                success_count += 1

            except Exception as exc:
                # If it's a 4xx error (e.g. from Google API), we mark as failed and continue/break.
                # If it's 5xx, we should raise it to trigger Celery retry.
                # For simplicity here, if it has a status_code >= 500, we raise it.
                status_code = getattr(exc, 'status_code', 400)
                if hasattr(exc, 'resp') and hasattr(exc.resp, 'status'):
                    status_code = exc.resp.status
                
                if status_code >= 500:
                    raise  # triggers Celery retry
                
                AutomationStepResult.objects.update_or_create(
                    execution=self.execution,
                    action=action,
                    defaults={"status": "failed", "error": str(exc)}
                )
                failure_count += 1
                # If one action fails, the automation stops (as per standard workflow logic)
                break

        self.execution.finished_at = timezone.now()

        if failure_count == 0 and success_count == len(actions):
            self.execution.status = "succeeded"
        elif success_count == 0:
            self.execution.status = "failed"
        else:
            self.execution.status = "partially_succeeded"

        self.execution.save()
        return self.execution