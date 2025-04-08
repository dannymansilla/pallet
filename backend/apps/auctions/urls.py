from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SaleEventViewSet, ListingViewSet, BidViewSet, DocumentViewSet,
    OptimizationRunViewSet, OptimizedLoadViewSet,
    TruckLoadItemViewSet, SellerBuyerNetworkViewSet,
    get_seller_metrics, ActiveListingsView, QueuedListingsView,
    ActiveAuctionsView, CurrentBidsView, AuctionPerformanceView,
    monthly_stats, get_seller_dashboard_tables, SellerListingsView,
    SellerNetworkView, BuyerSearchView, BulkUploadBuyersView,
    AuctionTruckView, BuyerDashboardView, RequestNetworkJoinView
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
    path('seller/listings/', SellerListingsView.as_view(), name='seller-listings'),
    path('seller/network/', SellerNetworkView.as_view(), name='seller-network'),
    path('seller/network/<int:relationship_id>/', SellerNetworkView.as_view(), name='seller-network-detail'),
    path('buyers/search/', BuyerSearchView.as_view(), name='buyer-search'),
    path('buyers/bulk-upload/', BulkUploadBuyersView.as_view(), name='buyers-bulk-upload'),
    path('auctions/<int:auction_id>/trucks/', AuctionTruckView.as_view(), name='auction-trucks'),
    path('buyer/dashboard/', BuyerDashboardView.as_view(), name='buyer-dashboard'),
    path('buyer/request-network-join/', RequestNetworkJoinView.as_view(), name='request-network-join'),
] 