from django.core.management.base import BaseCommand
from django.utils.timezone import now
from palletapp.models import AuctionCycle

class Command(BaseCommand):
    help = "Automatically update auction cycle statuses based on the current date."

    def handle(self, *args, **kwargs):
        today = now().date()

        # Update listing → open
        AuctionCycle.objects.filter(status="listing", listing_end_date__lt=today).update(status="open")

        # Update open → closing
        AuctionCycle.objects.filter(status="open", open_end_date__lt=today).update(status="closing")

        # Update closing → closed
        AuctionCycle.objects.filter(status="closing", closing_end_date__lt=today).update(status="closed")

        self.stdout.write(self.style.SUCCESS("Auction cycles updated successfully!"))
