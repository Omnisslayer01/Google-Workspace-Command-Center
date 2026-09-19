from rest_framework.permissions import BasePermission

from .models import Membership


class HasOrgPermission(BasePermission):
    """


    Vapar (usage):

        class MyView(APIView):
            permission_classes = [HasOrgPermission]
            required_roles = ['admin', 'manager']

    
    """

    
    required_roles = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

       
        organization_id = (
            view.kwargs.get('organization_id')
            or request.query_params.get('organization_id')
        )

        if not organization_id:
            return False

        try:
            membership = Membership.objects.get(
                user=request.user,
                organization_id=organization_id,
            )
        except Membership.DoesNotExist:
            return False

       
        required_roles = getattr(view, 'required_roles', None)

        if required_roles and membership.role not in required_roles:
            return False

        # Pudhch्या code madhe vaparnyasathi request war membership save karto
        request.membership = membership

        return True
