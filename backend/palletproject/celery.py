import os
from celery import Celery

# Set default Django settings for Celery
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "palletproject.settings")

app = Celery("palletproject")

# Load task modules from all registered Django app configs
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks in Django apps
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
