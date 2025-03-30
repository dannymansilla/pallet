from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User

class Command(BaseCommand):
    help = 'Creates an initial admin user'

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True, help='Admin user email')
        parser.add_argument('--password', required=True, help='Admin user password')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User with email {email} already exists'))
            return

        user = User.objects.create_user(
            email=email,
            username=email,
            password=password,
            role='admin',
            tos_accepted=True,
            tos_accepted_at=timezone.now()
        )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created admin user with email {email}')
        ) 