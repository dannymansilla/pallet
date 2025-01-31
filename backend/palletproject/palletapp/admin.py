from django.contrib import admin
from .models import AuctionCycle, Company, User, Listing, Bid


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'contact_email', 'status', 'roles')
    search_fields = ('name', 'contact_email')
    list_filter = ('status', 'roles')


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'is_admin', 'company')
    search_fields = ('username', 'email', 'company__name')
    list_filter = ('is_admin', 'company')


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'product', 
        'quantity_available', 
        'minimum_selling_price', 
        'warehouse_location', 
        'is_active', 
        'created_by',
        'auction_cycle'  # Display associated auction cycle
    )
    search_fields = ('product__name', 'warehouse_location', 'created_by__username')
    list_filter = ('is_active', 'auction_cycle')  # Filter by auction cycle



@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'buyer', 'price_per_unit', 
                    'quantity', 'timestamp', 'is_winning_bid')
    search_fields = ('listing__product__name', 'buyer__name', 'auction__id')
    list_filter = ('timestamp', 'is_winning_bid')

@admin.register(AuctionCycle)
class AuctionCycleAdmin(admin.ModelAdmin):
    list_display = ("id", "start_date", "end_date", "status")
    list_filter = ("status", "start_date", "end_date")
