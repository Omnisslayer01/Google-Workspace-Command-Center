from rest_framework import serializers


class SheetValuesSerializer(serializers.Serializer):
    range = serializers.CharField(help_text="Example: Sheet1!A1:C5")


class UpdateValuesSerializer(serializers.Serializer):
    range = serializers.CharField(help_text="Example: Sheet1!A1:C5")
    values = serializers.ListField(
        child=serializers.ListField(child=serializers.CharField())
    )


class AppendValuesSerializer(serializers.Serializer):
    range = serializers.CharField(help_text="Example: Sheet1!A1")
    values = serializers.ListField(
        child=serializers.ListField(child=serializers.CharField())
    )