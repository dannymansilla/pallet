from django.db import models
from apps.inventory.models import Product, SellerProfile, BuyerProfile, Warehouse
from apps.accounts.models import User


class SaleEvent(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]

    name = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='upcoming'
    )
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.status})"


class Listing(models.Model):
    LISTING_STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('queued', 'Queued'),
        ('sold_out', 'Sold Out'),
        ('cancelled', 'Cancelled'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE)
    warehouse = models.ForeignKey(Warehouse, null=True, blank=True, on_delete=models.SET_NULL)
    sale_event = models.ForeignKey(SaleEvent, on_delete=models.CASCADE)

    quantity_available = models.PositiveIntegerField()
    reserve_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    listing_status = models.CharField(
        max_length=20,
        choices=LISTING_STATUS_CHOICES,
        default='active'
    )

    def __str__(self):
        return f"Listing {self.id} - {self.product.name} (Seller: {self.seller.organization.name})"


class Document(models.Model):
    file_type = models.CharField(max_length=50)
    file = models.FileField(upload_to='documents/')  # or use ImageField
    listing = models.ForeignKey(
        Listing,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document ({self.file_type}) for listing {self.listing_id}"


class Bid(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    buyer = models.ForeignKey(BuyerProfile, on_delete=models.CASCADE)
    sale_event = models.ForeignKey(SaleEvent, on_delete=models.CASCADE)

    bid_price = models.DecimalField(max_digits=10, decimal_places=2)
    bid_quantity = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    BID_STATUS_CHOICES = [
        ('active', 'Active'),
        ('withdrawn', 'Withdrawn'),
        ('accepted', 'Accepted'),
        ('partially_filled', 'Partially Filled'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=BID_STATUS_CHOICES, default='active')

    def __str__(self):
        return f"Bid #{self.id} by {self.buyer.organization.name} on {self.listing.product.name}"


class BidAuditLog(models.Model):
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name='audit_logs')
    old_value = models.TextField()
    new_value = models.TextField()
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"BidAuditLog {self.id} for Bid {self.bid_id}"


class OptimizationRun(models.Model):
    sale_event = models.ForeignKey(SaleEvent, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='running')  # e.g. 'running', 'completed', 'failed'
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"OptimizationRun {self.id} for {self.sale_event.name}"


class OptimizedLoad(models.Model):
    buyer = models.ForeignKey(BuyerProfile, on_delete=models.CASCADE)
    sale_event = models.ForeignKey(SaleEvent, on_delete=models.CASCADE)
    optimization_run = models.ForeignKey(OptimizationRun, null=True, blank=True, on_delete=models.SET_NULL)

    LOAD_STATUS_CHOICES = [
        ('proposed', 'Proposed'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
    ]
    truckload_status = models.CharField(max_length=20, choices=LOAD_STATUS_CHOICES, default='proposed')

    total_weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_volume = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    load_value = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f"OptimizedLoad {self.id} for {self.buyer.organization.name}"


class TruckLoadItem(models.Model):
    optimized_load = models.ForeignKey(OptimizedLoad, on_delete=models.CASCADE, related_name='items')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    allocated_quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"TruckLoadItem for load {self.optimized_load_id}, listing {self.listing_id}"


class SellerBuyerNetwork(models.Model):
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='network_relationships')
    buyer = models.ForeignKey(BuyerProfile, on_delete=models.CASCADE, related_name='network_relationships')

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    invited_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='invitations_made')
    requested_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='requests_made')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('seller', 'buyer')

    def __str__(self):
        return f"Network: {self.seller.organization.name} <-> {self.buyer.organization.name} ({self.status})"
