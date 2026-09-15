import os
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

# Human-friendly explanation for each scope (FS1's connection screen will use this)
SCOPE_DESCRIPTIONS = {
    'https://www.googleapis.com/auth/gmail.readonly': 'Read your email to show your inbox',
    'https://www.googleapis.com/auth/calendar': 'View and manage your calendar events',
    'https://www.googleapis.com/auth/drive.readonly': 'View your Drive files',
    'https://www.googleapis.com/auth/spreadsheets': 'Read and write your Sheets data',
}


def get_flow():
    """Google OAuth Flow object banवतो, client config .env varun ghetoy."""
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