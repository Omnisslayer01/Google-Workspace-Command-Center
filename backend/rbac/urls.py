
from django.urls import path

from .views import (
    TestOrgPermissionView,
    OrganizationsView,
    OrganizationMembersView,
    OrganizationMemberRoleView,
)

urlpatterns = [
    path(
        "test-permission/",
        TestOrgPermissionView.as_view(),
        name="test_org_permission",
    ),
    path(
        "organizations/",
        OrganizationsView.as_view(),
        name="organizations",
    ),
    path(
        "organizations/<int:organization_id>/members/",
        OrganizationMembersView.as_view(),
        name="organization_members",
    ),
    path(
        "organizations/<int:organization_id>/members/<int:membership_id>/role/",
        OrganizationMemberRoleView.as_view(),
        name="organization_member_role",
    ),
]
