# dashboard/urls.py

from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    # Calendario principal
    path('',            views.calendar_view,    name='calendar'),

    # Formulario Nueva Tarea
    path('task/new/',   views.task_create_view, name='task_create'),

    # Formulario Nuevo Evento  ← aquí había un typo en el name
    path('event/new/',  views.event_create_view,name='event_create'),

    # APIs JSON
    path('api/tasks/',  views.tasks_api,        name='tasks_api'),
    path('api/events/', views.events_api,       name='events_api'),
]
