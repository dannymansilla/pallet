from rest_framework import serializers
from .models import (
    SaleEvent, Listing, Document, Bid, BidAuditLog,
    OptimizationRun, OptimizedLoad, TruckLoadItem, SellerBuyerNetwork, BuyerProfile
)
from datetime import datetime, timedelta

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

class SellerListingSerializer(serializers.ModelSerializer):
    # Fields from the frontend ListingPage.js
    month_year = serializers.SerializerMethodField()
    brand = serializers.CharField(source='product.brand', read_only=True)
    short_description = serializers.CharField(source='product.name', read_only=True)
    msrp_per_unit = serializers.DecimalField(source='product.msrp', max_digits=10, decimal_places=2, read_only=True)
    min_selling_price_per_unit = serializers.DecimalField(source='reserve_price', max_digits=10, decimal_places=2)
    total_volume_for_sale = serializers.IntegerField(source='quantity_available')
    volume_above_msp_percent = serializers.FloatField(read_only=True)
    weighted_average_bid_price_per_unit = serializers.FloatField(read_only=True)
    recovery_rate_percent = serializers.FloatField(read_only=True)
    is_current_month = serializers.BooleanField(read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'month_year', 'brand', 'short_description',
            'msrp_per_unit', 'min_selling_price_per_unit', 'total_volume_for_sale',
            'volume_above_msp_percent', 'weighted_average_bid_price_per_unit', 
            'recovery_rate_percent', 'is_current_month'
        ]

    def get_month_year(self, obj):
        if obj.sale_event and obj.sale_event.start_date:
            return obj.sale_event.start_date.strftime("%Y-%m")
        return None

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
    buyer_name = serializers.CharField(source='buyer.organization.name', read_only=True)
    buyer_email = serializers.CharField(source='buyer.organization.email', read_only=True)
    seller_name = serializers.CharField(source='seller.organization.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = SellerBuyerNetwork
        fields = [
            'id', 'seller', 'seller_name', 'buyer', 'buyer_name', 'buyer_email', 
            'status', 'status_display', 'invited_by', 'requested_by', 
            'created_at', 'created_at_formatted', 'updated_at'
        ]
    
    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M:%S")

class AuctionTruckSerializer(serializers.Serializer):
    auction_summary = serializers.SerializerMethodField()
    months = serializers.SerializerMethodField()

    def get_auction_summary(self, obj):
        return {
            'auction_name': obj.name,
            'auction_closed': obj.end_date.strftime('%Y-%m-%d'),
            'total_trucks': obj.optimized_loads.count(),
            'total_buyers_awarded': obj.optimized_loads.values('buyer').distinct().count(),
            'total_auction_revenue': sum(load.load_value or 0 for load in obj.optimized_loads.all())
        }

    def get_months(self, obj):
        # Group optimized loads by month
        loads_by_month = {}
        for load in obj.optimized_loads.all():
            month_key = load.created_at.strftime('%Y-%m')
            if month_key not in loads_by_month:
                loads_by_month[month_key] = []
            
            loads_by_month[month_key].append({
                'buyer': load.buyer.organization.name,
                'orderId': f"ORD-{load.id}",
                'numTrucks': 1,  # Each load represents one truck
                'totalValue': float(load.load_value or 0),
                'paymentDue': (load.created_at + timedelta(days=30)).strftime('%Y-%m-%d'),
                'isPaid': load.truckload_status == 'delivered',
                'items': [{
                    'sku': item.listing.product.sku,
                    'name': item.listing.product.name,
                    'quantity': item.allocated_quantity,
                    'price': float(item.listing.reserve_price or 0)
                } for item in load.items.all()]
            })
        
        # Convert to list of months
        return [
            {
                'month': month,
                'orders': orders
            }
            for month, orders in loads_by_month.items()
        ]

class BuyerDashboardListingSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_description = serializers.CharField(source='product.description', read_only=True)
    product_brand = serializers.CharField(source='product.brand', read_only=True)
    seller_name = serializers.CharField(source='seller.organization.name', read_only=True)
    seller_id = serializers.IntegerField(source='seller.id', read_only=True)
    end_date = serializers.DateTimeField(source='sale_event.end_date', read_only=True)
    is_in_network = serializers.SerializerMethodField()
    network_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Listing
        fields = [
            'id', 'product_name', 'product_description', 'product_brand',
            'seller_name', 'seller_id', 'end_date', 'quantity_available',
            'reserve_price', 'listing_status', 'is_in_network', 'network_status'
        ]
    
    def get_is_in_network(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Get the buyer profile associated with the request.user
        try:
            buyer_profile = BuyerProfile.objects.get(organization=request.user.organization)
        except BuyerProfile.DoesNotExist:
            return False
        
        # Check if there's an active SellerBuyerNetwork record
        return SellerBuyerNetwork.objects.filter(
            seller=obj.seller,
            buyer=buyer_profile,
            status='active'
        ).exists()
    
    def get_network_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'not_in_network'
        
        # Get the buyer profile associated with the request.user
        try:
            buyer_profile = BuyerProfile.objects.get(organization=request.user.organization)
        except BuyerProfile.DoesNotExist:
            return 'not_in_network'
        
        # Check the network status
        try:
            network = SellerBuyerNetwork.objects.get(seller=obj.seller, buyer=buyer_profile)
            return network.status
        except SellerBuyerNetwork.DoesNotExist:
            return 'not_in_network' 