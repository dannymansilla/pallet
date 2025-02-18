from rest_framework import serializers
from .models import AuctionCycle, Company, PendingInvite, Product, Listing, Bid
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils.timezone import now


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
        fields = ['id', 'username', 'email', 'is_admin', 'company', 'first_name', 'last_name']
        read_only_fields = ['id']

    def create(self, validated_data):
        """
        Create a new user, ensuring the password is hashed correctly
        and assigning the user to a company if provided.
        """
        password = validated_data.pop('password', None)
        company = validated_data.pop('company', None)  # Ensure company association
        user = User(**validated_data)
        if password:
            user.set_password(password)
        if company:
            user.company = company
        user.save()
        return user

    def update(self, instance, validated_data):
        """
        Update an existing user securely, ensuring password updates
        are handled appropriately.
        """
        password = validated_data.pop('password', None)
        company = validated_data.pop('company', None)  # Allow updating company association
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
        if company:
            instance.company = company
        instance.save()
        return instance

    def set_admin(self, company_id):
        """
        Assign the user as an admin for the specified company.
        """
        # Validate that the company exists
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            raise serializers.ValidationError("Company does not exist.")

        # Assign admin status and associate with the company
        self.instance.is_admin = True
        self.instance.company = company
        self.instance.save()
        return self.instance
    
class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["address", "contact_email", "contact_phone"]

class PendingInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PendingInvite
        fields = ["company_name", "contact_email", "status", "invited_on"]

    
class CompanyRegistrationSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True)
    roles = serializers.ChoiceField(choices=Company.ROLES)
    terms_accepted = serializers.BooleanField()

    # Optional fields
    address = serializers.CharField(max_length=500, required=False, allow_blank=True)
    contact_email = serializers.EmailField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the terms of service to register.")
        return value

    def create(self, validated_data):
        # Determine the datetime for terms_accepted
        terms_accepted_datetime = now() if validated_data["terms_accepted"] else None

        # Create company and admin user
        company = Company.objects.create(
            name=validated_data["company_name"],
            roles=validated_data["roles"],
            terms_accepted=terms_accepted_datetime,
            terms_accepted_boolean=validated_data["terms_accepted"],  # Save boolean value
        )
        admin_user = User.objects.create_user(
            username=validated_data["admin_email"],  # Use email as username
            email=validated_data["admin_email"],
            password=validated_data["admin_password"],
            company=company,
            is_admin=True,
        )
        return {"company": company, "admin_user": admin_user}


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        if user.is_superuser:
            company_data = None  # Superusers do not need a company
        else:
            if not hasattr(user, "company") or user.company is None:
                raise serializers.ValidationError("User must be associated with an approved company.")
            company_data = {
                "status": user.company.status,
                "roles": user.company.roles,
                "name": user.company.name  # ✅ Add the company name here
            }

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['is_superuser'] = user.is_superuser
        token["company"] = company_data 

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # If user is a superuser, do not require a company
        if self.user.is_superuser:
            company_data = None
        else:
            if not hasattr(self.user, "company") or self.user.company is None:
                raise serializers.ValidationError("User must be associated with an approved company.")
            company_data = {
                "status": self.user.company.status,
                "roles": self.user.company.roles,
                "name": self.user.company.name  # ✅ Fix: Include company name in the response data
            }

        # Attach user details to the response
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "is_superuser": self.user.is_superuser,
            "company": company_data
        }
        return data

    
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email"]  # Only valid fields

class CompanySerializer(serializers.ModelSerializer):
    admin_user = serializers.SerializerMethodField()  # Use SerializerMethodField for flexibility
    network = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Company.objects.all(), required=False
    )

    class Meta:
        model = Company
        fields = "__all__"
        read_only_fields = ["terms_accepted"]

    def get_admin_user(self, instance):
        """Safely fetch the first user associated with the company"""
        admin = instance.users.first()  # Call .first() properly
        return AdminUserSerializer(admin).data if admin else None

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {"company": {"read_only": True}}

class BulkProductSerializer(serializers.ListSerializer):
    """Allows bulk uploading multiple products in a single API call"""
    child = ProductSerializer()

class ListingSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )
    auction_cycle_id = serializers.PrimaryKeyRelatedField(
        queryset=AuctionCycle.objects.all(), source="auction_cycle", write_only=True, required=False
    )
    auction_cycle = serializers.SerializerMethodField()  # Use SerializerMethodField

    class Meta:
        model = Listing
        fields = [
            "id",
            "product",
            "product_id",
            "auction_cycle_id",  # Add this for write operations
            "quantity_available",
            "minimum_selling_price",
            "warehouse_location",
            "shipping_instructions",
            "is_active",
            "created_by",
            "auction_cycle",  # Keep this for read operations
        ]
        read_only_fields = ["id", "created_by", "product", "auction_cycle"]

    def get_auction_cycle(self, obj):
        # Ensure obj is a model instance
        if isinstance(obj, dict):
            return None
        if obj.auction_cycle:
            return {
                "id": obj.auction_cycle.id,
                "start_date": obj.auction_cycle.start_date,
                "end_date": obj.auction_cycle.end_date,
                "status": obj.auction_cycle.status,
            }
        return None

    def validate(self, data):
        """Validates the listing data."""
        if data["quantity_available"] <= 0:
            raise serializers.ValidationError(
                {"quantity_available": "Quantity must be greater than 0."}
            )
        return data



class AuctionCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionCycle
        fields = "__all__"

class BidSerializer(serializers.ModelSerializer):
    listing = serializers.SerializerMethodField()
    listing_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Bid
        fields = [
            "id",
            "price_per_unit",
            "listing_id",
            "quantity",
            "timestamp",
            "is_winning_bid",
            "buyer",
            "listing",
        ]
        read_only_fields = ["buyer"]

    def get_listing(self, obj):
        """Return structured listing details including auction status and highest bid."""
        listing = obj.listing
        return {
            "id": listing.id,
            "product_name": listing.product.name,
            "auction_end_date": listing.auction_cycle.end_date,
            "auction_status": listing.auction_cycle.status,
            "current_highest_bid": listing.bids.order_by("-price_per_unit").first().price_per_unit if listing.bids.exists() else None,
            "quantity_available": listing.quantity_available,
        }

    def validate(self, data):
        """Validate bid input including auction status and buyer authorization."""
        listing = Listing.objects.filter(id=data["listing_id"]).first()
        buyer = self.context["request"].user.company

        if listing.auction_cycle.status != "open":
            raise serializers.ValidationError("You can only bid on listings in active auction cycles.")

        seller = listing.created_by.company
        if buyer not in seller.network.all():
            raise serializers.ValidationError("You are not authorized to bid on this listing.")

        if data["quantity"] > listing.quantity_available:
            raise serializers.ValidationError("Bid quantity exceeds available quantity.")

        data["listing"] = listing
        return data

