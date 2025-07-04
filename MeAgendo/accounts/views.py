from django.shortcuts                   import render, redirect
from django.http                        import JsonResponse
from django.views.decorators.http       import require_http_methods, require_GET
from django.views.decorators.csrf       import ensure_csrf_cookie
from django.views.decorators.cache      import never_cache
from django.contrib.auth                import authenticate, login, logout
from django.contrib.auth.models         import User
from .forms                             import SignUpForm

@require_http_methods(["GET", "POST"])
def signup(request):
    if request.method == 'GET':
        form = SignUpForm()
        return render(request, 'Crear_Cuenta.html', {'form': form})

    form = SignUpForm(request.POST)
    if form.is_valid():
        form.save()
        return JsonResponse({
            'success': True,
            'redirect': '/accounts/login/'
        })

    return JsonResponse({
        'success': False,
        'errors': form.errors
    }, status=400)

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
            request.session.set_expiry(3600)  # Sesión válida por 1 hora
            return redirect('core:calendar')
        error = 'Credenciales inválidas'

    return render(request, 'Iniciar_Sesion.html', {'error': error})

@never_cache
def logout_view(request):
    logout(request)
    return redirect('core:home')

@require_GET
def check_username(request):
    """
    Devuelve JSON con {'exists': True/False} según si el username ya está registrado.
    """
    username = request.GET.get('username', '').strip()
    exists = User.objects.filter(username__iexact=username).exists()
    return JsonResponse({'exists': exists})

@require_GET
def check_email(request):
    """
    Devuelve JSON con {'exists': True/False} según si el email ya está registrado.
    """
    email = request.GET.get('email', '').strip()
    exists = User.objects.filter(email__iexact=email).exists()
    return JsonResponse({'exists': exists})
