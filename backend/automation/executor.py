from django.utils import timezone

from .models import AutomationExecution, AutomationStepResult


class AutomationExecutor:

    def __init__(self, automation):
        self.automation = automation

    def run(self):
        execution = AutomationExecution.objects.create(
            automation=self.automation,
            status="running",
            started_at=timezone.now(),
        )

        success_count = 0
        failure_count = 0

        actions = self.automation.actions.all()

        for action in actions:

            try:
                self.execute_action(action)

                AutomationStepResult.objects.create(
                    execution=execution,
                    action=action,
                    status="succeeded",
                )

                success_count += 1

            except Exception as exc:

                AutomationStepResult.objects.create(
                    execution=execution,
                    action=action,
                    status="failed",
                    error=str(exc),
                )

                failure_count += 1

        execution.finished_at = timezone.now()

        if failure_count == 0:
            execution.status = "succeeded"

        elif success_count == 0:
            execution.status = "failed"

        else:
            execution.status = "partially_succeeded"

        execution.save()

        return execution

    def execute_action(self, action):
        """
        Placeholder.

        Task 5 will connect these to GmailService,
        CalendarService, DriveService, and SheetsService.
        """

        print(f"Executing {action.type}")