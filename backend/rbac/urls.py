from django.urls import path

from .views import (
    TestOrgPermissionView,
    OrgMemberListView,
    OrgMemberRoleUpdateView,
)

urlpatterns = [
    path(
        "test-permission/",
        TestOrgPermissionView.as_view(),
        name="test_org_permission",
    ),
    path(
        "orgs/<int:organization_id>/members/",
        OrgMemberListView.as_view(),
        name="org_members",
    ),
    path(
        "orgs/<int:organization_id>/members/<int:user_id>/role/",
        OrgMemberRoleUpdateView.as_view(),
        name="org_member_role",
    ),
]
