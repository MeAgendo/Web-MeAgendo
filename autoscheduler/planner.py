# dashboard/planner.py

from datetime import datetime, timedelta, time
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from dashboard.models import Task, Event


def generate_sessions_for_task(task: Task, force_reschedule: bool = False) -> None:
    """
    Auto-agenda sesiones para `task` según settings.AUTOSCHEDULER:
      - PRIORITY_FREQUENCY_DAYS
      - SKIP_WEEKENDS
      - WORKING_HOURS
      - MAX_SESSION_LENGTH
      - MIN_BREAK_MINUTES
      - TOTAL_HOURS_PER_PRIORITY (opcional)
      - MAX_SESSIONS_PER_DAY (opcional, por defecto 2)

    Si force_reschedule=True, borra sesiones previas y re-agenda desde cero.
    """
    task = Task.objects.get(pk=task.pk)  # instancia actualizada
    cfg = settings.AUTOSCHEDULER

    freq_days       = cfg["PRIORITY_FREQUENCY_DAYS"].get(task.priority, 1)
    skip_weekends   = cfg["SKIP_WEEKENDS"]
    work_start, work_end = cfg["WORKING_HOURS"]
    session_len     = min(task.session_length, cfg["MAX_SESSION_LENGTH"])
    min_break       = timedelta(minutes=cfg["MIN_BREAK_MINUTES"])

    # Límite total de horas por prioridad
    total_by_prio = cfg.get("TOTAL_HOURS_PER_PRIORITY", {})
    max_hours     = total_by_prio.get(task.priority)
    use_hours_lim = isinstance(max_hours, (int, float))

    # Límite de sesiones diarias (por prioridad o por defecto 2)
    max_sessions_day = cfg.get("MAX_SESSIONS_PER_DAY", 2)

    if task.auto_scheduled and not force_reschedule:
        return

    if force_reschedule:
        Event.objects.filter(related_task=task).delete()
        task.auto_scheduled = False

    sd, ed = task.start_date, task.due_date
    if not sd or not ed or sd > ed:
        return

    hours_scheduled = 0.0
    current_day     = sd

    while current_day <= ed:
        if not (skip_weekends and current_day.weekday() >= 5):
            # cuántas sesiones ya tiene el día
            daily_count = Event.objects.filter(
                related_task=task, date=current_day
            ).count()

            # programar hasta max_sessions_day y tope de horas
            while daily_count < max_sessions_day:
                if use_hours_lim and hours_scheduled >= max_hours:
                    break

                created = _schedule_one_session(
                    task, current_day,
                    work_start, work_end,
                    session_len, min_break
                )
                if not created:
                    break

                daily_count   += 1
                hours_scheduled += session_len

        # si llegamos al tope total, salimos
        if use_hours_lim and hours_scheduled >= max_hours:
            break

        current_day += timedelta(days=freq_days)

    task.auto_scheduled = True
    task.save(update_fields=["auto_scheduled"])


def _schedule_one_session(
    task: Task,
    session_day: datetime.date,
    work_start: int,
    work_end: int,
    session_hours: int,
    min_break: timedelta
) -> bool:
    """
    Busca un hueco de `session_hours` horas en el día laboral.
    Avanza el cursor al fin del conflicto + `min_break`.
    Retorna True si crea la sesión, False si no hay espacio.
    """
    tz            = timezone.get_current_timezone()
    desired_delta = timedelta(hours=session_hours)

    # cursor tras la última sesión de esta tarea en el día (+break), o al iniciar
    last_evt = (
        Event.objects
        .filter(related_task=task, date=session_day)
        .order_by("-end_time")
        .first()
    )
    if last_evt:
        start_dt = datetime.combine(session_day, last_evt.end_time) + min_break
    else:
        start_dt = datetime.combine(session_day, time(hour=work_start))

    cursor     = timezone.make_aware(start_dt, tz)
    end_of_day = timezone.make_aware(
        datetime.combine(session_day, time(hour=work_end)), tz
    )

    # se exige al menos 30min de hueco
    if cursor + timedelta(minutes=30) > end_of_day:
        return False

    while cursor < end_of_day:
        slot_end = cursor + desired_delta
        if slot_end > end_of_day:
            slot_end = end_of_day

        conflict = (
            Event.objects
            .filter(user=task.user, date=session_day)
            .filter(start_time__lt=slot_end.time(),
                    end_time__gt=cursor.time())
            .order_by("end_time")
            .first()
        )

        if conflict:
            # avanzar al fin del evento conflictivo + descanso
            conflict_end = datetime.combine(session_day, conflict.end_time)
            cursor = timezone.make_aware(conflict_end, tz) + min_break
            continue

        # si el hueco es menor de 30min, no lo usamos
        if (slot_end - cursor) < timedelta(minutes=30):
            return False

        with transaction.atomic():
            Event.objects.create(
                user         = task.user,
                date         = session_day,
                start_time   = cursor.time(),
                end_time     = slot_end.time(),
                title        = f"Sprint: {task.title}",
                related_task = task
            )
        return True

    return False
