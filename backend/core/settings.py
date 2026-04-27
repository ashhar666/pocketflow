import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

from dotenv import load_dotenv
load_dotenv(BASE_DIR / '.env', override=True)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    if os.getenv('DEBUG', 'False') == 'True':
        print("CRITICAL: SECRET_KEY environment variable is missing! Using insecure fallback for debugging.")
        SECRET_KEY = 'django-insecure-fallback-key-change-this-immediately'
    else:
        raise RuntimeError("SECRET_KEY environment variable is required when DEBUG is False.")

DEBUG = os.getenv('DEBUG', 'False') == 'True'

# ── Logging Configuration ──────────────────────────────────────────────────────
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO' if not DEBUG else 'DEBUG')

# Ensure logs directory exists in production
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(parents=True, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{asctime} {levelname} {name} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'app.log',
            'maxBytes': 10 * 1024 * 1024,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'] + (['file'] if not DEBUG else []),
            'level': LOG_LEVEL,
            'propagate': True,
        },
        'django': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'telegram_bot': {
            'handlers': ['console'] + (['file'] if not DEBUG else []),
            'level': LOG_LEVEL,
            'propagate': False,
        },
    },
}

import logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
)


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {'1', 'true', 'yes', 'on'}

# Telegram Webhook Secret Token for authentication.
# Verification header: X-Telegram-Bot-Api-Secret-Token
TELEGRAM_WEBHOOK_SECRET = os.getenv('TELEGRAM_WEBHOOK_SECRET', '')

# ── Allowed Hosts ───────────────────────────────────────────────────────────
# Never use ['*'] in production. Configure via ALLOWED_HOSTS in .env.
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.hf.space',
    'proxy.spaces.internal.huggingface.tech',
]

# Allow common tunnel domains and Render/HF domains for foolproof deployments
ALLOWED_HOSTS += ['.ngrok-free.dev', '.ngrok.io', '.onrender.com']

# ── CSRF Trusted Origins ────────────────────────────────────────────────────
CSRF_TRUSTED_ORIGINS = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000'
).split(',')

if DEBUG:
    # Add common tunnel domains to trusted origins
    # Using a list comprehension to handle the common pattern
    tunnels = ['https://*.ngrok-free.dev', 'https://*.ngrok.io']
    CSRF_TRUSTED_ORIGINS.extend(tunnels)

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
]

LOCAL_APPS = [
    'users',
    'categories',
    'expenses',
    'budgets',
    'savings',
    'summary',
    'income',
    'telegram_bot',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ── Database ────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    try:
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.config(
                default=DATABASE_URL,
                conn_max_age=600,
                conn_health_checks=True,
            )
        }
        # PostgreSQL-specific optimizations
        if 'postgresql' in DATABASE_URL:
            DATABASES['default']['OPTIONS'] = {
                'connect_timeout': 10,
                'options': '-c statement_timeout=30000',
            }
    except ImportError:
        logging.warning("dj-database-url not installed. Falling back to SQLite.")
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
else:
    # Fallback to SQLite for development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
            'OPTIONS': {
                'timeout': 30,
            }
        }
    }

# Performance optimizations
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 300,
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ── Media Files ─────────────────────────────────────────────────────────────
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Security Settings (Production) ──────────────────────────────────────────
# SECURE_PROXY_SSL_HEADER allows Django to recognize HTTPS from proxies/tunnels
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = env_bool('SECURE_SSL_REDIRECT', not DEBUG)

# Cookies should only be secure if we are actually using SSL
SESSION_COOKIE_SECURE = env_bool('SESSION_COOKIE_SECURE', SECURE_SSL_REDIRECT)
CSRF_COOKIE_SECURE = env_bool('CSRF_COOKIE_SECURE', SECURE_SSL_REDIRECT)

if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    # Hugging Face Spaces requires the app to be embeddable in an iframe.
    # We disable X_FRAME_OPTIONS restriction to allow the HF dashboard to display the app.
    X_FRAME_OPTIONS = 'ALLOWALL' # or just comment it out to use the default 'SAMEORIGIN' which might block

    # HSTS should only be used if we are enforcing SSL
    if SECURE_SSL_REDIRECT:
        SECURE_HSTS_SECONDS = 31536000  # 1 year
        SECURE_HSTS_INCLUDE_SUBDOMAINS = True
        SECURE_HSTS_PRELOAD = True

AUTH_USER_MODEL = 'users.User'

# ── Authentication Backends ─────────────────────────────────────────────────
AUTHENTICATION_BACKENDS = [
    'users.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# ── REST Framework ──────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'core.authentication.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'login': '50/hour',
        'receipt_scan': '20/hour',  # AI API calls are expensive
    },
}

# ── JWT Settings ─────────────────────────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ── CORS ──────────────────────────────────────────────────────────────────────
# Restrict to known origins. Never use CORS_ALLOW_ALL_ORIGINS = True in production.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# ── Email Settings ───────────────────────────────────────────────────────────
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'PocketFlow <noreply@pocketflow.com>')

# Frontend URL — used to build password reset links sent in emails
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Email backend: Gmail SMTP (development & production)
# Set EMAIL_HOST_USER to your Gmail address to enable real emails.
# Leave it empty to fall back to console backend (emails print to Django window).
_email_host_user = os.getenv('EMAIL_HOST_USER', '')
if _email_host_user:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
    EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
    EMAIL_HOST_USER = _email_host_user
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
    DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', f'PocketFlow <{_email_host_user}>')
else:
    # Development: emails are printed to the console
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ── Telegram Bot ──────────────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN    = os.getenv('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_BOT_USERNAME = os.getenv('TELEGRAM_BOT_USERNAME', '')
TELEGRAM_WEBHOOK_URL  = os.getenv('TELEGRAM_WEBHOOK_URL', '')
TELEGRAM_PROXY_ENABLED = env_bool('TELEGRAM_PROXY_ENABLED', True)


# ── AI Scan Settings ────────────────────────────────────────────────────────
# Priority: Use .env file, then check system variables
_env_key = os.getenv('GEMINI_API_KEY')
GEMINI_API_KEY = _env_key if _env_key else os.getenv('GOOGLE_API_KEY', os.getenv('GOOGLE_GENERATIVE_AI_API_KEY', ''))


# ── JWT Cookie Names (must match cookie_utils.py) ────────────────────────────
JWT_ACCESS_COOKIE_NAME = "access_token"
JWT_REFRESH_COOKIE_NAME = "refresh_token"

# ── Error Tracking (Sentry) ────────────────────────────────────────────────────
SENTRY_DSN = os.getenv('SENTRY_DSN', '')
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,
        environment='production' if not DEBUG else 'development',
    )
    logger.info("Sentry error tracking initialized")
