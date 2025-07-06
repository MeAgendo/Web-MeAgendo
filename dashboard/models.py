# dashboard/models.py

from django.db import models
from django.conf import settings

class Task(models.Model):
    user         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    start_date   = models.DateField(
        "Fecha de inicio",
        null=True,
        blank=True,
        help_text="Fecha en que se puede empezar la tarea"
    )
    due_date     = models.DateField(
        "Fecha límite",
        null=True,
        blank=True,
        help_text="Deadline para completar la tarea"
    )
    title        = models.CharField("Título", max_length=200)
    description  = models.TextField("Descripción", blank=True)
    priority     = models.CharField(
        "Prioridad",
        max_length=10,
        choices=[
            ("alta",  "Alta"),
            ("media", "Media"),
            ("baja",  "Baja"),
        ],
        default="media"
    )
    session_length = models.PositiveIntegerField(
        "Duración de sesión (horas)",
        default=1,
        help_text="Horas por bloque de trabajo generado automáticamente"
    )
    progress     = models.PositiveIntegerField(
        "Progreso (%)",
        default=0,
        help_text="Porcentaje completado de la tarea"
    )
    auto_scheduled = models.BooleanField(
        "Auto-agendada",
        default=False,
        help_text="Indica si ya se generaron sesiones de enfoque"
    )
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.start_date} → {self.due_date})"


class Event(models.Model):
    STATUS_CHOICES = [
        ("pending",   "Pendiente"),
        ("completed", "Completado"),
        ("skipped",   "Omitido"),
    ]

    user          = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    date          = models.DateField("Fecha")
    start_time    = models.TimeField("Hora desde", null=True, blank=True)
    end_time      = models.TimeField("Hora hasta", null=True, blank=True)
    title         = models.CharField("Título", max_length=200)
    description   = models.TextField("Descripción", blank=True)
    repetition    = models.CharField(
        "Repetición",
        max_length=10,
        choices=[
            ("no",      "No recurrente"),
            ("diario",  "Diario"),
            ("semanal", "Semanal"),
            ("mensual", "Mensual"),
        ],
        default="no"
    )
    related_task  = models.ForeignKey(
        Task,
        verbose_name="Tarea relacionada",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        help_text="Si se generó como sesión de enfoque para una tarea"
    )
    status        = models.CharField(
        "Estado",
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending",
        help_text="Estado de este evento/session"
    )
    created_at    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        label = self.title or f"Evento {self.id}"
        return f"{label} @ {self.date} ({self.status})"

    @property
    def all_day(self):
        return self.start_time is None and self.end_time is None
