# accounts/views.py

from django.shortcuts            import render, redirect
from django.contrib.auth         import authenticate, login, logout
from django.contrib.auth.models  import User
from django.http                 import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.cache import never_cache
from django.db                   import IntegrityError

@require_http_methods(["GET", "POST"])
def signup(request):
    if request.method == 'GET':
        return render(request, 'Crear_Cuenta.html')

    u  = request.POST.get('username', '').strip()
    e  = request.POST.get('email', '').strip()
    p1 = request.POST.get('password1', '')
    p2 = request.POST.get('password2', '')

    if not (u and e and p1 and p2):
        error = 'Completa todos los campos'
    elif p1 != p2:
        error = 'Las contraseñas no coinciden'
    else:
        try:
            User.objects.create_user(username=u, email=e, password=p1)
        except IntegrityError:
            error = 'El nombre de usuario ya está en uso'
        except Exception:
            error = 'Error al crear el usuario'
        else:
            return JsonResponse({
                'success': True,
                'redirect': '/accounts/login/'
            })

    return JsonResponse({'success': False, 'error': error}, status=400)


@never_cache
@ensure_csrf_cookie
def login_view(request):
    error = ''
    if request.method == 'POST':
        user = authenticate(
            request,
            username=request.POST.get('username', ''),
            password=request.POST.get('password', '')
        )
        if user:
            login(request, user)
            # Sesión válida por 1 hora
            request.session.set_expiry(3600)
            return redirect('core:calendar')
        error = 'Credenciales inválidas'

    # Siempre renderiza el form de login, incluso si ya estuvieras autenticado
    return render(request, 'Iniciar_Sesion.html', {'error': error})


@never_cache
def logout_view(request):
    logout(request)
    # logout() ya borra la cookie de sesión persistente
    return redirect('core:home')
