from django.db import models
from apps.auctions.models import OptimizedLoad, Listing
from apps.inventory.models import SellerProfile, BuyerProfile


class Order(models.Model):
    optimized_load = models.ForeignKey(OptimizedLoad, on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)

    ORDER_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('canceled', 'Canceled'),
        ('completed', 'Completed'),
    ]
    order_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='draft')

    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    invoice_number = models.CharField(max_length=50, blank=True, null=True)

    buyer = models.ForeignKey(BuyerProfile, on_delete=models.CASCADE)
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE)

    def __str__(self):
        return f"Order {self.id} ({self.order_status})"


class OrderLineItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='line_items')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"OrderLineItem for order {self.order_id}, listing {self.listing_id}"


class Shipment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='shipments')
    carrier = models.CharField(max_length=255, blank=True, null=True)
    tracking_number = models.CharField(max_length=255, blank=True, null=True)

    estimated_delivery_date = models.DateField(blank=True, null=True)
    actual_delivery_date = models.DateField(blank=True, null=True)

    SHIPMENT_STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
    ]
    shipment_status = models.CharField(max_length=20, choices=SHIPMENT_STATUS_CHOICES, default='scheduled')

    def __str__(self):
        return f"Shipment {self.id} for order {self.order_id}"


class Invoice(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')

    due_date = models.DateField(blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    INVOICE_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]
    status = models.CharField(max_length=20, choices=INVOICE_STATUS_CHOICES, default='draft')

    def __str__(self):
        return f"Invoice {self.invoice_number} (Order {self.order_id})"


class PaymentRecord(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    payment_date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Payment of {self.amount} on Invoice {self.invoice.invoice_number}"
