from django.db import models
from django.conf import settings 
from django.contrib.auth.models import AbstractUser
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# User and Company Models
class Company(models.Model):
    name = models.CharField(max_length=255)
    legal_entity_info = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    terms_accepted = models.DateTimeField(blank=True, null=True)
    ROLES = [
        ("buyer", "Buyer"),
        ("seller", "Seller"),
        ("both", "Both"),
    ]
    roles = models.CharField(max_length=10, choices=ROLES, default="buyer")

    def __str__(self):
        return self.name

class User(AbstractUser):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="users", blank=True, null=True)
    is_admin = models.BooleanField(default=False)  # Indicates if the user is a company admin

    def __str__(self):
        return f"{self.username} ({'Admin' if self.is_admin else 'User'})"


# Product Model
class Product(models.Model):
    name = models.CharField(max_length=255)
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

    def __str__(self):
        return self.name

# Listing Model
class Listing(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="listings")
    auction_start_date = models.DateTimeField()
    auction_end_date = models.DateTimeField()
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

    def __str__(self):
        return f"Listing for {self.product.name}"

# Auction and Bid Models
class Auction(models.Model):
    name = models.CharField(max_length=255)
    listings = models.ManyToManyField(Listing, related_name="auctions")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[("open", "Open"), ("closed", "Closed"), ("pending", "Pending Approval")])
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="auctions",
    )

    def __str__(self):
        return self.name

class Bid(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="bids")
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
