from rest_framework import serializers
from .models import Product, SellerProfile, BuyerProfile, Warehouse

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'address', 'seller', 'capacity']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'brand', 'description', 
            'length', 'width', 'height', 'weight',
            'units_per_case', 'cases_per_pallet',
            'created_at', 'updated_at', 'msrp'
        ]

class SellerProfileSerializer(serializers.ModelSerializer):
    warehouses = WarehouseSerializer(many=True, read_only=True)
    
    class Meta:
        model = SellerProfile
        fields = [
            'id', 'organization', 'seller_since',
            'default_warehouse', 'warehouses'
        ]

class BuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = [
            'id', 'organization', 'buyer_since',
            'credit_terms', 'preferred_shipping_locations',
        ]