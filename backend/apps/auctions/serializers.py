from rest_framework import serializers
from .models import (
    SaleEvent, Listing, Document, Bid, BidAuditLog,
    OptimizationRun, OptimizedLoad, TruckLoadItem, SellerBuyerNetwork
)

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'file_type', 'file', 'uploaded_at']

class ListingSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_listing_status_display', read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'product', 'seller', 'warehouse', 'sale_event',
            'quantity_available', 'reserve_price', 'listing_status',
            'status_display', 'documents'
        ]

class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = [
            'id', 'listing', 'sale_event', 'buyer', 'bid_price',
            'bid_quantity', 'status', 'timestamp'
        ]

class BidAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BidAuditLog
        fields = [
            'id', 'bid', 'old_value', 'new_value',
            'changed_by', 'changed_at'
        ]

class SaleEventSerializer(serializers.ModelSerializer):
    listings = ListingSerializer(many=True, read_only=True)
    
    class Meta:
        model = SaleEvent
        fields = [
            'id', 'name', 'description', 'status',
            'start_date', 'end_date', 'listings'
        ]

class TruckLoadItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TruckLoadItem
        fields = [
            'id', 'optimized_load', 'listing', 'allocated_quantity'
        ]

class OptimizedLoadSerializer(serializers.ModelSerializer):
    items = TruckLoadItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = OptimizedLoad
        fields = [
            'id', 'buyer', 'sale_event', 'optimization_run',
            'truckload_status', 'total_weight', 'total_volume',
            'load_value', 'items'
        ]

class OptimizationRunSerializer(serializers.ModelSerializer):
    optimized_loads = OptimizedLoadSerializer(many=True, read_only=True)
    
    class Meta:
        model = OptimizationRun
        fields = [
            'id', 'sale_event', 'status', 'start_time',
            'end_time', 'notes', 'optimized_loads'
        ]

class SellerBuyerNetworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerBuyerNetwork
        fields = [
            'id', 'seller', 'buyer', 'status',
            'invited_by', 'requested_by', 'created_at',
            'updated_at'
        ] 