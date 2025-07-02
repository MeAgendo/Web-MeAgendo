# password_reset/views.py

from django.shortcuts               import render
from django.contrib.auth.models     import User
from django.core.mail               import send_mail
from django.http                    import JsonResponse
from django.views.decorators.csrf   import ensure_csrf_cookie
from django.utils                   import timezone
from django.core.exceptions         import MultipleObjectsReturned
import random

from .models import PasswordResetCode

@ensure_csrf_cookie
def forgot_password(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'No existe cuenta con ese correo'
            }, status=404)
        except MultipleObjectsReturned:
            # Si hay duplicados, tomar el más reciente
            user = User.objects.filter(email=email).order_by('-date_joined').first()

        # Generar código de 6 dígitos
        code = f"{random.randint(0, 999999):06d}"

        # Limpiar códigos previos y crear uno nuevo
        PasswordResetCode.objects.filter(user=user).delete()
        PasswordResetCode.objects.create(user=user, code=code)

        # Enviar email (se imprimirá en consola)
        send_mail(
            subject='MeAgendo: tu código de recuperación',
            message=f'Tu código de recuperación es: {code}',
            from_email=None,
            recipient_list=[email],
        )

        return JsonResponse({
            'success': True,
            'message': 'Código enviado. Te redirigimos...'
        })

    return render(request, 'forgot_password.html')


@ensure_csrf_cookie
def reset_password(request):
    if request.method == 'POST':
        code = request.POST.get('code', '').strip()
        p1   = request.POST.get('password1', '')
        p2   = request.POST.get('password2', '')

        if p1 != p2:
            return JsonResponse({
                'success': False,
                'message': 'Las contraseñas no coinciden'
            }, status=400)

        now = timezone.now()
        try:
            obj = PasswordResetCode.objects.get(code=code, expires_at__gte=now)
        except PasswordResetCode.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Código inválido o expirado'
            }, status=400)

        # Actualizar contraseña y eliminar el código
        user = obj.user
        user.set_password(p1)
        user.save()
        obj.delete()

        return JsonResponse({
            'success': True,
            'message': 'Contraseña actualizada. Ya puedes iniciar sesión.'
        })

    return render(request, 'reset_password.html')
