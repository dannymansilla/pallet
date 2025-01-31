from rest_framework import serializers
from .models import AuctionCycle, Company, Product, Listing, Bid
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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

    
class CompanyRegistrationSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255)
    address = serializers.CharField(max_length=500, required=False)
    contact_email = serializers.EmailField()
    contact_phone = serializers.CharField(max_length=20, required=False)

    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True)
    admin_username = serializers.CharField(max_length=150)
    roles = serializers.ChoiceField(choices=Company.ROLES)

    def create(self, validated_data):
        company = Company.objects.create(
            name=validated_data["company_name"],
            address=validated_data.get("address"),
            contact_email=validated_data["contact_email"],
            contact_phone=validated_data.get("contact_phone"),
            roles=validated_data["roles"],
        )

        admin_user = User.objects.create_user(
            username=validated_data["admin_username"],
            email=validated_data["admin_email"],
            password=validated_data["admin_password"],
            is_admin=True,  # Mark as admin
            company=company,
        )

        return {"company": company, "admin_user": admin_user}

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['is_superuser'] = user.is_superuser
        token['company'] = {
            "status": user.company.status,
            "roles": user.company.roles
        } if hasattr(user, 'company') else None

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Attach user details to the response
        data['user'] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "is_superuser": self.user.is_superuser,
            "company": {
                "status": self.user.company.status,
                "roles": self.user.company.roles
            } if hasattr(self.user, 'company') else None
        }
        return data

class CompanySerializer(serializers.ModelSerializer):
    network = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Company.objects.all(), required=False
    )
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
            "listing",  # New field for listing details
        ]
        read_only_fields = ["buyer"]

    def get_listing(self, obj):
        listing = obj.listing
        return {
            "id": listing.id,
            "product_name": listing.product.name,
            "auction_end_date": listing.auction_cycle.end_date,
            "current_highest_bid": (
                listing.bids.order_by("-price_per_unit").first().price_per_unit
                if listing.bids.exists()
                else None
            ),
            "quantity_available": listing.quantity_available,
        }

    def validate(self, data):
        listing = Listing.objects.filter(id=data["listing_id"]).first()
        
        buyer = self.context["request"].user.company

        # Validate auction cycle status
        if listing.auction_cycle.status != "open":
            raise serializers.ValidationError("You can only bid on listings in active auction cycles.")

        # Validate buyer is in the seller's network
        seller = listing.created_by.company
        if buyer not in seller.network.all():
            raise serializers.ValidationError("You are not authorized to bid on this listing.")

        # Validate quantity
        if data["quantity"] > listing.quantity_available:
            raise serializers.ValidationError("Bid quantity exceeds available quantity.")
        
        data["listing"] = listing

        return data

