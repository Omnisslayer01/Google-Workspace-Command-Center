import os
import json
from datetime import timezone as dt_timezone

import requests
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

    Django stores token_expiry as a timezone-aware datetime.
    google-auth expects Credentials.expiry as a naive UTC datetime.

    Therefore:
    DB datetime (aware UTC)
            ↓
    Google Credentials (naive UTC)
            ↓
    refreshed expiry
            ↓
    DB datetime (aware UTC)
    """

    from .models import GoogleCredential

    cred_obj = GoogleCredential.objects.get(user=user)

    access_token = decrypt_token(
        cred_obj.access_token
    )

    refresh_token = decrypt_token(
        cred_obj.refresh_token
    )

    # --------------------------------------------------
    # Get expiry from Django database
    # --------------------------------------------------
    db_expiry = cred_obj.token_expiry

    if db_expiry:
        # Django DB value should be timezone-aware UTC
        if timezone.is_naive(db_expiry):
            db_expiry = timezone.make_aware(
                db_expiry,
                dt_timezone.utc
            )
        else:
            db_expiry = db_expiry.astimezone(
                dt_timezone.utc
            )

    # --------------------------------------------------
    # Google-auth expects NAIVE UTC datetime
    # --------------------------------------------------
    google_expiry = None

    if db_expiry:
        google_expiry = db_expiry.replace(
            tzinfo=None
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
        expiry=google_expiry,
    )

    # --------------------------------------------------
    # Check expiry using Django's timezone-aware value
    # --------------------------------------------------
    if db_expiry and timezone.now() >= db_expiry:

        credentials.refresh(
            GoogleAuthRequest()
        )

        cred_obj.access_token = encrypt_token(
            credentials.token
        )

        # google-auth normally returns naive UTC expiry
        new_expiry = credentials.expiry

        # Convert it to timezone-aware UTC before
        # storing it in Django's DateTimeField.
        if new_expiry:
            if timezone.is_naive(new_expiry):
                new_expiry = timezone.make_aware(
                    new_expiry,
                    dt_timezone.utc
                )
            else:
                new_expiry = new_expiry.astimezone(
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

def revoke_google_token(token):
    """
    Google kade jaun dilela token (access kinva refresh) revoke karto.
    Yamule Google chya bajune pan permission kadhli jaate,
    fakht apalya DB madhun row delete karna purse nasta.
    """

    if not token:
        return False

    response = requests.post(
        'https://oauth2.googleapis.com/revoke',
        params={'token': token},
        headers={'content-type': 'application/x-www-form-urlencoded'},
    )

    # 200 aala tarch yashasvi samaj; nahitar already revoked
    # kinva invalid token asu shakto (tarihi aapan DB row delete karnarach)
    return response.status_code == 200