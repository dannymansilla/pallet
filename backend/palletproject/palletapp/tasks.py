from celery import shared_task
from .models import AuctionCycle
from django.utils.timezone import now

@shared_task
def update_auction_cycles():
    """Scheduled task to update the status of all auction cycles."""
    today = now().date()
    for cycle in AuctionCycle.objects.all():
        cycle.update_status()
        print(f"Auction Cycle {cycle.id} updated to {cycle.status}.")
