from rest_framework import serializers
from .models import Company, Product, Listing, Auction, Bid
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'company', 'first_name', 'last_name']
        read_only_fields = ['id']

    def create(self, validated_data):
        # Ensure password is properly hashed
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        # Handle password updates securely
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def set_admin(self, company_id):
        """
        Assign the user as an admin for the specified company.
        """
        # Validate the company exists
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            raise serializers.ValidationError("Company does not exist.")

        # Check the user's current role and update
        self.instance.role = 'admin'
        self.instance.company = company
        self.instance.save()
        return self.instance


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['terms_accepted']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ListingSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )  # Allow setting product by ID

    class Meta:
        model = Listing
        fields = [
            "id",
            "product",
            "product_id",  # For writing
            "auction_start_date",
            "auction_end_date",
            "quantity_available",
            "minimum_selling_price",
            "warehouse_location",
            "shipping_instructions",
            "is_active",
            "created_by",
        ]
        read_only_fields = ["id", "created_by", "product"]  # 'created_by' and 'product' are read-only

class AuctionSerializer(serializers.ModelSerializer):
    listings = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Listing.objects.all()
    )  # Allow setting listings by ID

    class Meta:
        model = Auction
        fields = [
            "id",
            "name",
            "listings",
            "start_date",
            "end_date",
            "status",
            "created_by",
        ]
        read_only_fields = ["id", "created_by"]  # Exclude 'created_by' from user input

class BidSerializer(serializers.ModelSerializer):
    listing_id = serializers.PrimaryKeyRelatedField(
        queryset=Listing.objects.all(), source="listing", write_only=True
    )  # Allow setting listing by ID
    auction_id = serializers.PrimaryKeyRelatedField(
        queryset=Auction.objects.all(), source="auction", write_only=True
    )  # Allow setting auction by ID

    class Meta:
        model = Bid
        fields = [
            "id",
            "auction_id",
            "listing_id",
            "price_per_unit",
            "quantity",
            "timestamp",
            "is_winning_bid",
            "buyer",  # Included in read-only for clarity but not writable
        ]
        read_only_fields = ["id", "timestamp", "is_winning_bid", "buyer"]
