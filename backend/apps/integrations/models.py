from django.db import models
from apps.accounts.models import Organization


class ERPIntegration(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='integrations')
    erp_type = models.CharField(max_length=100)
    auth_credentials = models.TextField(blank=True, null=True)
    last_sync = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.erp_type} integration for {self.organization.name}"


class IntegrationLog(models.Model):
    erp_integration = models.ForeignKey(ERPIntegration, on_delete=models.CASCADE, related_name='logs')
    operation_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failure', 'Failure'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    response_message = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.operation_type} on {self.erp_integration.erp_type} ({self.status})"
