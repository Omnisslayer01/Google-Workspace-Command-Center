from rest_framework.views import exception_handler
from rest_framework.response import Response


class AppException(Exception):
    """Base exception jyavar sagle custom exceptions base karun banvaych."""
    default_message = "Something went wrong."
    status_code = 400

    def __init__(self, message=None, status_code=None):
        self.message = message or self.default_message
        if status_code:
            self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(AppException):
    default_message = "Resource not found."
    status_code = 404


class PermissionDeniedException(AppException):
    default_message = "You don't have permission to perform this action."
    status_code = 403


def custom_exception_handler(exc, context):
    """Sagle DRF errors ekach consistent format madhe return karto."""
    response = exception_handler(exc, context)

    if isinstance(exc, AppException):
        return Response(
            {'success': False, 'error': exc.message},
            status=exc.status_code,
        )

    if response is not None:
        return Response(
            {'success': False, 'error': response.data},
            status=response.status_code,
        )

    return response