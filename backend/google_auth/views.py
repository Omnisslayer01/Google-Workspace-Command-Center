import json

from django.core import signing
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .services import (
    get_flow,
    SCOPE_DESCRIPTIONS,
    encrypt_token,
    decrypt_token,
    revoke_google_token,
)
from .models import GoogleCredential


class GoogleConnectView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        flow = get_flow()

        
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


class GoogleDisconnectView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            cred_obj = GoogleCredential.objects.get(user=request.user)
        except GoogleCredential.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'error': 'No connected Google account found.'
                },
                status=status.HTTP_404_NOT_FOUND,
            )

       
        token_to_revoke = (
            decrypt_token(cred_obj.refresh_token)
            or decrypt_token(cred_obj.access_token)
        )

        revoked = False
        if token_to_revoke:
            revoked = revoke_google_token(token_to_revoke)

       
        cred_obj.delete()

         # TODO: Pause or cancel any Celery automations tied to this user
        # so nothing keeps running against a dead credential.
        # cancel_user_google_automations(request.user.id)

        

        return Response({
            'success': True,
            'message': 'Google account disconnected successfully.',
            'google_revoke_confirmed': revoked,
        })