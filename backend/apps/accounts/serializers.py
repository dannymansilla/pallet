from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Organization, BuyerOnboardingRequest

User = get_user_model()

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'address', 'contact_email', 'phone', 
                 'is_seller', 'is_buyer', 'approval_status', 'approved_at']
        read_only_fields = ['approval_status', 'approved_at']

class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'organization', 'tos_accepted', 'tos_accepted_at']
        read_only_fields = ['role']

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    company_name = serializers.CharField()
    role = serializers.ChoiceField(choices=['buyer', 'seller'])
    tos_accepted = serializers.BooleanField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_tos_accepted(self, value):
        if not value:
            raise serializers.ValidationError("Terms of Service must be accepted")
        return value

    def create(self, validated_data):
        organization = Organization.objects.create(
            name=validated_data['company_name'],
            contact_email=validated_data['email'],
            is_buyer=validated_data['role'] == 'buyer',
            is_seller=validated_data['role'] == 'seller'
        )

        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            organization=organization,
            tos_accepted=validated_data['tos_accepted'],
            tos_accepted_at=timezone.now() if validated_data['tos_accepted'] else None
        )

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class OrganizationApprovalSerializer(serializers.Serializer):
    approval_status = serializers.ChoiceField(choices=['approved', 'rejected'])
    notes = serializers.CharField(required=False, allow_blank=True)

    def update(self, organization, validated_data):
        user = self.context['request'].user
        if not user.is_admin:
            raise serializers.ValidationError("Only admin users can approve organizations")

        organization.approval_status = validated_data['approval_status']
        organization.approved_by = user
        organization.approved_at = timezone.now()
        organization.save()

        return organization

class ProfileSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'organization', 'tos_accepted', 'tos_accepted_at']
        read_only_fields = ['email', 'role', 'organization'] 