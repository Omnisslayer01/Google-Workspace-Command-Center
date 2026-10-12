from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Automation, Trigger, Condition, Action, AutomationExecution


class AutomationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="automationuser",
            password="secretpassword123",
        )
        self.client.force_authenticate(user=self.user)

    def test_list_automations_empty(self):
        response = self.client.get("/api/automations/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_create_and_list_automation(self):
        payload = {
            "name": "Sync Gmail to Tasks",
            "trigger": {
                "type": "gmail_new",
                "config": {},
            },
            "conditions": [
                {
                    "field": "subject",
                    "operator": "contains",
                    "value": "Urgent",
                }
            ],
            "actions": [
                {
                    "type": "task_create",
                    "config": {
                        "title": "Urgent email task",
                    },
                    "order": 1,
                }
            ],
        }

        create_res = self.client.post("/api/automations/", payload, format="json")
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        self.assertIn("automation_id", create_res.data)

        list_res = self.client.get("/api/automations/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)
        item = list_res.data[0]
        self.assertEqual(item["name"], "Sync Gmail to Tasks")
        self.assertEqual(item["trigger"]["type"], "gmail_new")
        self.assertEqual(len(item["conditions"]), 1)
        self.assertEqual(len(item["actions"]), 1)
        self.assertEqual(item["actions"][0]["type"], "task_create")

    def test_create_automation_validation_error(self):
        # drive_folder is not allowed for gmail_new trigger
        payload = {
            "name": "Invalid trigger action combo",
            "trigger": {
                "type": "gmail_new",
                "config": {},
            },
            "actions": [
                {
                    "type": "drive_folder",
                    "config": {},
                    "order": 1,
                }
            ],
        }
        res = self.client.post("/api/automations/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_toggle_and_delete_automation(self):
        automation = Automation.objects.create(
            name="Test Auto",
            owner=self.user,
            is_active=True,
        )
        Trigger.objects.create(
            automation=automation,
            type="manual",
            config={},
        )
        Action.objects.create(
            automation=automation,
            type="notify",
            config={"message": "Hello"},
            order=1,
        )

        patch_res = self.client.patch(
            f"/api/automations/{automation.id}/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertFalse(patch_res.data["is_active"])

        del_res = self.client.delete(f"/api/automations/{automation.id}/")
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Automation.objects.filter(id=automation.id).count(), 0)

    def test_run_automation_manual(self):
        automation = Automation.objects.create(
            name="Notify on demand",
            owner=self.user,
            is_active=True,
        )
        Trigger.objects.create(
            automation=automation,
            type="manual",
            config={},
        )
        Action.objects.create(
            automation=automation,
            type="notify",
            config={"message": "System alert triggered"},
            order=1,
        )

        run_res = self.client.post(
            f"/api/automations/{automation.id}/run/",
            {},
            format="json",
        )
        self.assertEqual(run_res.status_code, status.HTTP_200_OK)
        self.assertIn("execution_id", run_res.data)
        self.assertEqual(run_res.data["status"], "succeeded")

    def test_execution_history(self):
        history_res = self.client.get("/api/automations/executions/")
        self.assertEqual(history_res.status_code, status.HTTP_200_OK)
        self.assertIn("executions", history_res.data)
