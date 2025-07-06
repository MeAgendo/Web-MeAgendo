# autoscheduler/apps.py
from django.apps import AppConfig

class AutoschedulerConfig(AppConfig):
    name = 'autoscheduler'

    def ready(self):
        import autoscheduler.signals
