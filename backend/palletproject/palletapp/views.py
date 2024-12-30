from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Company, Product, Listing, Auction, Bid
from .serializers import CompanySerializer, ProductSerializer, ListingSerializer, AuctionSerializer, BidSerializer, RegisterSerializer, CompanyRegistrationSerializer
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.generics import CreateAPIView
from .permissions import HasAcceptedTerms
from django.utils import timezone


User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Restrict queryset based on user's role and company.
        Admins can view all users; regular users can only view users in their company.
        """
        if self.request.user.is_admin:
            return User.objects.filter(company=self.request.user.company)
        elif self.request.user.company:
            return User.objects.filter(company=self.request.user.company)
        raise PermissionDenied("You do not have access to these records.")

    def get_permissions(self):
        """
        Print debug information for permissions and return default permissions.
        """
        print(f"Request User: {self.request.user}, Is Admin: {self.request.user.is_admin}")
        return super().get_permissions()

    def perform_create(self, serializer):
        """
        Ensure only admins can create users and associate them with the admin's company.
        """
        if not self.request.user.is_admin:
            raise PermissionDenied("Only admins can create users.")
        serializer.save(company=self.request.user.company)

    def perform_update(self, serializer):
        """
        Ensure non-admin users cannot modify roles or companies.
        """
        if not self.request.user.is_admin and (
            "is_admin" in serializer.validated_data or "company" in serializer.validated_data
        ):
            raise PermissionDenied("You cannot modify admin status or company associations.")
        serializer.save()

    def perform_destroy(self, instance):
        """
        Restrict deletion of users to company admins.
        """
        if not self.request.user.is_admin:
            raise PermissionDenied("Only admins can delete users.")
        instance.delete()

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def set_admin(self, request, pk=None):
        """
        API to assign a user as an admin for a company.
        """
        user = self.get_object()  # Fetch the user by `pk`
        company_id = request.data.get("company_id")

        if not company_id:
            raise ValidationError("`company_id` is required.")

        if not self.request.user.is_admin:
            raise PermissionDenied("Only admins can assign admin roles.")

        serializer = self.get_serializer(user)
        admin_user = serializer.set_admin(company_id)

        return Response(
            {
                "message": f"User {admin_user.username} is now an admin for company {admin_user.company.name}."
            },
            status=status.HTTP_200_OK,
        )

# Custom Permissions
class IsSeller(permissions.BasePermission):
    """
    Allows access only to users whose companies have a 'seller' or 'both' role.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if not hasattr(user, 'company') or not user.company:
            return False
        return user.company.roles in ["seller", "both"]

class IsBuyer(permissions.BasePermission):
    """
    Allows access only to users whose companies have a 'buyer' or 'both' role.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if not hasattr(user, 'company') or not user.company:
            return False
        return user.company.roles in ["buyer", "both"]

# ViewSets
class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def register(self, request):
        """
        Handles combined Company and Admin User registration.
        """
        serializer = CompanyRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(
                {
                    "message": "Company and admin user registered successfully.",
                    "company": CompanySerializer(result["company"]).data,
                    "admin_user": UserSerializer(result["admin_user"]).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def approve_company(self, request, pk=None):
        """
        Approve a company by setting `is_approved` to True.
        Only superusers or staff can approve companies.
        """
        # Ensure only superusers or staff can approve companies
        if not request.user.is_staff:
            raise PermissionDenied("You do not have permission to approve companies.")

        company = self.get_object()

        if company.is_approved:
            raise ValidationError("Company is already approved.")

        # Approve the company
        company.is_approved = True
        company.save()

        # Notify the admin user
        admin_user = company.users.filter(is_admin=True).first()
        if admin_user:
            # Uncomment the following lines if notification logic is implemented
            # send_notification(
            #     admin_user,
            #     f"Your company {company.name} has been approved!",
            #     notification_type="email",
            # )
            pass

        return Response(
            {"status": f"Company {company.name} approved successfully."},
            status=status.HTTP_200_OK,
        )
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def accept_terms(self, request):
        """Accept Terms of Service for the company of the logged-in user."""
        # Get the company associated with the logged-in user
        user = request.user
        if not hasattr(user, "company") or not user.company:
            return Response(
                {"detail": "User is not associated with any company."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company = user.company

        if company.terms_accepted:
            return Response(
                {"detail": "Terms already accepted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark terms as accepted
        company.terms_accepted = timezone.now()
        company.save()

        return Response({"message": "Terms accepted successfully."}, status=status.HTTP_200_OK)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsSeller]

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated, IsSeller, HasAcceptedTerms]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)

class AuctionViewSet(viewsets.ModelViewSet):
    queryset = Auction.objects.all()
    serializer_class = AuctionSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsSeller])
    def start_auction(self, request, pk=None):
        auction = self.get_object()
        if auction.status != "pending":
            raise ValidationError("Only pending auctions can be started.")
        auction.status = "open"
        auction.save()
        return Response({"status": "Auction started."})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsSeller])
    def close_auction(self, request, pk=None):
        auction = self.get_object()
        if auction.status != "open":
            raise ValidationError("Only open auctions can be closed.")
        auction.status = "closed"
        auction.save()
        return Response({"status": "Auction closed."})

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated, IsBuyer, HasAcceptedTerms]

    def perform_create(self, serializer):
        # Associate the bid with the authenticated user's company
        serializer.save(buyer=self.request.user.company)

    def get_queryset(self):
        """
        Returns bids associated with the authenticated user's company by default.
        Supports filtering by auction via the 'auction_id' query parameter.
        """
        user_company = self.request.user.company
        auction_id = self.request.query_params.get("auction_id")

        # Filter bids by the user's company
        queryset = self.queryset.filter(buyer=user_company)

        # If auction_id is provided, filter further by the auction
        if auction_id:
            queryset = queryset.filter(auction__id=auction_id)

        return queryset

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=200)
        except Exception as e:
            return Response({"error": "Invalid token."}, status=400)
        
class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)
    
class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class TermsOfServiceView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tos_content = "Generic Terms of Service Placeholder..."
        return Response({"terms_of_service": tos_content})
