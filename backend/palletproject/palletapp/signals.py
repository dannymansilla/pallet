from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Company
from .utils import send_notification

@receiver(post_save, sender=Company)
def notify_on_company_creation(sender, instance, created, **kwargs):
    """
    Notify the admin user when a company is created and send a reminder for profile completion.
    """
    if created and not instance.is_approved:
        admin_user = instance.users.filter(role="admin").first()
        if admin_user:
            # Notify admin of company creation
            send_notification(
                admin_user,
                f"Your company {instance.name} has been created. Please complete your profile.",
                notification_type="email"
            )
