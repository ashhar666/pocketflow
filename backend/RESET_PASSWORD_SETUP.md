# Password Reset Feature

## Overview
Users can now reset their forgotten passwords via email or a token-based system.

## API Endpoints

### 1. Request Password Reset
**Endpoint:** `POST /api/auth/password-reset/`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (DEBUG mode):**
```json
{
  "detail": "Password reset token generated.",
  "reset_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Reset token for user@example.com: eyJhbGci..."
}
```

**Response (Production):**
```json
{
  "detail": "If that email exists, a password reset link has been sent."
}
```

### 2. Confirm Password Reset
**Endpoint:** `POST /api/auth/password-reset-confirm/`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "detail": "Password reset successfully. You can now log in with your new password."
}
```

## How It Works

### For Users:
1. Go to `/forgot-password` page
2. Enter your email address
3. **In DEBUG mode:** A reset token is displayed on screen
4. **In Production:** An email is sent with a reset link
5. Click the reset link or go to `/reset-password?token=YOUR_TOKEN`
6. Enter your new password (minimum 8 characters)
7. Confirm the password
8. Submit - you'll be redirected to login

### For Developers:
- **DEBUG mode:** Reset tokens are returned in the API response and displayed on the UI
- **Production mode:** Emails are sent via Django's email backend
- Tokens expire after **1 hour**
- Tokens are JWT-signed with your `SECRET_KEY`

## Email Configuration (Production)

To enable email sending in production, update `backend/core/settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'your-smtp-host.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@domain.com'
EMAIL_HOST_PASSWORD = 'your-smtp-password'
DEFAULT_FROM_EMAIL = 'PocketFlow <noreply@pocketflow.com>'
```

## Frontend Pages

- **Forgot Password:** `/forgot-password`
- **Reset Password:** `/reset-password?token=YOUR_TOKEN`

## Testing

1. Start the backend: `python manage.py runserver`
2. Go to `http://localhost:3000/forgot-password`
3. Enter your email
4. Copy the reset token from the response
5. Click "Go to Reset Page" or navigate to `/reset-password?token=COPIED_TOKEN`
6. Enter a new password
7. Log in with the new password

## Security Features

- ✅ Tokens expire after 1 hour
- ✅ Tokens are cryptographically signed (JWT)
- ✅ Email addresses are not revealed (same response whether email exists or not)
- ✅ Password validation (minimum 8 characters)
- ✅ Token type verification (prevents token reuse for different purposes)

## Files Modified/Created

### Backend:
- `users/views.py` - Added `PasswordResetRequestView` and `PasswordResetConfirmView`
- `users/serializers.py` - Added `PasswordResetRequestSerializer` and `PasswordResetConfirmSerializer`
- `users/urls.py` - Added password reset routes
- `core/settings.py` - Added email configuration

### Frontend:
- `src/app/(auth)/forgot-password/page.tsx` - Forgot password UI
- `src/app/(auth)/reset-password/page.tsx` - Reset password UI
- `src/components/ui/auth-page.tsx` - Already has "Forgot?" link on login page
