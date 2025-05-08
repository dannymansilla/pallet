from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, SellerProfile, BuyerProfile, Warehouse
from .serializers import ProductSerializer, SellerProfileSerializer, BuyerProfileSerializer, WarehouseSerializer

# Create your views here.

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter products based on user's role and organization"""
        user = self.request.user
        if user.role == 'seller':
            # Sellers see their own products
            return Product.objects.filter(listing__seller__organization=user.organization).distinct()
        elif user.role == 'buyer':
            # Buyers see products available in active listings
            return Product.objects.filter(listing__listing_status='active').distinct()
        # Admins see all products
        return Product.objects.all()

class SellerProfileViewSet(viewsets.ModelViewSet):
    queryset = SellerProfile.objects.all()
    serializer_class = SellerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            return SellerProfile.objects.filter(organization=user.organization)
        return SellerProfile.objects.all()

class BuyerProfileViewSet(viewsets.ModelViewSet):
    queryset = BuyerProfile.objects.all()
    serializer_class = BuyerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'buyer':
            return BuyerProfile.objects.filter(organization=user.organization)
        return BuyerProfile.objects.all()

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            # Sellers can see and manage their own warehouses
            return Warehouse.objects.filter(seller__organization=user.organization)
        elif user.role == 'buyer':
            # Buyers can only view warehouses that have active listings
            return Warehouse.objects.filter(listing__listing_status='active').distinct()
        # Admins can see all warehouses
        return Warehouse.objects.all()

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            # Only sellers can modify their own warehouses
            return [permissions.IsAuthenticated()]
        # Anyone can view warehouse details
        return [permissions.IsAuthenticated()]
