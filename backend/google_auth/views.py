import json
import requests
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .services import get_flow, encrypt_token
from .models import GoogleCredential

User = get_user_model()

class GoogleConnectView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        flow = get_flow()
        # Create the URL for Google's consent screen
        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
        )
        
        # 🚨 FIX APPLIED: Renamed to 'auth_url' so Jay's frontend can read it!
        return Response({
            'success': True,
            'auth_url': authorization_url, 
        })

class GoogleCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
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

            # 3. Create or fetch the user safely
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # If they don't exist, create an account for them automatically
                user = User.objects.create_user(username=email, email=email)

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

            # 5. Generate our own Django JWT tokens to log them in
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # 6. Redirect back to Jay's frontend and pass the tokens
            frontend_url = f"http://localhost:3000/?access={access_token}&refresh={refresh_token}"
            return redirect(frontend_url)

        except Exception as e:
            # If anything crashes, send them back to login with an error
            return redirect("http://localhost:3000/login?error=google_auth_failed")