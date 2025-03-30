from django.db import models
from apps.accounts.models import Organization


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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"
