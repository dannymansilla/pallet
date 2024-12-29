from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, UserViewSet, ProductViewSet, ListingViewSet, AuctionViewSet, BidViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet) 
router.register(r'companies', CompanyViewSet)
router.register(r'products', ProductViewSet)
router.register(r'listings', ListingViewSet)
router.register(r'auctions', AuctionViewSet)
router.register(r'bids', BidViewSet)

# Include the router URLs
urlpatterns = [
    path('', include(router.urls)),
]
