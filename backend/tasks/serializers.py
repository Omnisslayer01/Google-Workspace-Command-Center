from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'due_date', 
            'status', 'created_by_automation', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by_automation', 'created_at', 'updated_at']

    def validate_status(self, value):
        valid_statuses = ['todo', 'in_progress', 'completed']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of {valid_statuses}")
        return value
