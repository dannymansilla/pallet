from celery import shared_task
from django.utils.timezone import now
from palletapp.models import AuctionCycle

@shared_task
def update_auction_cycles():
    today = now().date()

    # Move Listing → Open
    AuctionCycle.objects.filter(status="listing", listing_end_date__lt=today).update(status="open")

    # Move Open → Closing
    AuctionCycle.objects.filter(status="open", open_end_date__lt=today).update(status="closing")

    # Move Closing → Closed
    AuctionCycle.objects.filter(status="closing", closing_end_date__lt=today).update(status="closed")
