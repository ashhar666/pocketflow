from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LogoutView, ChangePasswordView, UserProfileView, LoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('profile/', UserProfileView.as_view(), name='auth_profile'),
]

