from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
            
        email = self.normalize_email(email).lower()
        
        # Generate a default username if not provided or empty
        if not extra_fields.get('username'):
            import uuid
            prefix = email.split('@')[0]
            extra_fields['username'] = f"{prefix}_{uuid.uuid4().hex[:4]}"
            
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    # AbstractUser has a username field which we will relax by not requiring it for auth
    email = models.EmailField(unique=True, max_length=255)
    preferred_currency = models.CharField(max_length=3, default='INR')

    # Telegram integration fields
    telegram_chat_id    = models.CharField(max_length=64,  null=True, blank=True, unique=True)
    telegram_link_token = models.CharField(max_length=128, null=True, blank=True)
    telegram_link_expiry = models.DateTimeField(null=True, blank=True)

    # Dedicated password reset fields
    password_reset_token = models.CharField(max_length=128, null=True, blank=True)
    password_reset_expiry = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta(AbstractUser.Meta):
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['telegram_chat_id']),
        ]

    def __str__(self):
        return self.email


class SupportMessage(models.Model):
    sender_email = models.EmailField(blank=True)
    message = models.TextField()
    email_sent = models.BooleanField(default=False)
    email_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["sender_email"]),
        ]

    def __str__(self):
        sender = self.sender_email or "Anonymous"
        return f"Support message from {sender} at {self.created_at:%Y-%m-%d %H:%M}"
