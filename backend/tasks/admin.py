from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'due_date', 'owner', 'created_at')
    list_filter = ('status', 'owner')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at', 'created_by_automation')
