import json

import requests
from django.shortcuts import redirect
from django.conf import settings
from django.core import signing
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .services import (
    get_flow,
    SCOPE_DESCRIPTIONS,
    encrypt_token,
    decrypt_token,
    revoke_google_token,
)
from .models import GoogleCredential
from notifications.models import Notification
from automation.models import Automation
from audit.services import log_action

User = get_user_model()


class GoogleConnectView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        flow = get_flow()

        # TODO (Future): Implement and verify OAuth 'state' parameter to prevent CSRF attacks.
        # It will probably be provided by another programmer in the future.
        # Currently, signing.dumps could be used to pass a secure state if required.
        state = signing.dumps({
            'user_id': request.user.id if request.user.is_authenticated else None,
        })

        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=state
        )

        # Renamed to 'auth_url' so Jay's frontend can read it
        return Response({
            'success': True,
            'auth_url': authorization_url,
        })


class GoogleCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        state_param = request.query_params.get('state')
        
        # Uses standard FRONTEND_URL environment variable for redirection
        frontend_url_base = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        
        if not code:
            return Response({'error': 'Missing authorization code.'}, status=400)

        
        try:
            # 1. Exchange the code for Google credentials
            flow = get_flow()
            flow.fetch_token(code=code)
            credentials = flow.credentials

            # 2. Get the user's email from Google
            user_info_response = requests.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {credentials.token}'}
            )
            
            user_info = user_info_response.json()
            email = user_info.get('email')

            if not email:
                return Response({'error': 'Google did not provide an email.'}, status=400)

            # TODO (Future): Sync user profile (name, avatar) from Google user_info here.
            # It will probably be provided by another programmer in the future.
            # e.g. name = user_info.get('name'), avatar = user_info.get('picture')

            # 3. Create or fetch the user safely
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # If they don't exist, create an account for them automatically
                user = User.objects.create_user(username=email, email=email)
                user.set_unusable_password()
                user.save()

            # 4. Save their Google Tokens securely (Madhura's logic)
            defaults = {
                'access_token': encrypt_token(credentials.token),
                'token_expiry': credentials.expiry,
                'granted_scopes': json.dumps(credentials.scopes),
            }
            
            # Only update refresh token if Google actually gave us a new one
            if credentials.refresh_token:
                defaults['refresh_token'] = encrypt_token(credentials.refresh_token)

            GoogleCredential.objects.update_or_create(user=user, defaults=defaults)

            # TODO (Future): Trigger Celery task here to perform initial ingestion of Gmail/Drive data for the user.
            # It will probably be provided by another programmer in the future.
            # e.g. initial_ingestion_task.delay(user.id)

            # 5. Generate our own Django JWT tokens to log them in
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # 6. Redirect back to Jay's frontend and pass the tokens
            frontend_redirect = f"{frontend_url_base}/?access={access_token}&refresh={refresh_token}"
            return redirect(frontend_redirect)

        except Exception as e:
            import traceback
            traceback.print_exc()
            # If anything crashes, send them back to login with an error
            return redirect(f"{frontend_url_base}/login?error=google_auth_failed")


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

        log_action(
            user=request.user,
            action='google_disconnect',
            target=cred_obj,
            metadata={'google_revoke_confirmed': revoked},
        )

        cred_obj.delete()

        return Response({
            'success': True,
            'message': 'Google account disconnected successfully.',
            'google_revoke_confirmed': revoked,
        })


class AccountDeleteView(APIView):
    """
    /api/account/delete/ — deletes the user's in-app data,
    including Google credentials, automations, and notifications.
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user

        # 1. Revoke and delete Google credential, if any
        google_revoked = False

        try:
            cred_obj = GoogleCredential.objects.get(user=user)

            token_to_revoke = (
                decrypt_token(cred_obj.refresh_token)
                or decrypt_token(cred_obj.access_token)
            )

            if token_to_revoke:
                google_revoked = revoke_google_token(token_to_revoke)

            cred_obj.delete()

        except GoogleCredential.DoesNotExist:
            pass

        # 2. Delete this user's automations
        automations_count, _ = Automation.objects.filter(owner=user).delete()

        # 3. Delete this user's notifications
        notifications_count, _ = Notification.objects.filter(user=user).delete()

        # 4. Log the deletion before the user data is removed
        log_action(
            user=user,
            action='account_data_deleted',
            target=None,
            metadata={
                'google_revoke_confirmed': google_revoked,
                'automations_deleted': automations_count,
                'notifications_deleted': notifications_count,
            },
        )

        return Response({
            'success': True,
            'message': 'Your account data has been deleted.',
            'google_revoke_confirmed': google_revoked,
        })
