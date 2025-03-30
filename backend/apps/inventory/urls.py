from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'inventory'

router = DefaultRouter()
router.register(r'products', views.ProductViewSet)
router.register(r'sellers', views.SellerProfileViewSet)
router.register(r'buyers', views.BuyerProfileViewSet)
router.register(r'warehouses', views.WarehouseViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 