from django.shortcuts import get_object_or_404
from rest_framework import status
from django.db import transaction
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Membership, Role
from .permissions import HasOrgPermission
from .serializers import MemberSerializer, RoleUpdateSerializer


class TestOrgPermissionView(APIView):
    permission_classes = [HasOrgPermission]
    required_roles = ["admin", "manager"]

    def get(self, request):
        return Response({
            "success": True,
            "message": "You have permission to access this.",
            "your_role": request.membership.role,
        })


class OrgMemberListView(APIView):
    """GET /<prefix>/orgs/<organization_id>/members/?search=&role="""
    permission_classes = [HasOrgPermission]
    required_roles = ['admin', 'manager']

    def get(self, request, organization_id):
        members = (
            Membership.objects
            .filter(organization_id=organization_id)
            .select_related('user')
            .order_by('created_at')
        )

        search = request.query_params.get('search')
        role = request.query_params.get('role')

        if search:
            members = members.filter(user__email__icontains=search)
        if role:
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
    """PATCH /<prefix>/orgs/<organization_id>/members/<user_id>/role/  body: {"role": "manager"}"""
    permission_classes = [HasOrgPermission]
    required_roles = ['admin']

    def patch(self, request, organization_id, user_id):
        member = get_object_or_404(
            Membership, organization_id=organization_id, user_id=user_id
        )

        serializer = RoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data['role']

        # Shevtcha admin demote hou deu naka
        if member.role == 'admin' and new_role != 'admin':
            admin_count = Membership.objects.filter(
                organization_id=organization_id, role='admin'
            ).count()
            if admin_count <= 1:
                return Response(
                    {'success': False, 'message': 'Organization needs at least one admin.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        member.role = new_role
        member.save()
        return Response(MemberSerializer(member).data)
    permission_classes = [HasOrgPermission]
    required_roles = ["admin"]

    def patch(self, request, organization_id, user_id):
        serializer = RoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data["role"]

        with transaction.atomic():
            try:
                membership = (
                    Membership.objects
                    .select_for_update()
                    .select_related("user")
                    .get(
                        organization_id=organization_id,
                        user_id=user_id,
                    )
                )
            except Membership.DoesNotExist:
                raise NotFound("Member not found in this organization.")

            if membership.role == Role.ADMIN and new_role != Role.ADMIN:
                admin_count = Membership.objects.filter(
                    organization_id=organization_id,
                    role=Role.ADMIN,
                ).count()

                if admin_count <= 1:
                    raise ValidationError({
                        "role": "The last organization admin cannot be demoted."
                    })

            membership.role = new_role
            membership.save(update_fields=["role", "updated_at"])

        return Response(MemberSerializer(membership).data)
