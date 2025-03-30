from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import (
    RegisterSerializer, UserSerializer, ProfileSerializer,
    OrganizationSerializer, LoginSerializer, OrganizationApprovalSerializer
)
from .models import Organization, User
from django.utils import timezone

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Use email as username for authentication
        email = attrs.get('email')
        if email:
            user = User.objects.filter(email=email).first()
            if user:
                attrs['username'] = user.username
        
        data = super().validate(attrs)
        
        # Add extra responses
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'role': self.user.role,
            'organization': {
                'id': self.user.organization.id,
                'name': self.user.organization.name,
                'is_buyer': self.user.organization.is_buyer,
                'is_seller': self.user.organization.is_seller,
                'approval_status': self.user.organization.approval_status
            } if self.user.organization else None
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

class OrganizationListView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAdminUser]
    queryset = Organization.objects.all().order_by('-created_at')

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(approval_status=status)
        return queryset

class OrganizationApprovalView(generics.UpdateAPIView):
    serializer_class = OrganizationApprovalSerializer
    permission_classes = [IsAdminUser]
    queryset = Organization.objects.all()

    def perform_update(self, serializer):
        organization = self.get_object()
        serializer.update(organization, serializer.validated_data)

class PendingOrganizationsView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Organization.objects.filter(approval_status='pending').order_by('-created_at')

@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_organization(request, org_id):
    """Approve or reject an organization"""
    organization = get_object_or_404(Organization, id=org_id)
    action = request.data.get('action')
    notes = request.data.get('notes', '')

    if action not in ['approve', 'reject']:
        return Response(
            {'error': 'Invalid action. Must be either "approve" or "reject"'},
            status=status.HTTP_400_BAD_REQUEST
        )

    organization.approval_status = 'approved' if action == 'approve' else 'rejected'
    organization.approved_by = request.user
    organization.approved_at = timezone.now()
    organization.save()

    # Send notification to organization users (you can implement this later)
    
    return Response({
        'message': f'Organization {organization.name} has been {organization.approval_status}',
        'organization': OrganizationSerializer(organization).data
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_terms(request):
    user = request.user
    if not user.tos_accepted:
        user.tos_accepted = True
        user.tos_accepted_at = timezone.now()
        user.save()
    return Response({'message': 'Terms accepted successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_admin_user(request):
    """Create a new admin user (can only be done by existing admin)"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(
        email=email,
        username=email,
        password=password,
        role='admin',
        tos_accepted=True,
        tos_accepted_at=timezone.now()
    )
    
    return Response(
        {'message': 'Admin user created successfully', 'user': UserSerializer(user).data},
        status=status.HTTP_201_CREATED
    )
