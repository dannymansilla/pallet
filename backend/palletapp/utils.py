from .models import Notification

def send_notification(user, message, notification_type='email'):
    """
    Sends a notification to a user.

    Args:
        user (User): The recipient of the notification.
        message (str): The message to send.
        notification_type (str): Type of notification (default: email).
    """
    Notification.objects.create(
        recipient=user,
        message=message,
        notification_type=notification_type,
    )
