from django.conf import settings
from django.db import models


class Role(models.TextChoices):
    """
    Fixed, small set of roles.
    Team ne khatri kelyashivay custom roles add karaychi nahiyet.
    """
    ADMIN = 'admin', 'Admin'
    MANAGER = 'manager', 'Manager'
    MEMBER = 'member', 'Member'


class Organization(models.Model):
    """A company / team / workspace."""

    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Membership(models.Model):
    """
    Kuthla user, kuthlya Organization madhe, kuthlya Role ne aahe
    he jodnara table. Ek user multiple orgs cha part asu shakto,
    pan ekach org madhe ekach role asel.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships',
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='memberships',
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ek user, ekach organization madhe don vela add nahi houk shakat
        unique_together = ('user', 'organization')

    def __str__(self):
        return f"{self.user} @ {self.organization} ({self.role})"
