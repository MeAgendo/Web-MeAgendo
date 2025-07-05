# autoscheduler/planner.py

from datetime import datetime, timedelta
from dashboard.models import Task, Event

def generate_sessions_for_task(task):
    if task.auto_scheduled:
        return

    # Refetch para tener tipos correctos
    task = Task.objects.get(pk=task.pk)
    start = task.start_date
    end   = task.due_date

    # Necesitamos al menos 1 día entero entre start y end
    days_between = (end - start).days
    if not start or not end or days_between < 2:
        return

    # Bloques diarios según prioridad
    blocks_per_day = {
        'alta':  3,
        'media': 2,
        'baja':  1,
    }[task.priority]

    # Duración de sesión en timedelta
    session_td = timedelta(hours=task.session_length)
    # Descanso entre sesiones (por ejemplo 15 minutos)
    break_td   = timedelta(minutes=15)

    # Generar un solo evento por día (días intermedios)
    for offset in range(1, days_between):
        date_ = start + timedelta(days=offset)

        # Hora de inicio base: 09:00
        start_dt = datetime.combine(date_, datetime.min.time()) + timedelta(hours=9)

        # Duración total del bloque (sesiones + descansos)
        total_td = blocks_per_day * session_td \
                   + (blocks_per_day - 1) * break_td

        end_dt = start_dt + total_td

        # Crear evento agrupado
        Event.objects.create(
            user         = task.user,
            date         = date_,
            start_time   = start_dt.time(),
            end_time     = end_dt.time(),
            title        = f"Sprint múltiple: {task.title}",
            related_task = task
        )

    # Marcar como auto-agendada
    task.auto_scheduled = True
    task.save(update_fields=['auto_scheduled'])
