import logging
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google_auth.services import get_google_client

logger = logging.getLogger(__name__)


class GoogleTasksService:
    """
    Service layer for bidirectional Google Tasks synchronization.
    Reuses BE1 get_google_client(user).
    """

    def __init__(self, user):
        self.user = user
        self.service = None
        try:
            credentials = get_google_client(user)
            self.service = build('tasks', 'v1', credentials=credentials)
        except Exception as exc:
            logger.info("Google Tasks service unavailable for user %s: %s", user.id, exc)
            self.service = None

    def is_connected(self) -> bool:
        return self.service is not None

    def push_create(self, task):
        """Create a task in Google Tasks and store its external google_task_id."""
        if not self.service:
            return None

        try:
            body = {
                'title': task.title,
                'notes': task.description or '',
                'status': 'completed' if task.status == 'completed' else 'needsAction',
            }
            if task.due_date:
                body['due'] = task.due_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')

            res = self.service.tasks().insert(tasklist='@default', body=body).execute()
            task.google_task_id = res.get('id')
            task.save(update_fields=['google_task_id'])
            return task.google_task_id
        except Exception as exc:
            logger.warning("Failed to push task creation to Google Tasks: %s", exc)
            return None

    def push_update(self, task):
        """Update an existing task in Google Tasks."""
        if not self.service or not task.google_task_id:
            return None

        try:
            body = {
                'id': task.google_task_id,
                'title': task.title,
                'notes': task.description or '',
                'status': 'completed' if task.status == 'completed' else 'needsAction',
            }
            if task.due_date:
                body['due'] = task.due_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')

            res = self.service.tasks().patch(
                tasklist='@default',
                task=task.google_task_id,
                body=body
            ).execute()
            return res.get('id')
        except Exception as exc:
            logger.warning("Failed to push task update to Google Tasks: %s", exc)
            return None

    def push_delete(self, google_task_id):
        """Delete an existing task in Google Tasks."""
        if not self.service or not google_task_id:
            return False

        try:
            self.service.tasks().delete(
                tasklist='@default',
                task=google_task_id
            ).execute()
            return True
        except Exception as exc:
            logger.warning("Failed to delete task from Google Tasks: %s", exc)
            return False

    def sync_from_google(self):
        """
        Fetch tasks from Google Tasks @default list and merge them into PostgreSQL without duplicating.
        """
        if not self.service:
            return {'synced': 0, 'created': 0, 'updated': 0, 'connected': False}

        from .models import Task
        created_count = 0
        updated_count = 0

        try:
            res = self.service.tasks().list(tasklist='@default', maxResults=100).execute()
            items = res.get('items', [])

            for item in items:
                gt_id = item.get('id')
                if not gt_id:
                    continue

                title = item.get('title', '').strip() or 'Untitled Task'
                notes = item.get('notes', '')
                status = 'completed' if item.get('status') == 'completed' else 'todo'
                due_str = item.get('due')

                existing = Task.objects.filter(owner=self.user, google_task_id=gt_id).first()
                if existing:
                    existing.title = title
                    existing.description = notes
                    existing.status = status
                    existing.save(update_fields=['title', 'description', 'status', 'updated_at'])
                    updated_count += 1
                else:
                    Task.objects.create(
                        owner=self.user,
                        google_task_id=gt_id,
                        title=title,
                        description=notes,
                        status=status,
                    )
                    created_count += 1

            return {
                'synced': len(items),
                'created': created_count,
                'updated': updated_count,
                'connected': True,
            }
        except Exception as exc:
            logger.warning("Failed to pull Google Tasks: %s", exc)
            return {'synced': 0, 'created': 0, 'updated': 0, 'connected': False, 'error': str(exc)}
