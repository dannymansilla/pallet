from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import Organization
from apps.inventory.models import SellerProfile


class Command(BaseCommand):
    help = 'Creates SellerProfile records for organizations marked as sellers'

    def handle(self, *args, **options):
        seller_orgs = Organization.objects.filter(is_seller=True)
        
        for org in seller_orgs:
            profile, created = SellerProfile.objects.get_or_create(
                organization=org,
                defaults={'seller_since': timezone.now().date()}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created profile for {org.name}'))
            else:
                self.stdout.write(f'Profile already exists for {org.name}') 