import os
import json
from datetime import timezone as dt_timezone

from cryptography.fernet import Fernet
from django.conf import settings
from django.utils import timezone

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleAuthRequest
from google_auth_oauthlib.flow import Flow


# Scopes we need for this app
GOOGLE_SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/spreadsheets',
]


# Human-friendly explanation for each scope
SCOPE_DESCRIPTIONS = {
    'https://www.googleapis.com/auth/gmail.readonly':
        'Read your email to show your inbox',
    'https://www.googleapis.com/auth/calendar':
        'View and manage your calendar events',
    'https://www.googleapis.com/auth/drive.readonly':
        'View your Drive files',
    'https://www.googleapis.com/auth/spreadsheets':
        'Read and write your Sheets data',
}


def get_flow():
    """Google OAuth Flow object banvto, client config .env varun gheto."""

    client_config = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI")],
        }
    }

    flow = Flow.from_client_config(
        client_config,
        scopes=GOOGLE_SCOPES,
        redirect_uri=os.getenv("GOOGLE_REDIRECT_URI"),
        autogenerate_code_verifier=False,
    )

    return flow


def _get_fernet():
    return Fernet(
        settings.GOOGLE_TOKEN_ENCRYPTION_KEY.encode()
    )


def encrypt_token(raw_token):
    """Token DB madhe save karnya aadhi encrypt karto."""

    if not raw_token:
        return ''

    return _get_fernet().encrypt(
        raw_token.encode()
    ).decode()


def decrypt_token(encrypted_token):
    """Encrypted token decrypt karto."""

    if not encrypted_token:
        return ''

    return _get_fernet().decrypt(
        encrypted_token.encode()
    ).decode()


def get_google_client(user):
    """
    Common Google client function.

    FS1, FS2, FS3 and BE2 should use only this function.

    It checks token expiry, refreshes the access token when required,
    stores the refreshed encrypted token and returns ready-to-use
    Google Credentials.
    """

    from .models import GoogleCredential

    cred_obj = GoogleCredential.objects.get(user=user)

    access_token = decrypt_token(
        cred_obj.access_token
    )

    refresh_token = decrypt_token(
        cred_obj.refresh_token
    )

    expiry = cred_obj.token_expiry

    # Convert naive database datetime to timezone-aware UTC
    if expiry and timezone.is_naive(expiry):
        expiry = timezone.make_aware(
            expiry,
            dt_timezone.utc
        )

    credentials = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        scopes=(
            json.loads(cred_obj.granted_scopes)
            if cred_obj.granted_scopes
            else GOOGLE_SCOPES
        ),
        expiry=expiry,
    )

    # Manually check token expiry
    # We don't use credentials.valid because of the
    # timezone compatibility issue in the installed google-auth version.
    if expiry and timezone.now() >= expiry:

        credentials.refresh(
            GoogleAuthRequest()
        )

        cred_obj.access_token = encrypt_token(
            credentials.token
        )

        new_expiry = credentials.expiry

        # Store refreshed expiry as timezone-aware UTC
        if new_expiry and timezone.is_naive(new_expiry):
            new_expiry = timezone.make_aware(
                new_expiry,
                dt_timezone.utc
            )

        cred_obj.token_expiry = new_expiry

        cred_obj.save(
            update_fields=[
                'access_token',
                'token_expiry',
                'updated_at',
            ]
        )

    return credentials