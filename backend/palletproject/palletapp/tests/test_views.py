from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from ..models import Company, Product, Listing, Bid
from ..serializers import CompanySerializer, ProductSerializer, ListingSerializer, BidSerializer

User = get_user_model()

class APITestCaseSetup(APITestCase):
    def setUp(self):
        """Set up test data for authenticated user and models."""
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.client.login(username='testuser', password='testpassword')

        self.company = Company.objects.create(name='Test Company', address='123 Test Address')
        self.product = Product.objects.create(name='Test Product', sku='TP001', description='A test product')
        self.listing = Listing.objects.create(
            product=self.product,
            company=self.company,
            quantity=100,
            price_per_unit=10.0
        )
        self.bid = Bid.objects.create(
            auction=self.auction,
            user=self.user,
            price_per_unit=12.0,
            quantity=10
        )

class TestCompanyViewSet(APITestCaseSetup):
    def test_list_companies(self):
        response = self.client.get('/api/companies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_company(self):
        data = {'name': 'New Company', 'address': '456 New Address'}
        response = self.client.post('/api/companies/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Company.objects.count(), 2)

    def test_update_company(self):
        data = {'name': 'Updated Company Name'}
        response = self.client.patch(f'/api/companies/{self.company.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertEqual(self.company.name, 'Updated Company Name')

    def test_delete_company(self):
        response = self.client.delete(f'/api/companies/{self.company.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Company.objects.count(), 0)

class TestProductViewSet(APITestCaseSetup):
    def test_list_products(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_product_invalid_data(self):
        data = {'name': '', 'sku': '', 'description': ''}  # Invalid data
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_product(self):
        data = {'name': 'New Product', 'sku': 'NP001', 'description': 'Another test product'}
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)

# Repeat similar test cases for Listing, Auction, and Bid ViewSets

class TestBidViewSet(APITestCaseSetup):
    def test_create_bid_invalid_quantity(self):
        data = {
            'auction': self.auction.id,
            'user': self.user.id,
            'price_per_unit': 11.0,
            'quantity': 0  # Invalid quantity
        }
        response = self.client.post('/api/bids/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_bid_success(self):
        data = {
            'auction': self.auction.id,
            'price_per_unit': 15.0,
            'quantity': 5
        }
        response = self.client.post('/api/bids/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_bids(self):
        response = self.client.get('/api/bids/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
