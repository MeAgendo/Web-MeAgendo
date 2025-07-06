# core/views.py

from django.shortcuts               import render, redirect
from django.contrib.auth.decorators import login_required

def home(request):
    # Si ya inició sesión (cookie de sesión válida), redirige al calendario
    if request.user.is_authenticated:
        return redirect('core:calendar')
    # Si no, muéstrale la página de inicio/landing
    return render(request, 'Inicio.html')

@login_required
def calendar(request):
    # Aquí sigue protegiendo tu calendarrio
    return render(request, 'Calendario.html')
