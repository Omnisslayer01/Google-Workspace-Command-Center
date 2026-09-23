from rest_framework.exceptions import ValidationError

# Trigger → Allowed Actions
TRIGGER_ACTION_MAP = {
    "gmail_new": [
        "drive_save",
        "calendar_create",
        "gmail_send",
        "notify",
        "task_create",
    ],
    "gmail_search": [
        "drive_save",
        "calendar_create",
        "gmail_send",
        "notify",
        "task_create",
    ],
    "calendar_new": [
        "calendar_update",
        "gmail_send",
        "notify",
        "task_create",
    ],
    "calendar_upcoming": [
        "gmail_send",
        "notify",
        "task_create",
    ],
    "drive_new": [
        "notify",
        "gmail_send",
        "task_create",
    ],
    "scheduled": [
        "gmail_send",
        "calendar_create",
        "sheets_write",
        "notify",
        "task_create",
    ],
    "manual": [
        "gmail_send",
        "calendar_create",
        "drive_folder",
        "sheets_write",
        "notify",
        "task_create",
    ],
}


def validate_trigger_actions(trigger_type, actions):
    """
    Validate that every action is compatible with the selected trigger.
    Returns detailed per-action errors.
    """
    allowed_actions = TRIGGER_ACTION_MAP.get(trigger_type, [])

    errors = []

    for index, action in enumerate(actions):
        action_type = action.get("type")

        if action_type not in allowed_actions:
            errors.append({
                "step": index + 1,
                "action": action_type,
                "error": f"'{action_type}' is not allowed for trigger '{trigger_type}'."
            })

    if errors:
        raise ValidationError({"actions": errors})