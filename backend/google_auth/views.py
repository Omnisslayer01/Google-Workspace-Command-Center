<<<<<<< HEAD
from django.shortcuts import render

# Create your views here.
=======
import json

from django.core import signing
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .services import get_flow, SCOPE_DESCRIPTIONS, encrypt_token
from .models import GoogleCredential


class GoogleConnectView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        flow = get_flow()

        # Create a signed state containing the logged-in user's ID
        state = signing.dumps({
            'user_id': request.user.id,
        })

        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=state,
        )

        return Response({
            'success': True,
            'authorization_url': authorization_url,
            'scope_descriptions': SCOPE_DESCRIPTIONS,
        })


class GoogleCallbackView(APIView):
    # Google redirects here without JWT authentication
    permission_classes = (AllowAny,)

    def get(self, request):
        code = request.query_params.get('code')
        state = request.query_params.get('state')

        if not code:
            return Response(
                {
                    'success': False,
                    'error': 'Missing authorization code.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not state:
            return Response(
                {
                    'success': False,
                    'error': 'Missing OAuth state.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify state and identify the original logged-in user
        try:
            state_data = signing.loads(state, max_age=600)
            user_id = state_data['user_id']
        except (signing.BadSignature, signing.SignatureExpired, KeyError):
            return Response(
                {
                    'success': False,
                    'error': 'Invalid or expired OAuth state.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'error': 'User not found.'
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        flow = get_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials

        defaults = {
            'access_token': encrypt_token(credentials.token),
            'token_expiry': credentials.expiry,
            'granted_scopes': json.dumps(credentials.scopes),
        }

        if credentials.refresh_token:
            defaults['refresh_token'] = encrypt_token(
                credentials.refresh_token
            )

        GoogleCredential.objects.update_or_create(
            user=user,
            defaults=defaults,
        )

        return Response({
            'success': True,
            'message': 'Google account connected successfully.',
        })
>>>>>>> madhura-google-workspace
