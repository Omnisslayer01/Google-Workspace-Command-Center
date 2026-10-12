from rest_framework.throttling import UserRateThrottle


class LoginThrottle(UserRateThrottle):
    scope = "login"


class OAuthThrottle(UserRateThrottle):
    scope = "oauth"


class SendEmailThrottle(UserRateThrottle):
    scope = "send_email"