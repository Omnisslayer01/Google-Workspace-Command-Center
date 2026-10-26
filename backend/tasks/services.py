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
        """Create a task in Google Tasks and save its Google task ID."""
        if not self.service:
            raise RuntimeError(
                "Google Tasks is not connected. Please reconnect your Google account."
                )
        
        body = {
            'title': task.title,
            'notes': task.description or '',
            'status': (
                'completed'
                if task.status == 'completed'
                else 'needsAction'
                ),
            }
        
        if task.due_date:
            body['due'] = task.due_date.strftime('%Y-%m-%dT%H:%M:%S.000Z')

        try:
            response = self.service.tasks().insert(
                tasklist='@default',
                body=body,
                ).execute()
            google_task_id = response.get('id')
            
            if not google_task_id:
                raise RuntimeError(
                    "Google Tasks did not return a task ID."
                    )

            task.google_task_id = google_task_id
            task.save(update_fields=['google_task_id'])

            return google_task_id

        except Exception:
            logger.exception(
                "Failed to create task in Google Tasks for local task %s",
                task.pk,
                )
            raise

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
        if not self.service:
            return {
                'synced': 0,
                'created': 0,
                'updated': 0,
                'connected': False,
            }

        from django.utils.dateparse import parse_datetime
        from .models import Task

        created_count = 0
        updated_count = 0
        synced_count = 0

        try:
            page_token = None

            while True:
                params = {
                    'tasklist': '@default',
                    'maxResults': 100,
                }
                if page_token:
                    params['pageToken'] = page_token

                response = self.service.tasks().list(**params).execute()
                items = response.get('items', [])

                for item in items:
                    google_id = item.get('id')
                    if not google_id:
                        continue

                    due_date = None
                    if item.get('due'):
                        due_date = parse_datetime(item['due'])
                        if due_date is None:
                            logger.warning(
                                "Invalid due date for Google task %s",
                                google_id,
                            )

                    defaults = {
                        'title': item.get('title', '').strip() or 'Untitled Task',
                        'description': item.get('notes', ''),
                        'status': (
                            'completed'
                            if item.get('status') == 'completed'
                            else 'todo'
                        ),
                        'due_date': due_date,
                    }

                    task, created = Task.objects.update_or_create(
                        owner=self.user,
                        google_task_id=google_id,
                        defaults=defaults,
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

                    synced_count += 1

                page_token = response.get('nextPageToken')
                if not page_token:
                    break

            return {
                'synced': synced_count,
                'created': created_count,
                'updated': updated_count,
                'connected': True,
            }

        except Exception:
            logger.exception('Failed to sync Google Tasks')
            return {
                'synced': 0,
                'created': 0,
                'updated': 0,
                'connected': False,
                'error': 'Google Tasks synchronization failed.',
            }
