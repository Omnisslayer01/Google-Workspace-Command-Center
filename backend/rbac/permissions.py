from rest_framework.permissions import BasePermission

from .models import Membership


class HasOrgPermission(BasePermission):
    """
    Reusable permission class - itar apps che viewsets he subclass
    karun vaparu shaktat, prayek app madhe wegla check na lihita.

    Vapar (usage):

        class MyView(APIView):
            permission_classes = [HasOrgPermission]
            required_roles = ['admin', 'manager']

    Request madhe organization identify karnyasathi, request madhe
    'organization_id' (query param kinva view.kwargs madhun) yaycha
    aahe - te tumchya URL structure war avlambun aahe.
    """

    # Default: koणताही role chalel (fakht member asla tari)
    required_roles = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Organization id kuthun ghyaycha - view kinva URL madhun
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

        # View war 'required_roles' set kela asel tarch role check karto
        required_roles = getattr(view, 'required_roles', None)

        if required_roles and membership.role not in required_roles:
            return False

        # Pudhch्या code madhe vaparnyasathi request war membership save karto
        request.membership = membership

        return True