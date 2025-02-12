from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, QueuedListingsView, AuctionCycleViewSet, UserViewSet, ProductViewSet, ListingViewSet, BidViewSet, ProfileView, ActiveAuctionsView, CurrentBidsView, ActiveListingsView, AuctionPerformanceView

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet) 
router.register(r'companies', CompanyViewSet)
router.register(r'products', ProductViewSet)
router.register(r'listings', ListingViewSet)
router.register(r'bids', BidViewSet)
router.register(r"auction-cycles", AuctionCycleViewSet, basename="auction-cycles")

# Include the router URLs
urlpatterns = [
    path("listings/active/", ActiveListingsView.as_view(), name="active_listings"),
    path("listings/queued/", QueuedListingsView.as_view(), name="queued-listings"),
    path("auction/performance/", AuctionPerformanceView.as_view(), name="auction_performance"),
    path("auction/active/", ActiveAuctionsView.as_view(), name="active_auctions"),
    
    path("bids/current/", CurrentBidsView.as_view(), name="current_bids"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path('', include(router.urls)),
]
