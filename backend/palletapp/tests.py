from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Listing, Bid, Company, Notification
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken


class UserTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.company = Company.objects.create(
            company_name="Test Company", address="123 Test St", phone="123456789"
        )
        self.user = User.objects.create_user(
            email="testuser@example.com", name="Test User", password="password123", company=self.company
        )

    def authenticate(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_user_registration(self):
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword123"
        }
        response = self.client.post(reverse('register'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)

    def test_profile_endpoint(self):
        self.authenticate()
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.user.name)

    def test_create_company(self):
        data = {
            "company_name": "New Company",
            "address": "456 New St",
            "phone": "987654321"
        }
        response = self.client.post(reverse('create-company'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)

    def test_current_bids(self):
        self.authenticate()
        listing = Listing.objects.create(user=self.user, title="Test Listing", description="A test listing", status="Open", closing_date="2024-12-31")
        Bid.objects.create(user=self.user, listing=listing, bid_amount=100, quantity=10, status="OPEN")

        response = self.client.get(reverse('current-bids'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['listing']['title'], "Test Listing")

    def test_user_listings(self):
        self.authenticate()
        Listing.objects.create(user=self.user, title="Test Listing 1", description="Description 1", status="Open", closing_date="2024-12-31")
        Listing.objects.create(user=self.user, title="Test Listing 2", description="Description 2", status="Open", closing_date="2024-12-31")

        response = self.client.get(reverse('user-listings'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['title'], "Test Listing 1")

class NotificationTests(TestCase):
    def setUp(self):
        # Create a user and company
        self.user = User.objects.create_user(username="testuser", password="testpass", role="admin")
        self.company = Company.objects.create(name="Test Company", contact_email="test@example.com")

    def test_company_approval_notification(self):
        # Simulate approval
        self.company.is_approved = True
        self.company.save()

        # Assert notification
        notification = Notification.objects.filter(recipient=self.user).first()
        self.assertIsNotNone(notification)
        self.assertEqual(notification.message, f"Your company {self.company.name} has been approved!")