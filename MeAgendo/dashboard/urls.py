# dashboard/urls.py

from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    # Calendario principal
    path('', views.calendar_view, name='calendar'),

    # Formulario Nueva Tarea
    path('task/new/', views.task_create_view, name='task_create'),
    # Editar y eliminar Tarea
    path('task/<int:pk>/edit/',   views.task_edit_view,   name='task_edit'),
    path('task/<int:pk>/delete/', views.task_delete_view, name='task_delete'),

    # Formulario Nuevo Evento
    path('event/new/', views.event_create_view, name='event_create'),
    # Editar y eliminar Evento
    path('event/<int:pk>/edit/',   views.event_edit_view,   name='event_edit'),
    path('event/<int:pk>/delete/', views.event_delete_view, name='event_delete'),

    # APIs JSON
    path('api/tasks/',  views.tasks_api,  name='tasks_api'),
    path('api/events/', views.events_api, name='events_api'),
]
