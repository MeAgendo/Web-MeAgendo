# dashboard/views.py

from django.views.decorators.clickjacking import xframe_options_exempt
from django.shortcuts import render
from django.http      import JsonResponse
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
    # GET → formulario vacío
    if request.method == "GET":
        return render(request,
                      "cuestionario_Nueva_Tarea.html",
                      {"form_data": {}, "error_message": None})

    data = request.POST
    # validar fecha-inicio, fecha-limite, título, prioridad y duración de sesión
    if (not data.get("fecha-inicio") or
        not data.get("fecha-limite") or
        not data.get("titulo") or
        not data.get("prioridad") or
        not data.get("duracion-sesion")):
        return render(request,
                      "cuestionario_Nueva_Tarea.html",
                      {
                        "error_message": "Faltan datos obligatorios",
                        "form_data": data
                      },
                      status=400)

    # crear Task usando los nuevos campos y session_length
    Task.objects.create(
        user           = request.user,
        start_date     = data["fecha-inicio"],
        due_date       = data["fecha-limite"],
        title          = data["titulo"],
        description    = data.get("descripcion", ""),
        priority       = data["prioridad"],
        session_length = int(data["duracion-sesion"]),
    )

    return render(request,
                  "success_iframe.html",
                  {"message": "Tarea creada correctamente"})


@xframe_options_exempt
@login_required
@require_http_methods(["GET", "POST"])
def event_create_view(request):
    # GET → formulario vacío
    if request.method == "GET":
        return render(request,
                      "cuestionario_Nueva_Evento.html",
                      {"form_data": {}, "error_message": None})

    data        = request.POST
    fecha       = data.get("fecha-limite", "").strip()
    titulo      = data.get("titulo", "").strip()
    start       = data.get("hora-desde", "").strip()
    end         = data.get("hora-hasta", "").strip()
    repet       = data.get("repeticion", "no")
    descripcion = data.get("descripcion", "")

    error_message = None

    # 1) Fecha y título obligatorios
    if not fecha or not titulo:
        error_message = "Faltan datos obligatorios"

    # 2) Si rellena una hora, debe rellenar la otra
    elif bool(start) != bool(end):
        error_message = (
          "Si defines hora, completa ambos campos; "
          "si no, déjalos vacíos para evento de Todo el día"
        )

    # 3) Si ambas existen, start < end
    elif start and end and start >= end:
        error_message = "La hora de inicio debe ser anterior a la hora de fin"

    # re-render si hay error
    if error_message:
        return render(request,
                      "cuestionario_Nueva_Evento.html",
                      {
                        "error_message": error_message,
                        "form_data": {
                          "fecha-limite": fecha,
                          "titulo":       titulo,
                          "descripcion":  descripcion,
                          "repeticion":   repet,
                          "hora-desde":   start,
                          "hora-hasta":   end,
                        }
                      },
                      status=400)

    # si no definió horas → all-day event
    start_time = start or None
    end_time   = end   or None

    Event.objects.create(
        user        = request.user,
        date        = fecha,
        title       = titulo,
        description = descripcion,
        repetition  = repet,
        start_time  = start_time,
        end_time    = end_time,
    )

    return render(request,
                  "success_iframe.html",
                  {"message": "Evento creado correctamente"})


@login_required
def tasks_api(request):
    qs = Task.objects.filter(user=request.user)
    data = [{
        "id":             t.id,
        "title":          t.title,
        "start":          t.start_date.isoformat() if t.start_date else None,
        "due":            t.due_date.isoformat()   if t.due_date   else None,
        "progress":       t.progress,
        "auto_scheduled": t.auto_scheduled,
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
            "id":       e.id,
            "title":    e.title,
            "date":     e.date.isoformat(),
            "start":    start,
            "end":      end,
            "task_id":  e.related_task.id if e.related_task else None,
            "status":   e.status,
        })
    return JsonResponse(data, safe=False)
