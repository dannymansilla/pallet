# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

########################################
# 1. User & Organization Management
########################################

class Organization(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)

    is_seller = models.BooleanField(default=False)
    is_buyer = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class User(AbstractUser):
    ROLE_CHOICES = [
        ('seller', 'Seller'),
        ('buyer', 'Buyer'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='buyer')
    
    # Link to organization; null if user not yet associated
    organization = models.ForeignKey(
        Organization,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='users'
    )
    
    # Terms of Service acceptance
    tos_accepted = models.BooleanField(default=False)
    tos_accepted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class SellerProfile(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE)
    seller_since = models.DateField(blank=True, null=True)
    default_warehouse = models.ForeignKey(
        'Warehouse',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    def __str__(self):
        return f"SellerProfile for {self.organization.name}"


class BuyerProfile(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE)
    buyer_since = models.DateField(blank=True, null=True)
    credit_terms = models.CharField(max_length=100, blank=True, null=True)
    preferred_shipping_locations = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"BuyerProfile for {self.organization.name}"


class Warehouse(models.Model):
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name='warehouses')
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    capacity = models.PositiveIntegerField(blank=True, null=True)
    erp_reference_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.seller.organization.name}"


class BuyerOnboardingRequest(models.Model):
    email = models.EmailField()
    organization_name = models.CharField(max_length=255)
    requested_date = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.organization_name} ({self.email}) - {self.status}"


########################################
# 2. Product & Listing Management
########################################

class Product(models.Model):
    sku = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # Dimensions & weight
    length = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    width = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    height = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Packaging
    units_per_case = models.PositiveIntegerField(blank=True, null=True)
    cases_per_pallet = models.PositiveIntegerField(blank=True, null=True)

    # If products are org-specific, you could uncomment:
    # organization = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"


class SaleEvent(models.Model):
    name = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=50, default='upcoming')  # 'upcoming', 'open', 'closed'
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.status})"


class Listing(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE)
    warehouse = models.ForeignKey(Warehouse, null=True, blank=True, on_delete=models.SET_NULL)
    sale_event = models.ForeignKey(SaleEvent, on_delete=models.CASCADE)

    quantity_available = models.PositiveIntegerField()
    reserve_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    listing_status = models.CharField(max_length=50, default='active')  # e.g. 'active', 'sold_out'

    def __str__(self):
        return f"Listing {self.id} - {self.product.name} (Seller: {self.seller.organization.name})"


class Document(models.Model):
    file_type = models.CharField(max_length=50)
    file = models.FileField(upload_to='documents/')  # or use ImageField for images
    listing = models.ForeignKey(Listing, null=True, blank=True, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document ({self.file_type}) for listing {self.listing_id}"


########################################
# 3. Auctions & Bidding
########################################

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


########################################
# 4. Truck-Building & Optimization
########################################

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


########################################
# 5. Transaction & Logistics
########################################

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


########################################
# 6. Integration & Automation
########################################

class ERPIntegration(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='integrations')
    erp_type = models.CharField(max_length=100)
    auth_credentials = models.TextField(blank=True, null=True)
    last_sync = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.erp_type} integration for {self.organization.name}"


class IntegrationLog(models.Model):
    erp_integration = models.ForeignKey(ERPIntegration, on_delete=models.CASCADE, related_name='logs')
    operation_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failure', 'Failure'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    response_message = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.operation_type} on {self.erp_integration.erp_type} ({self.status})"


########################################
# 7. Notifications & Auditing
########################################

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    NOTIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('read', 'Read'),
    ]
    delivery_status = models.CharField(max_length=20, choices=NOTIFICATION_STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Notification {self.id} to {self.recipient.username}"


class ActivityLog(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=50)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.action_type} by {self.actor} at {self.timestamp}"


class Settings(models.Model):
    name = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True, null=True)
    # Alternatively, use JSONField (Django 3.1+):
    # from django.db.models import JSONField
    # value = JSONField(blank=True, null=True)

    def __str__(self):
        return f"Setting {self.name} = {self.value}"


########################################
# 8. Buyer–Seller Network
########################################

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
