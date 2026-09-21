from rest_framework import serializers

from .models import Automation, Trigger, Condition, Action
from .validators import validate_trigger_actions


class TriggerSerializer(serializers.Serializer):
    type = serializers.CharField()
    config = serializers.JSONField(required=False)


class ConditionSerializer(serializers.Serializer):
    field = serializers.CharField()
    operator = serializers.CharField()
    value = serializers.CharField()


class ActionSerializer(serializers.Serializer):
    type = serializers.CharField()
    config = serializers.JSONField(required=False)
    order = serializers.IntegerField()


class AutomationCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    trigger = TriggerSerializer()
    conditions = ConditionSerializer(many=True, required=False)
    actions = ActionSerializer(many=True)

    def validate(self, data):
        validate_trigger_actions(
            data["trigger"]["type"],
            data["actions"],
        )
        return data

    def create(self, validated_data):
        user = self.context["request"].user

        automation = Automation.objects.create(
            name=validated_data["name"],
            owner=user,
        )

        Trigger.objects.create(
            automation=automation,
            **validated_data["trigger"]
        )

        for condition in validated_data.get("conditions", []):
            Condition.objects.create(
                automation=automation,
                **condition
            )

        for action in validated_data["actions"]:
            Action.objects.create(
                automation=automation,
                **action
            )

        return automation