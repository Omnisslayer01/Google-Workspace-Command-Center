import logging
import re


class SensitiveDataFilter(logging.Filter):
    """
    Removes access and refresh tokens before logs are written.
    access_token / refresh_token log madhe kadhich jayla nako.
    """

    PATTERNS = [
        re.compile(r'(access_token["\']?\s*[:=]\s*["\']?)[^"\',\s]+', re.IGNORECASE),
        re.compile(r'(refresh_token["\']?\s*[:=]\s*["\']?)[^"\',\s]+', re.IGNORECASE),
    ]

    def filter(self, record):
        if isinstance(record.msg, str):
            for pattern in self.PATTERNS:
                record.msg = pattern.sub(r'\1***REDACTED***', record.msg)
        return True