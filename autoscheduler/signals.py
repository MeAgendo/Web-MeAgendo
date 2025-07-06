from django.db.models.signals import post_save
from django.dispatch import receiver
from dashboard.models import Task
from .planner import generate_sessions_for_task

@receiver(post_save, sender=Task)
def auto_schedule_task(sender, instance, created, **kwargs):
    if created:
        generate_sessions_for_task(instance)
