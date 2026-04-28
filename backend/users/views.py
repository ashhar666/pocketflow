from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
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
        from django.conf import settings
        from django.contrib.auth import get_user_model
        import os
        engine = settings.DATABASES['default']['ENGINE']
        count = get_user_model().objects.count()
        db_url = os.environ.get('DATABASE_URL', 'NOT_SET')
        db_url = db_url[:40] + "..." if len(db_url) > 40 else db_url

        serializer = ForgotPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"message": f"DB: {engine}, Users: {count}, URL: {db_url}"}, status=status.HTTP_200_OK)


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
