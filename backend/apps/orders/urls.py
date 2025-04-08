from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'orders'

router = DefaultRouter()
# Add other viewset registrations here if needed

urlpatterns = [
    path('', include(router.urls)),
    path('auctions/<int:auction_id>/trucks/', views.AuctionTrucksView.as_view(), name='auction-trucks'),
    path('seller/trucks/', views.SellerTrucksView.as_view(), name='seller-trucks'),
] 