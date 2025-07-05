# dashboard/models.py

from django.db import models
from django.conf import settings

class Task(models.Model):
    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    due_date    = models.DateField("Fecha límite")
    title       = models.CharField("Título", max_length=200)
    description = models.TextField("Descripción", blank=True)
    time_window = models.CharField(
        "Plazo de tiempo",
        max_length=20,
        choices=[
            ("hoy",   "Hoy"),
            ("semana","Esta semana"),
            ("mes",   "Este mes"),
        ],
        blank=True
    )
    priority    = models.CharField(
        "Prioridad",
        max_length=10,
        choices=[
            ("alta",  "Alta"),
            ("media", "Media"),
            ("baja",  "Baja"),
        ]
    )
    progress    = models.PositiveIntegerField(
        "Progreso (%)",
        default=0,
        help_text="Porcentaje completado"
    )
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} — {self.due_date}"


class Event(models.Model):
    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    date        = models.DateField("Fecha")
    title       = models.CharField("Título", max_length=200)
    description = models.TextField("Descripción", blank=True)
    repetition  = models.CharField(
        "Repetición",
        max_length=10,
        choices=[
            ("no",      "No recurrente"),
            ("diario",  "Diario"),
            ("semanal", "Semanal"),
            ("mensual","Mensual"),
        ],
        default="no"
    )
    start_time  = models.TimeField("Hora desde", null=True, blank=True)
    end_time    = models.TimeField("Hora hasta", null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} @ {self.date}"

    @property
    def all_day(self):
        return self.start_time is None and self.end_time is None
