from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import secrets
import hashlib
import time
import threading
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

# Constant-time delay to prevent email enumeration attacks
PASSWORD_RESET_DELAY = 0.5  # seconds


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def _send_reset_email_async(to_email: str, reset_link: str):
    """Send password reset email in background thread — does NOT block the HTTP response."""
    subject = "Reset Your Password — PocketFlow"

    # Plain text fallback
    text_body = (
        f"Hi,\n\n"
        f"We received a request to reset your PocketFlow password.\n\n"
        f"Click the link below to reset your password. This link expires in 15 minutes.\n\n"
        f"{reset_link}\n\n"
        f"If you did not request this, you can safely ignore this email.\n\n"
        f"— The PocketFlow Team"
    )

    # HTML body
    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">🔑 PocketFlow</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Password Reset Request</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#d1d5db;font-size:16px;line-height:1.6;">Hi there,</p>
              <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.7;">
                We received a request to reset the password for your PocketFlow account.
                Click the button below to choose a new password. This link is valid for <strong style="color:#a78bfa;">15 minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="{reset_link}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Or copy and paste this link into your browser:</p>
              <p style="margin:0 0 32px;word-break:break-all;">
                <a href="{reset_link}" style="color:#8b5cf6;font-size:13px;text-decoration:none;">{reset_link}</a>
              </p>

              <hr style="border:none;border-top:1px solid #2a2a2a;margin:0 0 24px;" />

              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111111;padding:20px 40px;text-align:center;border-top:1px solid #2a2a2a;">
              <p style="margin:0;color:#4b5563;font-size:12px;">© 2025 PocketFlow · Your personal finance tracker</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@pocketflow.com')
        msg = EmailMultiAlternatives(subject, text_body, from_email, [to_email])
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)
        print(f"[EMAIL] Reset email sent to {to_email}")
    except Exception as e:
        print(f"[EMAIL] FAILED TO SEND EMAIL to {to_email}: {str(e)}")


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        email = validated_data['email'].lower()
        username = validated_data.pop('username', None)
        create_params = {
            'email': email,
            'password': validated_data['password'],
            'first_name': validated_data.get('first_name', ''),
            'last_name': validated_data.get('last_name', ''),
        }
        if username:
            create_params['username'] = username
        try:
            user = User.objects.create_user(**create_params)
            return user
        except Exception as e:
            raise serializers.ValidationError({"detail": str(e)})


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class ForgotPasswordRequestSerializer(serializers.Serializer):
    """Step 1: Request a password reset token."""
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        value = value.lower()
        try:
            user = User.objects.get(email__iexact=value)
        except User.DoesNotExist:
            time.sleep(PASSWORD_RESET_DELAY)
            return value

        # Generate token and save to DB immediately
        token = secrets.token_urlsafe(32)
        user.password_reset_token = hash_reset_token(token)
        user.password_reset_expiry = timezone.now() + timedelta(minutes=15)
        user.save(update_fields=['password_reset_token', 'password_reset_expiry'])

        # Build reset link
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://pocketflow-chi.vercel.app')
        reset_link = f"{frontend_url}/reset-password/?token={token}&email={value}"

        # Fire-and-forget: send email in background thread so response is instant
        thread = threading.Thread(
            target=_send_reset_email_async,
            args=(value, reset_link),
            daemon=True
        )
        thread.start()

        return value


class ResetPasswordConfirmSerializer(serializers.Serializer):
    """Step 2: Submit token + new password."""
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, min_length=8, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, min_length=8, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        email = data['email'].lower()
        token = data['token']

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Invalid token or email."})

        hashed_token = hash_reset_token(token)
        stored_token = user.password_reset_token or ''
        if not secrets.compare_digest(stored_token, hashed_token):
            raise serializers.ValidationError({"token": "Invalid token."})

        if user.password_reset_expiry and timezone.now() > user.password_reset_expiry:
            user.password_reset_token = None
            user.password_reset_expiry = None
            user.save(update_fields=['password_reset_token', 'password_reset_expiry'])
            raise serializers.ValidationError({"token": "Token has expired. Please request a new one."})

        self._reset_user = user
        return data

    def save(self):
        user = self._reset_user
        user.set_password(self.validated_data['new_password'])
        user.password_reset_token = None
        user.password_reset_expiry = None
        user.save(update_fields=['password', 'password_reset_token', 'password_reset_expiry'])
