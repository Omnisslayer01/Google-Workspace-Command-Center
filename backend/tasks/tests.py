from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch, MagicMock

from .models import Task


class TaskAPITests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username='user_a@example.com', email='user_a@example.com', password='password123')
        self.user_b = User.objects.create_user(username='user_b@example.com', email='user_b@example.com', password='password123')
        self.list_url = reverse('task-list')

    def test_unauthenticated_cannot_access_tasks(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_and_list_tasks_authenticated(self):
        self.client.force_authenticate(user=self.user_a)

        payload = {
            'title': 'Test Project Launch',
            'description': 'Ensure all systems are ready',
            'status': 'todo',
        }
        create_resp = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_resp.data['title'], 'Test Project Launch')

        task_id = create_resp.data['id']
        self.assertTrue(Task.objects.filter(id=task_id, owner=self.user_a).exists())

        # List should show the task
        list_resp = self.client.get(self.list_url)
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        # Check that it's in list
        items = list_resp.data if isinstance(list_resp.data, list) else list_resp.data.get('results', [])
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['id'], task_id)

    def test_user_scoping_isolation(self):
        # User A creates a task
        task_a = Task.objects.create(owner=self.user_a, title="User A Task", status="todo")

        # User B queries tasks
        self.client.force_authenticate(user=self.user_b)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        items = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(items), 0)

        # User B tries to view or update User A's task directly
        detail_url = reverse('task-detail', kwargs={'pk': task_a.id})
        detail_resp = self.client.get(detail_url)
        self.assertEqual(detail_resp.status_code, status.HTTP_404_NOT_FOUND)

        patch_resp = self.client.patch(detail_url, {'status': 'completed'})
        self.assertEqual(patch_resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_task_status_validation(self):
        self.client.force_authenticate(user=self.user_a)
        invalid_payload = {
            'title': 'Invalid Status Task',
            'status': 'non_existent_status',
        }
        response = self.client.post(self.list_url, invalid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        error_dict = response.data.get('error', response.data)
        self.assertIn('status', error_dict)

    def test_task_patch_and_delete(self):
        self.client.force_authenticate(user=self.user_a)
        task = Task.objects.create(owner=self.user_a, title="Initial Task", status="todo")

        detail_url = reverse('task-detail', kwargs={'pk': task.id})
        patch_resp = self.client.patch(detail_url, {'status': 'completed', 'title': 'Updated Title'}, format='json')
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_resp.data['status'], 'completed')
        self.assertEqual(patch_resp.data['title'], 'Updated Title')

        delete_resp = self.client.delete(detail_url)
        self.assertEqual(delete_resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())

    def test_task_sync_action_without_google_connection(self):
        self.client.force_authenticate(user=self.user_a)
        sync_url = reverse('task-sync')
        response = self.client.post(sync_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('connected', response.data)
        self.assertFalse(response.data['connected'])
