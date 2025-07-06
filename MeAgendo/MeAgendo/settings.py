import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv 

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')


# SECURITY
SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'django-insecure-rerp7=w4wm4k7a3a=c4l7bt!rz9q3stih^=)g+!)o5#f-hf^mn'
)
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    'accounts',
    'password_reset',
    'dashboard',
    'autoscheduler.apps.AutoschedulerConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'MeAgendo.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'MeAgendo.wsgi.application'


# Cadena de conexión a Postgres
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgres://usuario:password@localhost:5432/mi_basededatos'
)

# configura DATABASES usando esa variable
DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
}



# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']

EMAIL_BACKEND = os.getenv(
    'EMAIL_BACKEND',
    'django.core.mail.backends.smtp.EmailBackend'
)

EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'

EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')

DEFAULT_FROM_EMAIL = os.getenv(
    'DEFAULT_FROM_EMAIL',
    'MeAgendo <no-reply@meagendo.com>'
)
AUTOSCHEDULER = {
    # Frecuencia en días entre sesiones según prioridad
    # “cada 1 día” → diario; “cada 3 días” → interdiario
    "PRIORITY_FREQUENCY_DAYS": {
        "alta":  1,   # cada día
        "media": 3,   # cada 3 días
        "baja":  7,   # cada semana
    },

    # Horario laboral (inicio, fin)
    "WORKING_HOURS": (9, 18),

    # Si saltar fines de semana
    "SKIP_WEEKENDS": True,

    # Duración máxima de sesión (horas)
    "MAX_SESSION_LENGTH": 4,

    # Duración de descanso mínimo al buscar hueco (minutos)
    "MIN_BREAK_MINUTES": 15,
}
