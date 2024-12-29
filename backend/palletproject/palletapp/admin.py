from django.contrib import admin
from .models import Company, User, Listing, Bid

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'contact_email', 'is_approved')
    search_fields = ('name', 'contact_email')
    list_filter = ('is_approved',)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'role', 'company')
    search_fields = ('username', 'email', 'company__name')
    list_filter = ('role', 'company')


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'auction_start_date', 'auction_end_date', 'quantity_available', 'minimum_selling_price', 'warehouse_location', 'is_active')
    search_fields = ('product__name', 'warehouse_location')
    list_filter = ('is_active', 'auction_start_date', 'auction_end_date')


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('id', 'auction', 'listing', 'buyer', 'price_per_unit', 'quantity', 'timestamp', 'is_winning_bid')
    search_fields = ('listing__product__name', 'buyer__name')
    list_filter = ('timestamp', 'auction', 'is_winning_bid')
