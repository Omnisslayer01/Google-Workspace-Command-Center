from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Membership, Organization, Role

User = get_user_model()


class RBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Organization
        self.org = Organization.objects.create(name="Test Org")
        self.other_org = Organization.objects.create(name="Other Org")

        # Create Users
        self.admin_user = User.objects.create_user(
            username="admin_user",
            email="admin@test.com",
            first_name="Admin",
            last_name="User",
            password="password123",
        )
        self.manager_user = User.objects.create_user(
            username="manager_user",
            email="manager@test.com",
            first_name="Manager",
            last_name="User",
            password="password123",
        )
        self.member_user = User.objects.create_user(
            username="member_user",
            email="member@test.com",
            first_name="Regular",
            last_name="Member",
            password="password123",
        )
        self.outsider_user = User.objects.create_user(
            username="outsider_user",
            email="outsider@test.com",
            first_name="Outsider",
            last_name="User",
            password="password123",
        )

        # Create Memberships
        self.admin_membership = Membership.objects.create(
            user=self.admin_user,
            organization=self.org,
            role=Role.ADMIN,
        )
        self.manager_membership = Membership.objects.create(
            user=self.manager_user,
            organization=self.org,
            role=Role.MANAGER,
        )
        self.member_membership = Membership.objects.create(
            user=self.member_user,
            organization=self.org,
            role=Role.MEMBER,
        )

    # ------------------ TestOrgPermissionView Tests ------------------
    def test_permission_view_unauthenticated(self):
        response = self.client.get(f"/api/rbac/test-permission/?organization_id={self.org.id}")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_permission_view_missing_org_id(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/rbac/test-permission/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_permission_view_forbidden_for_member(self):
        self.client.force_authenticate(user=self.member_user)
        response = self.client.get(f"/api/rbac/test-permission/?organization_id={self.org.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_permission_view_allowed_for_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        response = self.client.get(f"/api/rbac/test-permission/?organization_id={self.org.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["your_role"], Role.MANAGER)

    def test_permission_view_allowed_for_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f"/api/rbac/test-permission/?organization_id={self.org.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["your_role"], Role.ADMIN)

    # ------------------ OrgMemberListView Tests ------------------
    def test_member_list_allowed_for_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f"/api/rbac/orgs/{self.org.id}/members/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_member_list_allowed_for_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        response = self.client.get(f"/api/rbac/orgs/{self.org.id}/members/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_member_list_forbidden_for_member(self):
        self.client.force_authenticate(user=self.member_user)
        response = self.client.get(f"/api/rbac/orgs/{self.org.id}/members/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_member_list_search_by_username_and_email(self):
        self.client.force_authenticate(user=self.admin_user)

        # Search by email
        response = self.client.get(f"/api/rbac/orgs/{self.org.id}/members/?search=admin@test.com")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["email"], "admin@test.com")

        # Search by first name
        response = self.client.get(f"/api/rbac/orgs/{self.org.id}/members/?search=Regular")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["user_id"], self.member_user.id)

    def test_member_list_filter_by_role(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f"/api/rbac/orgs/{self.org.id}/members/?role=manager")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["role"], Role.MANAGER)

    def test_member_list_filter_invalid_role(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f"/api/rbac/orgs/{self.org.id}/members/?role=superboss")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ------------------ OrgMemberRoleUpdateView Tests ------------------
    def test_update_role_success(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            f"/api/rbac/orgs/{self.org.id}/members/{self.member_user.id}/role/",
            {"role": "manager"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.member_membership.refresh_from_db()
        self.assertEqual(self.member_membership.role, Role.MANAGER)

    def test_update_role_forbidden_for_manager(self):
        self.client.force_authenticate(user=self.manager_user)
        response = self.client.patch(
            f"/api/rbac/orgs/{self.org.id}/members/{self.member_user.id}/role/",
            {"role": "admin"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_role_cannot_demote_last_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        # Attempt to demote sole admin in the org
        response = self.client.patch(
            f"/api/rbac/orgs/{self.org.id}/members/{self.admin_user.id}/role/",
            {"role": "manager"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.admin_membership.refresh_from_db()
        self.assertEqual(self.admin_membership.role, Role.ADMIN)

    def test_update_role_can_demote_admin_if_another_exists(self):
        # Promote manager to admin first
        self.manager_membership.role = Role.ADMIN
        self.manager_membership.save()

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            f"/api/rbac/orgs/{self.org.id}/members/{self.admin_user.id}/role/",
            {"role": "manager"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.admin_membership.refresh_from_db()
        self.assertEqual(self.admin_membership.role, Role.MANAGER)

    def test_update_role_not_found(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            f"/api/rbac/orgs/{self.org.id}/members/{self.outsider_user.id}/role/",
            {"role": "manager"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_role_invalid_role(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            f"/api/rbac/orgs/{self.org.id}/members/{self.member_user.id}/role/",
            {"role": "invalid_role"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
