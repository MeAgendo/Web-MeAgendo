# dashboard/views.py

from django.views.decorators.clickjacking import xframe_options_exempt
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
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
        return render(request,
                      "cuestionario_Nueva_Tarea.html",
                      {"form_data": {}, "error_message": None, "is_edit": False})

    data = request.POST
    if (not data.get("fecha-inicio")
        or not data.get("fecha-limite")
        or not data.get("titulo")
        or not data.get("prioridad")
        or not data.get("duracion-sesion")):
        return render(request,
                      "cuestionario_Nueva_Tarea.html",
                      {"form_data": data,
                       "error_message": "Faltan datos obligatorios",
                       "is_edit": False},
                      status=400)

    Task.objects.create(
        user           = request.user,
        start_date     = data["fecha-inicio"],
        due_date       = data["fecha-limite"],
        title          = data["titulo"],
        description    = data.get("descripcion", ""),
        priority       = data["prioridad"],
        session_length = int(data["duracion-sesion"]),
    )
    return render(request, "success_iframe.html", {"message": "Tarea creada correctamente"})


@xframe_options_exempt
@login_required
@require_http_methods(["GET", "POST"])
def task_edit_view(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)

    if request.method == "GET":
        form_data = {
            "id":              task.id,
            "fecha-inicio":    task.start_date.isoformat() if task.start_date else "",
            "fecha-limite":    task.due_date.isoformat()   if task.due_date   else "",
            "titulo":          task.title,
            "descripcion":     task.description,
            "duracion-sesion": task.session_length,
            "prioridad":       task.priority,
        }
        return render(request,
                      "cuestionario_Nueva_Tarea.html",
                      {"form_data": form_data,
                       "error_message": None,
                       "is_edit": True})

    data = request.POST
    if (not data.get("fecha-inicio")
        or not data.get("fecha-limite")
        or not data.get("titulo")
        or not data.get("prioridad")
        or not data.get("duracion-sesion")):
        return render(request,
                      "cuestionario_Nueva_Tarea.html",
                      {"form_data": data,
                       "error_message": "Faltan datos obligatorios",
                       "is_edit": True},
                      status=400)

    task.start_date     = data["fecha-inicio"]
    task.due_date       = data["fecha-limite"]
    task.title          = data["titulo"]
    task.description    = data.get("descripcion", "")
    task.priority       = data["prioridad"]
    task.session_length = int(data["duracion-sesion"])
    task.save()

    return render(request, "success_iframe.html", {"message": "Tarea actualizada correctamente"})

@xframe_options_exempt
@login_required
@require_http_methods(["POST"])
def task_delete_view(request, pk):
    task = get_object_or_404(Task, pk=pk, user=request.user)
    task.delete()
    return render(request, "success_iframe.html", {"message": "Tarea eliminada correctamente"})


@xframe_options_exempt
@login_required
@require_http_methods(["GET", "POST"])
def event_create_view(request):
    if request.method == "GET":
        return render(request,
                      "cuestionario_Nuevo_Evento.html",
                      {"form_data": {}, "error_message": None, "is_edit": False})

    data        = request.POST
    fecha       = data.get("fecha_limite", "").strip()
    titulo      = data.get("titulo", "").strip()
    start       = data.get("hora_desde", "").strip()
    end         = data.get("hora_hasta", "").strip()
    repet       = data.get("repeticion", "no")
    descripcion = data.get("descripcion", "")

    error_message = None
    if not fecha or not titulo:
        error_message = "Faltan datos obligatorios"
    elif bool(start) != bool(end):
        error_message = "Si defines hora, completa ambos campos"
    elif start and end and start >= end:
        error_message = "La hora de inicio debe ser anterior a la de fin"

    if error_message:
        return render(request,
                      "cuestionario_Nuevo_Evento.html",
                      {
                        "form_data": {
                          "fecha_limite": fecha,
                          "titulo":       titulo,
                          "descripcion":  descripcion,
                          "repeticion":   repet,
                          "hora_desde":   start,
                          "hora_hasta":   end,
                        },
                        "error_message": error_message,
                        "is_edit": False
                      },
                      status=400)

    Event.objects.create(
        user        = request.user,
        date        = fecha,
        title       = titulo,
        description = descripcion,
        repetition  = repet,
        start_time  = start or None,
        end_time    = end   or None,
    )
    return render(request, "success_iframe.html", {"message": "Evento creado correctamente"})


@xframe_options_exempt
@login_required
@require_http_methods(["GET", "POST"])
def event_edit_view(request, pk):
    event = get_object_or_404(Event, pk=pk, user=request.user)

    if request.method == "GET":
        form_data = {
            "id":            event.id,
            "fecha_limite":  event.date.isoformat(),
            "titulo":        event.title,
            "descripcion":   event.description,
            "repeticion":    event.repetition,
            "hora_desde":    event.start_time.strftime("%H:%M") if event.start_time else "",
            "hora_hasta":    event.end_time.strftime("%H:%M")   if event.end_time   else "",
        }
        return render(request,
                      "cuestionario_Nuevo_Evento.html",
                      {"form_data": form_data, "error_message": None, "is_edit": True})

    data        = request.POST
    fecha       = data.get("fecha_limite", "").strip()
    titulo      = data.get("titulo", "").strip()
    start       = data.get("hora_desde", "").strip()
    end         = data.get("hora_hasta", "").strip()
    repet       = data.get("repeticion", "no")
    descripcion = data.get("descripcion", "")

    error_message = None
    if not fecha or not titulo:
        error_message = "Faltan datos obligatorios"
    elif bool(start) != bool(end):
        error_message = "Si defines hora, completa ambos campos"
    elif start and end and start >= end:
        error_message = "La hora de inicio debe ser anterior a la de fin"

    if error_message:
        return render(request,
                      "cuestionario_Nuevo_Evento.html",
                      {
                        "form_data": {
                          "fecha_limite": fecha,
                          "titulo":       titulo,
                          "descripcion":  descripcion,
                          "repeticion":   repet,
                          "hora_desde":   start,
                          "hora_hasta":   end,
                        },
                        "error_message": error_message,
                        "is_edit": True
                      },
                      status=400)

    event.date        = fecha
    event.title       = titulo
    event.description = descripcion
    event.repetition  = repet
    event.start_time  = start or None
    event.end_time    = end   or None
    event.save()

    return render(request, "success_iframe.html", {"message": "Evento actualizado correctamente"})


@xframe_options_exempt
@login_required
@require_http_methods(["POST"])
def event_delete_view(request, pk):
    event = get_object_or_404(Event, pk=pk, user=request.user)
    event.delete()
    return render(request, "success_iframe.html", {"message": "Evento eliminado correctamente"})


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
    data = [{
        "id":       e.id,
        "title":    e.title,
        "date":     e.date.isoformat(),
        "start":    (e.start_time.strftime("%H:%M") if e.start_time else ""),
        "end":      (e.end_time.strftime("%H:%M")   if e.end_time   else ""),
        "task_id":  (e.related_task.id if e.related_task else None),
        "status":   e.status,
    } for e in qs]
    return JsonResponse(data, safe=False)
