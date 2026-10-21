from rest_framework import serializers

from .models import Membership, Role


class MemberSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Membership
        fields = ['id', 'user_id', 'name', 'email', 'role', 'created_at']

    def get_name(self, obj):
        full_name = getattr(obj.user, 'get_full_name', lambda: '')()
        return full_name or obj.user.get_username()


class RoleUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=Role.choices)
