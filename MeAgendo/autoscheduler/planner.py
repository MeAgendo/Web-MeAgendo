from datetime import datetime, timedelta, time
from django.conf      import settings
from dashboard.models import Task, Event

def generate_sessions_for_task(task):
    if task.auto_scheduled:
        return

    task = Task.objects.get(pk=task.pk)
    start_date, end_date = task.start_date, task.due_date
    if not start_date or not end_date or start_date > end_date:
        return

    cfg            = settings.AUTOSCHEDULER
    freq_days      = cfg["PRIORITY_FREQUENCY_DAYS"].get(task.priority, 1)
    skip_weekends  = cfg["SKIP_WEEKENDS"]
    work_start, work_end = cfg["WORKING_HOURS"]
    session_len    = min(task.session_length, cfg["MAX_SESSION_LENGTH"])
    min_break      = timedelta(minutes=cfg["MIN_BREAK_MINUTES"])

    # Recorremos fechas desde start_date hasta end_date, con paso frequency_days
    current = start_date
    while current <= end_date:
        # Omitir fin de semana si corresponde
        if not (skip_weekends and current.weekday() >= 5):
            # Intentar reservar una sesión en este día
            _schedule_one_session(task, current,
                                  work_start, work_end,
                                  session_len, min_break)
        current += timedelta(days=freq_days)

    task.auto_scheduled = True
    task.save(update_fields=['auto_scheduled'])


def _schedule_one_session(task, session_day,
                          work_start, work_end,
                          session_hours, min_break):
    """
    Busca el primer hueco libre en el día laboral [work_start–work_end]
    para una sesión de session_hours horas, sin chocar con otros eventos.
    """
    desired = timedelta(hours=session_hours)
    cursor = datetime.combine(session_day, time(hour=work_start))

    end_of_day = datetime.combine(session_day, time(hour=work_end))

    while cursor + timedelta(minutes=30) <= end_of_day:
        slot_end = cursor + desired
        # Ajustar si sobrepasa jornada
        if slot_end > end_of_day:
            slot_end = end_of_day
            # Si sobra menos de 30 min, salimos
            if (slot_end - cursor) < timedelta(minutes=30):
                break

        # Comprobar conflictos
        conflict = Event.objects.filter(
            user=task.user,
            date=session_day,
            start_time__lt=slot_end.time(),
            end_time__gt=cursor.time()
        ).exists()

        if not conflict:
            # Crear sesión
            Event.objects.create(
                user         = task.user,
                date         = session_day,
                start_time   = cursor.time(),
                end_time     = slot_end.time(),
                title        = f"Sprint: {task.title}",
                related_task = task
            )
            return

        # Avanzar cursor: al final del evento conflictivo o +min_break
        # Simplificación: sumamos session_hours + min_break
        cursor = cursor + desired + min_break
