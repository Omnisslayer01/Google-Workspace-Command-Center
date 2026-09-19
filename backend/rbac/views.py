from rest_framework.views import APIView
from rest_framework.response import Response

from .permissions import HasOrgPermission


class TestOrgPermissionView(APIView):
   

    permission_classes = [HasOrgPermission]
    required_roles = ['admin', 'manager']

    def get(self, request):
        return Response({
            'success': True,
            'message': 'You have permission to access this.',
            'your_role': request.membership.role,
        })
