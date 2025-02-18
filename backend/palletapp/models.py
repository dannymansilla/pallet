from datetime import timezone
from django.db import models
from django.conf import settings 
from django.contrib.auth.models import AbstractUser
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.timezone import now

# User and Company Models
class Company(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    name = models.CharField(max_length=255)
    legal_entity_info = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    terms_accepted = models.DateTimeField(blank=True, null=True)  # Preserve the old field
    terms_accepted_boolean = models.BooleanField(default=False) 
    network = models.ManyToManyField(
        "self", symmetrical=False, related_name="approved_network", blank=True
    )
    ROLES = [
        ("buyer", "Buyer"),
        ("seller", "Seller"),
        ("both", "Both"),
    ]
    roles = models.CharField(max_length=10, choices=ROLES, default="buyer")

    def __str__(self):
        return self.name

class User(AbstractUser):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="users", blank=True, null=True
    )
    is_admin = models.BooleanField(default=False)  # Company admin
    is_superuser = models.BooleanField(default=False)  # Platform admin/superuser

    def __str__(self):
        role = "Superuser" if self.is_superuser else "Admin" if self.is_admin else "User"
        return f"{self.username} ({role})"


# Product Model
class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    brand = models.CharField(max_length=255)
    gtin = models.CharField(max_length=14, unique=True)
    length = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()
    weight = models.FloatField()
    units_per_case = models.PositiveIntegerField()
    cases_per_pallet = models.PositiveIntegerField()
    certifications = models.JSONField(blank=True, null=True)
    expiration_date = models.DateField(blank=True, null=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    image = models.ImageField(
        upload_to="product_images/", 
        blank=True, 
        null=True, 
        default="product_images/default.png"  # 👈 Set default image
    )

    def __str__(self):
        return self.name
    

class NetworkRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    buyer_company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="network_requests")
    seller_company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="incoming_requests")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.buyer_company.name} -> {self.seller_company.name} ({self.status})"
    
class PendingInvite(models.Model):
    seller = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="sent_invites")
    company_name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    status = models.CharField(max_length=10, choices=[("pending", "Pending"), ("accepted", "Accepted")], default="pending")
    invited_on = models.DateTimeField(default=now)

    def __str__(self):
        return f"Invite to {self.company_name} ({self.contact_email})"
    
class AuctionCycle(models.Model):
    start_date = models.DateField()  # Start of the month
    end_date = models.DateField()  # End of the month
    listing_end_date = models.DateField()  # End of listing period (5th business day)
    open_start_date = models.DateField()  # Start of open period (e.g., 2nd Monday)
    open_end_date = models.DateField()  # End of open period
    closing_end_date = models.DateField()  # End of closing period (last 5 business days)
    status = models.CharField(
        max_length=20,
        choices=[
            ("listing", "Listing Period"),
            ("open", "Open Period"),
            ("closing", "Closing Period"),
            ("closed", "Closed"),
        ],
        default="listing",
    )

    def update_status(self):
        today = timezone.now().date()
        if today <= self.listing_end_date:
            self.status = "listing"
        elif self.open_start_date <= today <= self.open_end_date:
            self.status = "open"
        elif self.open_end_date < today <= self.closing_end_date:
            self.status = "closing"
        else:
            self.status = "closed"
        self.save()

    def __str__(self):
        return f"Auction Cycle {self.start_date} to {self.end_date}"

# Listing Model
class Listing(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="listings")
    category = models.CharField(max_length=100, blank=True)
    quantity_available = models.PositiveIntegerField()
    minimum_selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    warehouse_location = models.TextField()
    shipping_instructions = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="listings",
    )
    auction_cycle = models.ForeignKey(
        AuctionCycle, on_delete=models.CASCADE, related_name="listings", null=True, blank=True
    )

    def __str__(self):
        return f"Listing for {self.product.name}"



class Bid(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bids")
    buyer = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="bids")
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_winning_bid = models.BooleanField(default=False)

    def __str__(self):
        return f"Bid by {self.buyer.name} on {self.listing}"

# Truckload Optimization and Logistics Models
class Truckload(models.Model):
    buyer = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="truckloads")
    listings = models.ManyToManyField(Listing, related_name="truckloads")
    total_weight = models.FloatField()
    total_volume = models.FloatField()
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    shipping_details = models.TextField()
    status = models.CharField(max_length=20, choices=[("pending", "Pending Approval"), ("approved", "Approved"), ("shipped", "Shipped")])

    def __str__(self):
        return f"Truckload for {self.buyer.name}"

# Notifications and Workflow Models
class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=[("email", "Email"), ("alert", "Platform Alert"), ("sms", "SMS")])
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification to {self.recipient.username}"

class ApprovalWorkflow(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    item = GenericForeignKey("content_type", "object_id")
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="approvals")
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")])
    notes = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

# Billing and Invoicing Models
class Invoice(models.Model):
    seller = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="invoices")
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=[("paid", "Paid"), ("unpaid", "Unpaid")])
    invoice_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()

    def __str__(self):
        return f"Invoice for {self.seller.name}"
