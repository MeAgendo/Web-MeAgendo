from django.urls import path
from .views import home,calendar

app_name = 'core'

urlpatterns = [
    path('', home, name='home'),
    path('calendar/', calendar, name='calendar'),
]
