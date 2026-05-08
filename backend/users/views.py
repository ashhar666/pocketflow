from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    ForgotPasswordRequestSerializer,
    ResetPasswordConfirmSerializer,
)
from .cookie_utils import set_jwt_cookies, clear_jwt_cookies
from .models import SupportMessage
from django.core.mail import send_mail

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    throttle_classes = [AnonRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        response = Response({
            "user": UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

        set_jwt_cookies(response, access_token, refresh)
        return response


class LoginView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer
    throttle_classes = [AnonRateThrottle]

    def get_throttles(self):
        """Use 'login' rate for POST, default anon for other methods."""
        if self.request.method == 'POST':
            from rest_framework.throttling import SimpleRateThrottle
            class LoginThrottle(SimpleRateThrottle):
                scope = 'login'
                def get_cache_key(self, request, view):
                    return self.get_ident(request)
            return [LoginThrottle()]
        return super().get_throttles()

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            response = Response({
                "user": UserSerializer(user).data,
            }, status=status.HTTP_200_OK)

            set_jwt_cookies(response, access_token, refresh)
            return response
        else:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
            if not refresh_token:
                return Response({"detail": "Missing refresh token."}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass  # Gracefully handle already-expired tokens

        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        clear_jwt_cookies(response)
        return response


class CustomTokenRefreshView(APIView):
    """
    Refresh JWT tokens using the HTTP-only refresh token cookie.
    Returns new tokens in new HTTP-only cookies (token rotation).
    """
    permission_classes = (AllowAny,)
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
        if not refresh_token:
            return Response({"detail": "Missing refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

        from rest_framework_simplejwt.serializers import TokenRefreshSerializer
        from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})

        try:
            try:
                serializer.is_valid(raise_exception=True)
            except (TokenError, InvalidToken) as e:
                raise Exception(str(e))

            data = serializer.validated_data
            access_token = data.get("access")
            new_refresh_token = data.get("refresh") or refresh_token

            response = Response({"user": {}}, status=status.HTTP_200_OK)
            set_jwt_cookies(response, access_token, new_refresh_token)
            return response
        except Exception:
            response = Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)
            clear_jwt_cookies(response)
            return response


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ForgotPasswordRequestView(APIView):
    """
    POST /api/auth/forgot-password/
    Accepts { email }. Sends a password reset link via email (or prints to console in dev).
    """
    permission_classes = (AllowAny,)
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = ForgotPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Always return success to prevent email enumeration
        return Response(
            {"message": "If an account exists with that email, a password reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordConfirmView(APIView):
    """
    POST /api/auth/reset-password/
    Accepts { email, token, new_password, confirm_password }.
    Validates the token and resets the password.
    """
    permission_classes = (AllowAny,)
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Password updated successfully. You can now log in."},
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Google OAuth2 Authentication
# ---------------------------------------------------------------------------

import os
import requests
import logging
from django.conf import settings
from django.core import signing
from django.shortcuts import redirect
from django.utils.crypto import get_random_string
from rest_framework_simplejwt.tokens import RefreshToken
from .cookie_utils import set_auth_cookies

logger = logging.getLogger(__name__)

# Constants for signed state
GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state"
GOOGLE_OAUTH_STATE_MAX_AGE = 600  # 10 minutes

def _get_google_redirect_uri():
    # Use environment variable if set, otherwise fallback to standard calculation
    env_uri = os.environ.get("GOOGLE_OAUTH_REDIRECT_URI")
    if env_uri:
        return env_uri
    return f"{settings.APP_URL}/api/auth/google/callback/"

def _frontend_auth_redirect(status_code, user_data=None):
    """Helper to redirect back to frontend with a status query param"""
    frontend_url = settings.CORS_ALLOWED_ORIGINS[0]
    return redirect(f"{frontend_url}/login?auth_status={status_code}")

class GoogleOAuthLoginView(APIView):
    """
    GET /api/auth/google/login/
    Redirects user to Google OAuth consent screen.
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        # 1. Generate a signed state
        # We don't rely on cookies for state because of cross-domain proxy issues (Hugging Face)
        # Instead we use a signed timestamped state that Google will pass back to us.
        state = signing.TimestampSigner(salt="google-oauth").sign(get_random_string(32))
        
        client_id = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
        redirect_uri = _get_google_redirect_uri()
        
        google_auth_url = (
            "https://accounts.google.com/o/oauth2/v2/auth"
            f"?client_id={client_id}"
            f"&response_type=code"
            f"&scope=openid%20email%20profile"
            f"&redirect_uri={redirect_uri}"
            f"&state={state}"
        )
        
        response = redirect(google_auth_url)
        # We still set a cookie as a fallback/security layer for standard flow
        response.set_cookie(
            GOOGLE_OAUTH_STATE_COOKIE,
            state,
            max_age=GOOGLE_OAUTH_STATE_MAX_AGE,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="None" if not settings.DEBUG else "Lax",
        )
        return response

class GoogleOAuthCallbackView(APIView):
    """
    GET /api/auth/google/callback/
    Receives code from Google, exchanges for tokens, and logs in user.
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        code = request.GET.get("code")
        error = request.GET.get("error")
        
        if error:
            logger.error(f"Google OAuth error: {error}")
            return _frontend_auth_redirect("google_denied")

        if not code:
            return _frontend_auth_redirect("missing_google_code")

        state = request.GET.get("state")
        # Validate the signed state
        try:
            signing.TimestampSigner(salt="google-oauth").unsign(
                state or "",
                max_age=GOOGLE_OAUTH_STATE_MAX_AGE,
            )
        except (signing.BadSignature, signing.SignatureExpired):
            logger.warning("Google OAuth callback rejected because state validation failed.")
            return _frontend_auth_redirect("invalid_google_state")

        # Exchange code for access token
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": os.environ.get("GOOGLE_OAUTH_CLIENT_ID"),
            "client_secret": os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET"),
            "redirect_uri": _get_google_redirect_uri(),
            "grant_type": "authorization_code",
        }

        try:
            token_res = requests.post(token_url, data=data, timeout=10)
            token_res.raise_for_status()
            tokens = token_res.json()
            access_token = tokens.get("access_token")
        except Exception as e:
            logger.error(f"Failed to exchange Google code: {str(e)}")
            return _frontend_auth_redirect("google_token_failed")

        # Get user info
        user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        try:
            user_res = requests.get(user_info_url, headers={"Authorization": f"Bearer {access_token}"}, timeout=10)
            user_res.raise_for_status()
            user_info = user_res.json()
        except Exception as e:
            logger.error(f"Failed to fetch Google user info: {str(e)}")
            return _frontend_auth_redirect("google_user_failed")

        email = user_info.get("email")
        if not email:
            return _frontend_auth_redirect("no_email")

        # Create or update user
        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0] + "_" + get_random_string(4),
                "first_name": user_info.get("given_name", ""),
                "last_name": user_info.get("family_name", ""),
            }
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Redirect to frontend dashboard with success
        frontend_url = settings.CORS_ALLOWED_ORIGINS[0]
        response = redirect(f"{frontend_url}/dashboard?auth_status=success")
        
        # Set cookies
        set_auth_cookies(response, str(refresh.access_token), str(refresh))
        
        # Clean up state cookie
        response.delete_cookie(GOOGLE_OAUTH_STATE_COOKIE)
        
        return response

@method_decorator(csrf_exempt, name='dispatch')
class SupportMessageView(APIView):
    """
    POST /api/auth/support/
    Accepts { message }. Sends a support request email to the admin.
    """
    permission_classes = (AllowAny,)
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        message = (request.data.get('message') or '').strip()
        
        # Try to identify the sender
        user_email = ""
        if request.user and request.user.is_authenticated:
            user_email = request.user.email or ""
        elif request.data.get('email'):
            user_email = request.data.get('email')
        
        if not message:
            return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        support_message = SupportMessage.objects.create(
            sender_email=user_email,
            message=message,
        )
        
        # Construct email body
        sender_label = user_email or "Anonymous"
        full_message = f"Support Request from: {sender_label}\n\nMessage:\n{message}"
        
        # Keep this separate from EMAIL_HOST_USER, which may be an SMTP username.
        recipient = getattr(settings, 'SUPPORT_EMAIL', 'pocketflow.app@gmail.com') or 'pocketflow.app@gmail.com'

        try:
            send_mail(
                subject=f"PocketFlow Support: {sender_label}",
                message=full_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            support_message.email_sent = True
            support_message.save(update_fields=['email_sent'])
            return Response({"detail": "Message sent successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Support email error: {str(e)}")
            support_message.email_error = str(e)
            support_message.save(update_fields=['email_error'])

            # The complaint is safely stored for admin review even if SMTP is down.
            return Response(
                {"detail": "Message received. Our email alert is delayed, but your complaint has been saved."},
                status=status.HTTP_202_ACCEPTED
            )

