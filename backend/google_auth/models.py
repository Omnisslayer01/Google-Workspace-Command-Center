<<<<<<< HEAD
from django.db import models

# Create your models here.
=======
from django.conf import settings
from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings


class GoogleCredential(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="google_credential"
    )

    access_token = models.TextField()
    refresh_token = models.TextField()
    token_expiry = models.DateTimeField(null=True, blank=True)
    granted_scopes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _get_cipher(self):
        key = settings.GOOGLE_TOKEN_ENCRYPTION_KEY
        return Fernet(key.encode())

    def set_access_token(self, token):
        self.access_token = self._get_cipher().encrypt(
            token.encode()
        ).decode()

    def get_access_token(self):
        return self._get_cipher().decrypt(
            self.access_token.encode()
        ).decode()

    def set_refresh_token(self, token):
        self.refresh_token = self._get_cipher().encrypt(
            token.encode()
        ).decode()

    def get_refresh_token(self):
        return self._get_cipher().decrypt(
            self.refresh_token.encode()
        ).decode()

    def __str__(self):
        return f"GoogleCredential({self.user.username})"
>>>>>>> madhura-google-workspace
