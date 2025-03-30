from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User, Organization

class Command(BaseCommand):
    help = 'Initialize database with required data'

    def handle(self, *args, **options):
        # Create admin user if it doesn't exist
        admin_email = 'admin@aidenproject.com'
        if not User.objects.filter(email=admin_email).exists():
            user = User.objects.create_user(
                email=admin_email,
                username=admin_email,
                password='secure_admin_password123',
                role='admin',
                tos_accepted=True,
                tos_accepted_at=timezone.now()
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created admin user with email {admin_email}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Admin user with email {admin_email} already exists')
            )

        # Create Aiden organization if it doesn't exist
        org_name = 'Aiden Project'
        if not Organization.objects.filter(name=org_name).exists():
            org = Organization.objects.create(
                name=org_name,
                contact_email=admin_email,
                approval_status='approved',
                is_seller=True,
                is_buyer=True,
                created_at=timezone.now(),
                approved_at=timezone.now()
            )
            
            # Associate admin user with Aiden organization
            admin_user = User.objects.get(email=admin_email)
            admin_user.organization = org
            admin_user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created organization: {org_name}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Organization {org_name} already exists')
            ) 