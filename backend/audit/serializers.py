from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user',
            'username',
            'action',
            'target_type',
            'target_id',
            'metadata',
            'created_at',
        ]
        read_only_fields = fields  # sagle fields read-only - append-only design