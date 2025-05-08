from rest_framework import serializers
from .models import Order, OrderLineItem

class OrderLineItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='listing.product.name')
    product_brand = serializers.CharField(source='listing.product.brand')
    
    class Meta:
        model = OrderLineItem
        fields = [
            'id', 'product_name', 'product_brand',
            'quantity', 'price', 'total_price'
        ]

class OrderSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.organization.name')
    line_items = OrderLineItemSerializer(many=True, read_only=True)
    order_date_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_date', 'order_date_formatted',
            'order_status', 'total_price', 'invoice_number',
            'buyer_name', 'line_items'
        ]
    
    def get_order_date_formatted(self, obj):
        return obj.order_date.strftime("%Y-%m-%d %H:%M:%S") 