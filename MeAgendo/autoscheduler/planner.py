# autoscheduler/planner.py

from datetime import datetime, timedelta
from dashboard.models import Event

def generate_sessions_for_task(task):
    if task.auto_scheduled:
        return

    # Obtener fechas como objetos date (pueden venir como str)
    start = task.start_date
    end   = task.due_date

    if isinstance(start, str):
        start = datetime.fromisoformat(start).date()
    if isinstance(end, str):
        end = datetime.fromisoformat(end).date()

    # Si falta alguna fecha, no generar
    if not start or not end:
        return

    total_days = (end - start).days + 1

    # Bloques diarios según prioridad
    blocks_per_day = {
        'alta':  3,
        'media': 2,
        'baja':  1,
    }[task.priority]

    session_length = 1  # duración en horas de cada bloque

    for day_offset in range(total_days):
        date_ = start + timedelta(days=day_offset)
        for i in range(blocks_per_day):
            # ej: sesiones a las 09:00, 11:00, 13:00
            hour = 9 + i * (session_length + 1)
            Event.objects.create(
                user         = task.user,
                date         = date_,
                start_time   = f"{hour:02d}:00",
                end_time     = f"{hour + session_length:02d}:00",
                title        = f"Sprint: {task.title}",
                related_task = task
            )

    # Marcar como auto-agendada para no duplicar bloques
    task.auto_scheduled = True
    task.save(update_fields=['auto_scheduled'])
