import logging
import re


class SensitiveDataFilter(logging.Filter):
    """
    Removes access and refresh tokens before logs are written.
    """

    PATTERNS = [
        r"(access_token['\"]?\s*[:=]\s*['\"]?)([^'\",\s}]+)",
        r"(refresh_token['\"]?\s*[:=]\s*['\"]?)([^'\",\s}]+)",
    ]

    def filter(self, record):
        message = record.getMessage()

        for pattern in self.PATTERNS:
            message = re.sub(pattern, r"\1[REDACTED]", message)

        record.msg = message
        record.args = ()

        return True