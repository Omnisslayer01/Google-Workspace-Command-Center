import json
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .services import get_flow, SCOPE_DESCRIPTIONS
from .models import GoogleCredential


class GoogleConnectView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        flow = get_flow()
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
        )
        return Response({
            'success': True,
            'authorization_url': authorization_url,
            'scope_descriptions': SCOPE_DESCRIPTIONS,
        })


class GoogleCallbackView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response(
                {'success': False, 'error': 'Missing authorization code.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        flow = get_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials

        GoogleCredential.objects.update_or_create(
            user=request.user,
            defaults={
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token or '',
                'token_expiry': credentials.expiry,
                'granted_scopes': json.dumps(credentials.scopes),
            },
        )

        return Response({
            'success': True,
            'message': 'Google account connected successfully.',
        })