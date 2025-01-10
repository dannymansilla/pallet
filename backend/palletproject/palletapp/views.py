from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from .models import AuctionCycle, Company, Product, Listing, Auction, Bid
from .serializers import AuctionCycleSerializer, CompanySerializer, CustomTokenObtainPairSerializer, ProductSerializer, ListingSerializer, AuctionSerializer, BidSerializer, RegisterSerializer, CompanyRegistrationSerializer
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
from .permissions import HasAcceptedTerms, IsInSellerNetwork
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Sum, Count, Q, Max, F


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

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

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
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        company = user.company

        # Prepare the response
        profile_data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin,
                "is_superuser": user.is_superuser,
            },
            "company": {
                "name": company.name if company else None,
                "status": company.status if company else None,
                "roles": company.roles if company else None,
            } if company else None,
        }
        return Response(profile_data)

# Custom permission to check if the user is a platform admin
class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser  # Use the is_superuser field
    
class ActiveAuctionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Debugging log to confirm the view is hit
        print(f"Active auctions endpoint called")

        # Fetch active auctions with status "open"
        auctions = Auction.objects.filter(status="open")
        print(f"Query result: {auctions}")

        # Format the response
        data = [
            {
                "id": auction.id,
                "name": auction.name,
                "listings": [listing.id for listing in auction.listings.all()],
                "start_date": auction.start_date,
                "end_date": auction.end_date,
                "status": auction.status,
                "created_by": auction.created_by.id,
            }
            for auction in auctions
        ]

        print(f"Response data: {data}")

        return Response(data)

class CurrentBidsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Ensure user belongs to a company
        if not hasattr(user, "company") or not user.company:
            return Response(
                {"detail": "User does not belong to a company."},
                status=400
            )
        
        # Filter bids by the user's company
        bids = Bid.objects.filter(buyer=user.company, auction__status="open").select_related("auction", "listing")

        # Construct the response
        data = [
            {
                "auction_id": bid.auction.id,
                "product_name": bid.listing.product.name,
                "bid_amount": bid.price_per_unit,
                "end_time": bid.auction.end_date,
            }
            for bid in bids
        ]
        return Response(data)


    
class ActiveListingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Check if the user belongs to a company
        if not hasattr(user, "company") or not user.company:
            return Response(
                {"detail": "User does not belong to a company."},
                status=400
            )

        # Fetch active listings for the user's company
        listings = Listing.objects.filter(
            created_by__company=user.company,  # Adjust filtering to reference the user's company via created_by
            is_active=True,  # Ensure only active listings are fetched
            auction_cycle__status="open"  # Ensure listings are part of the current open auction cycle
        ).select_related("product")

        # Serialize the data to include relevant fields
        data = [
            {
                "id": listing.id,
                "name": listing.product.name,
                "quantity_available": listing.quantity_available,
                "minimum_selling_price": listing.minimum_selling_price,
                "bids_received": listing.bids.count(),
                "highest_bid": listing.bids.aggregate(Max("amount"))["amount__max"] or 0,
                "time_remaining": listing.auction_cycle.end_date,  # Use auction cycle's end date for time remaining
            }
            for listing in listings
        ]

        return Response(data)


class AuctionPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, "company") or not user.company:
            return Response(
                {"detail": "User does not belong to a company."},
                status=400,
            )

        company = user.company

        # Calculate total sales
        total_sales = (
            Auction.objects.filter(company=company, status="completed")
            .aggregate(total_revenue=Sum(F("listings__bids__price_per_unit") * F("listings__bids__quantity")))["total_revenue"]
            or 0
        )

        # Calculate most active buyers
        most_active_buyers = (
            Bid.objects.filter(auction__company=company)
            .values("buyer__name")  # Reference the company name
            .annotate(total_bids=Count("id"))
            .order_by("-total_bids")[:5]
        )

        # Calculate auction completion rate
        total_auctions = Auction.objects.filter(company=company).count()
        completed_auctions = Auction.objects.filter(
            company=company, status="completed"
        ).count()
        completion_rate = (
            (completed_auctions / total_auctions) * 100 if total_auctions > 0 else 0
        )

        data = {
            "total_sales": total_sales,
            "most_active_buyers": list(most_active_buyers),
            "completion_rate": round(completion_rate, 2),
        }

        return Response(data)


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

    @action(detail=True, methods=["post"], permission_classes=[IsSuperUser])
    def approve_company(self, request, pk=None):
        """
        Approve a company by setting `status` to "approved".
        Only superusers can approve companies.
        """
        company = self.get_object()

        if company.status == "approved":
            return Response({"error": "Company is already approved."}, status=400)

        # Approve the company
        company.status = "approved"
        company.save()

        # Notify the admin user
        admin_user = company.users.filter(is_admin=True).first()
        if admin_user:
            # Example: Notify admin user about approval
            # send_notification(admin_user, "Your company has been approved.", "email")
            pass

        return Response(
            {"message": f"Company {company.name} approved successfully."},
            status=200,
        )
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def search(self, request):
        """Search for companies by name or other criteria."""
        query = request.query_params.get("q", "")
        if not query:
            return Response({"error": "Query parameter 'q' is required."}, status=400)

        # Search logic (adjust fields as per your model)
        companies = self.queryset.filter(
            Q(name__icontains=query) |
            Q(contact_email__icontains=query)
        )

        serializer = self.get_serializer(companies, many=True)
        return Response(serializer.data, status=200)
    
    @action(detail=True, methods=["post"], permission_classes=[IsSuperUser])
    def reject_company(self, request, pk=None):
        """
        Reject a company by setting `status` to "rejected".
        Only superusers can reject companies.
        """
        company = self.get_object()

        if company.status == "rejected":
            return Response({"error": "Company is already rejected."}, status=400)

        # Reject the company
        company.status = "rejected"
        company.save()

        # Notify the admin user
        admin_user = company.users.filter(is_admin=True).first()
        if admin_user:
            # Example: Notify admin user about rejection
            # send_notification(admin_user, "Your company has been rejected.", "email")
            pass

        return Response(
            {"message": f"Company {company.name} rejected successfully."},
            status=200,
        )

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def accept_terms(self, request):
        """
        Accept Terms of Service for the company of the logged-in user.
        """
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
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def add_to_network(self, request):
        buyer_company_id = request.data.get("company_id")
        seller_company = request.user.company

        if not seller_company:
            return Response(
                {"detail": "You are not associated with any company."},
                status=400,
            )

        try:
            buyer_company = Company.objects.get(pk=buyer_company_id)
        except Company.DoesNotExist:
            return Response({"detail": "Buyer company not found."}, status=404)

        if buyer_company in seller_company.network.all():
            return Response(
                {"detail": "Company is already in your network."},
                status=400,
            )

        seller_company.network.add(buyer_company)
        return Response({"message": "Buyer added to your network."}, status=200)


    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def remove_from_network(self, request):
        buyer_company_id = request.data.get("company_id")
        seller_company = request.user.company

        if not seller_company:
            return Response(
                {"detail": "You are not associated with any company."},
                status=400,
            )

        try:
            buyer_company = Company.objects.get(pk=buyer_company_id)
        except Company.DoesNotExist:
            return Response({"detail": "Buyer company not found."}, status=404)

        if buyer_company not in seller_company.network.all():
            return Response(
                {"detail": "Company is not in your network."},
                status=400,
            )

        seller_company.network.remove(buyer_company)
        return Response({"message": "Buyer removed from your network."}, status=200)

    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def fetch_network(self, request):
        """Fetches the current network of the logged-in user's company."""
        seller_company = request.user.company

        if not seller_company:
            return Response(
                {"detail": "You are not associated with any company."},
                status=400,
            )

        # Fetch all companies in the network
        network = seller_company.network.all()
        network_data = CompanySerializer(network, many=True).data

        return Response(network_data, status=200)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    @action(detail=False, methods=["get"])
    def search(self, request):
        """
        Search for products by name, GTIN, or brand.
        """
        query = request.query_params.get("q", "")
        if not query:
            return Response({"error": "Query parameter 'q' is required."}, status=400)

        # Updated query logic
        products = Product.objects.filter(
            Q(name__icontains=query) | 
            Q(gtin__icontains=query) |
            Q(brand__icontains=query)
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

class AuctionCycleViewSet(viewsets.ModelViewSet):
    queryset = AuctionCycle.objects.all()
    serializer_class = AuctionCycleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filters auction cycles based on their status.
        """
        status_filter = self.request.query_params.get("status")
        if status_filter:
            return self.queryset.filter(status=status_filter)
        return self.queryset


class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated, IsSeller, HasAcceptedTerms]

    def perform_create(self, serializer):
        # Get the next available auction cycle by start date
        next_cycle = AuctionCycle.objects.filter(start_date__gte=timezone.now().date()).order_by('start_date').first()
        if not next_cycle:
            raise serializers.ValidationError("No upcoming auction cycle available. Please create one.")
        # Save the listing and associate it with the next auction cycle
        serializer.save(created_by=self.request.user, auction_cycle=next_cycle)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def active(self, request):
        """Fetch listings in active auction cycles."""
        active_cycles = AuctionCycle.objects.filter(
            status__in=["listing", "open", "closing"]
        )
        listings = self.queryset.filter(auction_cycle__in=active_cycles, created_by=request.user)
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)


    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)
    
class QueuedListingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the next available auction cycle
        next_cycle = AuctionCycle.objects.filter(start_date__gte=timezone.now().date()).order_by("start_date").first()
        if not next_cycle:
            return Response({"detail": "No upcoming auction cycle found."}, status=404)

        # Fetch listings for the next auction cycle
        listings = Listing.objects.filter(auction_cycle=next_cycle)
        serializer = ListingSerializer(listings, many=True)

        return Response(serializer.data)


class AuctionViewSet(viewsets.ModelViewSet):
    queryset = AuctionCycle.objects.all()
    serializer_class = AuctionCycleSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def get_queryset(self):
        # Show only active or upcoming auction cycles
        return self.queryset.filter(status__in=["listing", "open", "closing"])
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def search(self, request):
        query = request.query_params.get("q", "")
        category = request.query_params.get("category", "")
        
        auctions = self.queryset.filter(
            Q(listing__product__name__icontains=query) |
            Q(description__icontains=query),
            listing__category__icontains=category
        )
        serializer = self.get_serializer(auctions, many=True)
        return Response(serializer.data)

    
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
    permission_classes = [IsAuthenticated, IsBuyer, HasAcceptedTerms, IsInSellerNetwork]

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
