from rest_framework import serializers


class CalendarEventSerializer(serializers.Serializer):
    summary = serializers.CharField(
        max_length=255,
    )

    description = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    start_time = serializers.DateTimeField()

    end_time = serializers.DateTimeField()

    location = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    attendees = serializers.ListField(
        child=serializers.EmailField(),
        required=False,
    )

    def validate(self, attrs):
        if attrs["end_time"] <= attrs["start_time"]:
            raise serializers.ValidationError(
                "end_time must be after start_time."
            )

        return attrs
class CalendarEventQuerySerializer(serializers.Serializer):
    start = serializers.DateTimeField(required=False)
    end = serializers.DateTimeField(required=False)
    page_token = serializers.CharField(
        required=False,
        allow_blank=False,
    )

    def validate(self, attrs):
        start = attrs.get("start")
        end = attrs.get("end")

        if start and end and end <= start:
            raise serializers.ValidationError(
                "end must be after start."
            )

        return attrs
    
class CalendarEventUpdateSerializer(serializers.Serializer):
    summary = serializers.CharField(
        max_length=255,
        required=False,
    )

    description = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    start_time = serializers.DateTimeField(
        required=False,
    )

    end_time = serializers.DateTimeField(
        required=False,
    )

    location = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    attendees = serializers.ListField(
        child=serializers.EmailField(),
        required=False,
    )

    def validate(self, attrs):
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError(
                "end_time must be after start_time."
            )

        if not attrs:
            raise serializers.ValidationError(
                "At least one field is required to update the event."
            )

        return attrs