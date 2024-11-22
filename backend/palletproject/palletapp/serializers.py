from rest_framework import serializers
from .models import User, Listing, Bid, Company

# Serializer for handling user creation
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'company')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        company = validated_data.pop('company', None)  # Get the company from the data
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            company=company
        )
        return user

# Serializer for the user's company
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'company_name', 'address', 'phone']

# Serializer for the user's profile, including company information
class UserProfileSerializer(serializers.ModelSerializer):
    company = CompanySerializer()

    class Meta:
        model = User
        fields = ['name', 'email', 'company']

# Serializer for listings created by the user
class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = ['id', 'title', 'description', 'status', 'closing_date', 'current_bids']

    def create(self, validated_data):
        # Automatically set the user when creating a listing
        user = self.context['request'].user
        return Listing.objects.create(user=user, **validated_data)

# Serializer for bids placed by the user
class BidSerializer(serializers.ModelSerializer):
    listing = ListingSerializer()  # Nested serializer to show the listing details

    class Meta:
        model = Bid
        fields = ['id', 'listing', 'bid_amount', 'quantity', 'status']
