from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SaleEventViewSet, ListingViewSet, BidViewSet, DocumentViewSet,
    OptimizationRunViewSet, OptimizedLoadViewSet,
    TruckLoadItemViewSet, SellerBuyerNetworkViewSet,
    get_seller_metrics, ActiveListingsView, QueuedListingsView,
    ActiveAuctionsView, CurrentBidsView, AuctionPerformanceView,
    monthly_stats, get_seller_dashboard_tables
)

app_name = 'auctions'

router = DefaultRouter()
router.register(r'sale-events', SaleEventViewSet)
router.register(r'listings', ListingViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'bids', BidViewSet)
router.register(r'optimization-runs', OptimizationRunViewSet)
router.register(r'optimized-loads', OptimizedLoadViewSet)
router.register(r'truckload-items', TruckLoadItemViewSet)
router.register(r'seller-buyer-network', SellerBuyerNetworkViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('listings/active/', ActiveListingsView.as_view(), name='active-listings'),
    path('listings/queued/', QueuedListingsView.as_view(), name='queued-listings'),
    path('auctions/active/', ActiveAuctionsView.as_view(), name='active-auctions'),
    path('bids/current/', CurrentBidsView.as_view(), name='current-bids'),
    path('performance/', AuctionPerformanceView.as_view(), name='auction-performance'),
    path('seller/metrics/', get_seller_metrics, name='seller-metrics'),
    path('monthly-stats/', monthly_stats, name='monthly-stats'),
    path('dashboard-tables/', get_seller_dashboard_tables, name='dashboard-tables'),
] 