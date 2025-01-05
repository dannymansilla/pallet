from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, UserViewSet, ProductViewSet, ListingViewSet, AuctionViewSet, BidViewSet, ProfileView, ActiveAuctionsView, CurrentBidsView, ActiveListingsView, AuctionPerformanceView

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
    path("auctions/active/", ActiveAuctionsView.as_view(), name="active_auctions"),
    path("auctions/performance/", AuctionPerformanceView.as_view(), name="auction_performance"),
    path('', include(router.urls)),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("listings/active/", ActiveListingsView.as_view(), name="active_listings"),
    path("bids/current/", CurrentBidsView.as_view(), name="current_bids"),
]
