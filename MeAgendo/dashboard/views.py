# dashboard/views.py

from django.views.decorators.clickjacking import xframe_options_exempt
from django.shortcuts import render
from django.http      import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required

from .models import Task, Event


@login_required
def calendar_view(request):
    return render(request, "Calendario.html")


@xframe_options_exempt
@login_required
@require_http_methods(["GET", "POST"])
def task_create_view(request):
    if request.method == "GET":
        return render(request, "cuestionario_Nueva_Tarea.html")

    data = request.POST
    if not data.get("fecha-limite") or not data.get("titulo") or not data.get("prioridad"):
        return HttpResponseBadRequest("Faltan datos obligatorios")

    Task.objects.create(
        user        = request.user,
        due_date    = data["fecha-limite"],
        title       = data["titulo"],
        description = data.get("descripcion", ""),
        time_window = data.get("plazo-tiempo", ""),
        priority    = data["prioridad"],
    )
    return render(request, "success_iframe.html", {
        "message": "Tarea creada correctamente"
    })


@xframe_options_exempt
@login_required
@require_http_methods(["GET", "POST"])
def event_create_view(request):
    if request.method == "GET":
        return render(request, "cuestionario_Nuevo_Evento.html")

    data = request.POST
    # Validar campos obligatorios
    if (not data.get("fecha-limite") or
        not data.get("titulo") or
        not data.get("hora-desde") or
        not data.get("hora-hasta")):
        return HttpResponseBadRequest("Faltan datos obligatorios")

    # Validar orden de horas
    start = data["hora-desde"]
    end   = data["hora-hasta"]
    if start >= end:
        return HttpResponseBadRequest("La hora de inicio debe ser anterior a la hora de fin")

    Event.objects.create(
        user        = request.user,
        date        = data["fecha-limite"],
        title       = data["titulo"],
        description = data.get("descripcion", ""),
        repetition  = data.get("repeticion", "no"),
        start_time  = start,
        end_time    = end,
    )
    return render(request, "success_iframe.html", {
        "message": "Evento creado correctamente"
    })


@login_required
def tasks_api(request):
    qs = Task.objects.filter(user=request.user)
    data = [{
        "id":       t.id,
        "title":    t.title,
        "due":      t.due_date.isoformat(),
        "progress": getattr(t, "progress", 0)
    } for t in qs]
    return JsonResponse(data, safe=False)


@login_required
def events_api(request):
    qs = Event.objects.filter(user=request.user)
    data = []
    for e in qs:
        start = e.start_time.strftime("%H:%M") if e.start_time else ""
        end   = e.end_time.strftime("%H:%M")   if e.end_time   else ""
        data.append({
            "id":    e.id,
            "title": e.title,
            "date":  e.date.isoformat(),
            "start": start,
            "end":   end
        })
    return JsonResponse(data, safe=False)
