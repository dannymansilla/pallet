from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import User, Listing, Bid, Company
from rest_framework import status
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from .serializers import UserProfileSerializer, ListingSerializer, BidSerializer, CompanySerializer

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny]) 
def register_user(request):
    data = request.data
    try:
        # Extract company if provided
        company_id = data.get('company')
        company = Company.objects.get(id=company_id) if company_id else None

        # Create new user
        user = User.objects.create(
            name=data['name'],
            email=data['email'],
            password=make_password(data['password']),  # Hash the password
            company=company  # Link the user with the company
        )
        # Generate tokens for the newly created user
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    except Company.DoesNotExist:
        return Response({'detail': 'Company not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def companies(request):
    if request.method == 'GET':
        # Fetch all companies
        companies = Company.objects.all()
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Create a new company
        data = request.data
        serializer = CompanySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method in ['PUT', 'PATCH']:
        # Update an existing company
        company_id = request.data.get('id')
        try:
            company = Company.objects.get(id=company_id)
            serializer = CompanySerializer(company, data=request.data, partial=(request.method == 'PATCH'))
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Company.DoesNotExist:
            return Response({"detail": "Company not found."}, status=status.HTTP_404_NOT_FOUND)
        
    elif request.method == 'DELETE':
        # Delete a company
        company_id = request.data.get('id')
        try:
            company = Company.objects.get(id=company_id)
            company.delete()
            return Response({"detail": "Company deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Company.DoesNotExist:
            return Response({"detail": "Company not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_bids(request):
    user = request.user
    bids = Bid.objects.filter(user=user)
    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_listings(request):
    user = request.user
    listings = Listing.objects.filter(user=user)
    serializer = ListingSerializer(listings, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_listing(request):
    data = request.data
    user = request.user  # Get the authenticated user
    serializer = ListingSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=user)  # Save listing with the user as the owner
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_listing(request, listing_id):
    try:
        listing = Listing.objects.get(id=listing_id, user=request.user)
        serializer = ListingSerializer(listing, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Listing.DoesNotExist:
        return Response({"detail": "Listing not found or you do not have permission to edit it."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_listing(request, listing_id):
    try:
        listing = Listing.objects.get(id=listing_id, user=request.user)
        listing.delete()
        return Response({"detail": "Listing deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except Listing.DoesNotExist:
        return Response({"detail": "Listing not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)
