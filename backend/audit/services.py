from .models import AuditLog


def log_action(user, action, target=None, metadata=None):
    """
    Reusable helper — other apps should call this after any
    sensitive operation (e.g. disconnect, role change, delete).

    Usage:
        log_action(request.user, 'google_disconnect', cred_obj, {'revoked': True})
        log_action(request.user, 'role_changed', membership_obj, {'old_role': 'admin', 'new_role': 'member'})

    Params:
        user      - the user who performed the action (request.user)
        action    - string describing what happened (e.g. 'google_disconnect')
        target    - (optional) the object the action was performed on;
                     its class name and id are captured automatically
        metadata  - (optional) extra details as a dict, saved as JSON
    """

    target_type = ''
    target_id = None

    if target is not None:
        target_type = target.__class__.__name__
        target_id = getattr(target, 'id', None)

    AuditLog.objects.create(
        user=user,
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id is not None else None,
        metadata=metadata or {},
    )