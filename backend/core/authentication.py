"""
Custom JWT authentication class that reads tokens from HTTP-only cookies.

This replaces the default Authorization header approach with cookie-based
token extraction for XSS resistance.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """
    Authenticate using JWT tokens stored in HTTP-only cookies.
    
    The access token cookie name is configured in users/cookie_utils.py.
    """

    def authenticate(self, request):
        # Try to get token from HTTP-only cookie first
        access_token = request.COOKIES.get(settings.JWT_ACCESS_COOKIE_NAME)

        if access_token is None:
            # Fall back to Authorization header for backwards compatibility
            return super().authenticate(request)

        try:
            validated_token = self.get_validated_token(access_token)
            return self.get_user(validated_token), validated_token
        except AuthenticationFailed:
            return None
