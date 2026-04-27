"""
HTTP-only cookie utilities for JWT authentication.

This module provides helpers to set and clear JWT tokens in HTTP-only cookies,
which are not accessible to JavaScript (XSS-resistant).
"""

from django.conf import settings


# Cookie settings — defaults overridden by Django settings
JWT_ACCESS_COOKIE_NAME = getattr(settings, 'JWT_ACCESS_COOKIE_NAME', 'access_token')
JWT_REFRESH_COOKIE_NAME = getattr(settings, 'JWT_REFRESH_COOKIE_NAME', 'refresh_token')
JWT_ACCESS_COOKIE_MAX_AGE = 3600          # 1 hour in seconds
JWT_REFRESH_COOKIE_MAX_AGE = 604800       # 7 days in seconds
JWT_COOKIE_SECURE = not settings.DEBUG    # Auto-secure in production
JWT_COOKIE_SAMESITE = "None" if JWT_COOKIE_SECURE else "Lax"
JWT_COOKIE_DOMAIN = None                  # Set to your domain in production


def _cookie_delete_kwargs():
    return {
        "path": "/",
        "domain": JWT_COOKIE_DOMAIN,
        "samesite": JWT_COOKIE_SAMESITE,
    }


def set_jwt_cookies(response, access_token, refresh_token):
    """
    Set HTTP-only cookies for JWT access and refresh tokens on the response.
    """
    # Access token cookie
    response.set_cookie(
        key=JWT_ACCESS_COOKIE_NAME,
        value=str(access_token),
        max_age=JWT_ACCESS_COOKIE_MAX_AGE,
        httponly=True,
        secure=JWT_COOKIE_SECURE,
        samesite=JWT_COOKIE_SAMESITE,
        domain=JWT_COOKIE_DOMAIN,
        path="/",
    )

    # Refresh token cookie
    response.set_cookie(
        key=JWT_REFRESH_COOKIE_NAME,
        value=str(refresh_token),
        max_age=JWT_REFRESH_COOKIE_MAX_AGE,
        httponly=True,
        secure=JWT_COOKIE_SECURE,
        samesite=JWT_COOKIE_SAMESITE,
        domain=JWT_COOKIE_DOMAIN,
        path="/",
    )


def clear_jwt_cookies(response):
    """
    Clear HTTP-only JWT cookies on logout.
    """
    response.delete_cookie(JWT_ACCESS_COOKIE_NAME, **_cookie_delete_kwargs())
    response.delete_cookie(JWT_REFRESH_COOKIE_NAME, **_cookie_delete_kwargs())
