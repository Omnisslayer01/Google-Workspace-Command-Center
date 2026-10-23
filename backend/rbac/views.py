
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Organization, Membership, Role
from .permissions import HasOrgPermission
from .serializers import (
    OrganizationSerializer,
    CreateOrganizationSerializer,
    OrganizationMemberSerializer,
    AddOrganizationMemberSerializer,
    MemberSerializer,
    RoleUpdateSerializer,
)

User = get_user_model()


def get_membership_or_404(user, organization_id):
    return get_object_or_404(
        Membership.objects.select_related("organization", "user"),
        user=user,
        organization_id=organization_id,
    )


def require_admin(user, organization_id):
    membership = get_membership_or_404(user, organization_id)
    return membership if membership.role == Role.ADMIN else None


class OrganizationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        organizations = (
            Organization.objects.filter(memberships__user=request.user)
            .distinct()
            .order_by("name")
        )
        serializer = OrganizationSerializer(
            organizations, many=True, context={"request": request}
        )
        return Response({
            "success": True,
            "count": len(serializer.data),
            "results": serializer.data,
        })

    def post(self, request):
        serializer = CreateOrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            organization = serializer.save()
            Membership.objects.create(
                user=request.user,
                organization=organization,
                role=Role.ADMIN,
            )

        result = OrganizationSerializer(
            organization, context={"request": request}
        )
        return Response(
            {"success": True, "organization": result.data},
            status=status.HTTP_201_CREATED,
        )


class OrganizationMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, organization_id):
        get_membership_or_404(request.user, organization_id)
        members = (
            Membership.objects.filter(organization_id=organization_id)
            .select_related("user")
            .order_by("created_at")
        )
        serializer = OrganizationMemberSerializer(members, many=True)
        return Response({
            "success": True,
            "count": len(serializer.data),
            "results": serializer.data,
        })

    def post(self, request, organization_id):
        admin_membership = require_admin(request.user, organization_id)
        if admin_membership is None:
            return Response(
                {"detail": "Only organization admins can add members."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AddOrganizationMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(
            email__iexact=serializer.validated_data["email"]
        ).first()

        if user is None:
            return Response(
                {"detail": "Registered user not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if Membership.objects.filter(
            user=user, organization_id=organization_id
        ).exists():
            return Response(
                {"detail": "This user is already a member."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership = Membership.objects.create(
            user=user,
            organization=admin_membership.organization,
            role=serializer.validated_data["role"],
        )
        return Response(
            {
                "success": True,
                "member": OrganizationMemberSerializer(membership).data,
            },
            status=status.HTTP_201_CREATED,
        )


class OrganizationMemberRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, organization_id, membership_id):
        admin_membership = require_admin(request.user, organization_id)
        if admin_membership is None:
            return Response(
                {"detail": "Only organization admins can change roles."},
                status=status.HTTP_403_FORBIDDEN,
            )

        target = get_object_or_404(
            Membership.objects.select_related("user", "organization"),
            id=membership_id,
            organization_id=organization_id,
        )
        serializer = AddOrganizationMemberSerializer(
            data={
                "email": target.user.email,
                "role": request.data.get("role"),
            }
        )
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data["role"]

        if target.role == Role.ADMIN and new_role != Role.ADMIN:
            admin_count = Membership.objects.filter(
                organization_id=organization_id, role=Role.ADMIN
            ).count()
            if admin_count <= 1:
                return Response(
                    {"detail": "The organization must retain at least one admin."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        target.role = new_role
        target.save(update_fields=["role", "updated_at"])
        return Response({
            "success": True,
            "member": OrganizationMemberSerializer(target).data,
        })


class TestOrgPermissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization_id = request.query_params.get("organization_id")
        if not organization_id:
            return Response(
                {"detail": "organization_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership = Membership.objects.filter(
            user=request.user, organization_id=organization_id
        ).first()
        if membership is None:
            return Response(
                {"detail": "You are not a member of this organization."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if membership.role not in [Role.ADMIN, Role.MANAGER]:
            return Response(
                {"detail": "Admin or manager access is required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            "success": True,
            "message": "You have permission to access this.",
            "your_role": membership.role,
        })


class OrgMemberListView(APIView):
    """List organization members with optional search and role filters."""
    permission_classes = [HasOrgPermission]
    required_roles = ["admin", "manager"]

    def get(self, request, organization_id):
        members = (
            Membership.objects.filter(organization_id=organization_id)
            .select_related("user")
            .order_by("created_at")
        )
        search = request.query_params.get("search", "").strip()
        role = request.query_params.get("role", "").strip().lower()

        if search:
            members = members.filter(
                Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__email__icontains=search)
            )

        if role:
            valid_roles = [choice[0] for choice in Role.choices]
            if role not in valid_roles:
                raise ValidationError({"role": "Invalid role."})
            members = members.filter(role=role)

        return Response(MemberSerializer(members, many=True).data)


class OrgMemberRoleUpdateView(APIView):
    """Update a member's role using their user ID."""
    permission_classes = [HasOrgPermission]
    required_roles = ["admin"]

    def patch(self, request, organization_id, user_id):
        serializer = RoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data["role"]

        with transaction.atomic():
            try:
                membership = (
                    Membership.objects.select_for_update()
                    .select_related("user")
                    .get(organization_id=organization_id, user_id=user_id)
                )
            except Membership.DoesNotExist:
                raise NotFound("Member not found in this organization.")

            if membership.role == Role.ADMIN and new_role != Role.ADMIN:
                admin_count = Membership.objects.filter(
                    organization_id=organization_id, role=Role.ADMIN
                ).count()
                if admin_count <= 1:
                    raise ValidationError({
                        "role": "The last organization admin cannot be demoted."
                    })

            membership.role = new_role
            membership.save(update_fields=["role", "updated_at"])

        return Response(MemberSerializer(membership).data)
