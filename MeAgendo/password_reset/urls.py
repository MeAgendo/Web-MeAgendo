# password_reset/urls.py

from django.urls import path
from . import views

app_name = 'password_reset'

urlpatterns = [
    # 1) Formulario para solicitar el envío del código
    path(
        'forgot-password/',
        views.forgot_password,
        name='forgot'
    ),

    # 2) Formulario para ingresar el código recibido y la nueva contraseña
    path(
        'reset-password/',
        views.reset_password,
        name='reset'
    ),
]

