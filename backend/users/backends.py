from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # Login via email (which might be passed as username in DRF kwargs)
            user = UserModel.objects.get(email=username)
        except UserModel.DoesNotExist:
            try:
                # Fallback, just in case kwargs comes in differently
                if 'email' in kwargs:
                    user = UserModel.objects.get(email=kwargs['email'])
                else:
                    return None
            except UserModel.DoesNotExist:
                return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
