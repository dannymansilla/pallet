from django.db import models
from django.conf import settings


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    NOTIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('read', 'Read'),
    ]
    delivery_status = models.CharField(max_length=20, choices=NOTIFICATION_STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Notification {self.id} to {self.recipient.username}"


class ActivityLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    action_type = models.CharField(max_length=50)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.action_type} by {self.actor} at {self.timestamp}"


class Settings(models.Model):
    name = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Setting {self.name} = {self.value}"
