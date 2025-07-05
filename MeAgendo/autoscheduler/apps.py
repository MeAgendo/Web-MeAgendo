from django.apps import AppConfig

class AutoschedulerConfig(AppConfig):
    name = 'autoscheduler'

    def ready(self):
        # importa aquí signals para que Django los registre
        import autoscheduler.signals
