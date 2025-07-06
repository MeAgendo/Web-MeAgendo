import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Carga variables de .env en local
load_dotenv(BASE_DIR / ".env")

# SECURITY
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-rerp7=w4wm4k7a3a=c4l7bt!rz9q3stih^=)g+!)o5#f-hf^mn"
)
DEBUG = os.getenv("DEBUG", "False") == "True"

# Hosts permitidos (incluye el hostname que Render expone)
RENDER_EXTERNAL_HOSTNAME = os.getenv("RENDER_EXTERNAL_HOSTNAME")
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "core",
    "accounts",
    "password_reset",
    "dashboard",
    "autoscheduler.apps.AutoschedulerConfig",
]

# Middleware (incluye WhiteNoise para servir estáticos en prod)
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "MeAgendo.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "MeAgendo.wsgi.application"

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///{}".format(BASE_DIR / "db.sqlite3")
)
DATABASES = {
    "default": dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=600,
        ssl_require=True
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME":
        "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {
        "NAME":
        "django.contrib.auth.password_validation.MinimumLengthValidator"
    },
    {
        "NAME":
        "django.contrib.auth.password_validation.CommonPasswordValidator"
    },
    {
        "NAME":
        "django.contrib.auth.password_validation.NumericPasswordValidator"
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = (
    "whitenoise.storage.CompressedManifestStaticFilesStorage"
)

# Email configuration (lee de variables de entorno)
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    "MeAgendo <no-reply@meagendo.com>"
)

# Autoscheduler settings
AUTOSCHEDULER = {
    "PRIORITY_FREQUENCY_DAYS": {
        "alta": 1,
        "media": 2,
        "baja": 3,
    },
    "MAX_SESSIONS_PER_DAY": 2,
    "SKIP_WEEKENDS": True,
    "WORKING_HOURS": (9, 18),
    "MAX_SESSION_LENGTH": 4,
    "MIN_BREAK_MINUTES": 30,
    "TOTAL_HOURS_PER_PRIORITY": {
        "alta": 8,
        "media": 4,
        "baja": 2,
    },
}