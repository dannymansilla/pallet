from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import Organization
from apps.inventory.models import BuyerProfile


class Command(BaseCommand):
    help = 'Creates BuyerProfile records for organizations marked as buyers'

    def handle(self, *args, **options):
        buyer_orgs = Organization.objects.filter(is_buyer=True)
        
        for org in buyer_orgs:
            profile, created = BuyerProfile.objects.get_or_create(
                organization=org,
                defaults={'buyer_since': timezone.now().date()}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created profile for {org.name}'))
            else:
                self.stdout.write(f'Profile already exists for {org.name}') 