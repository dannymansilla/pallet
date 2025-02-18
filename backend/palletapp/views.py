from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from .models import AuctionCycle, Company, NetworkRequest, PendingInvite, Product, Listing, Bid
from .serializers import AuctionCycleSerializer, CompanySerializer, CustomTokenObtainPairSerializer, PendingInviteSerializer, ProductSerializer, ListingSerializer, BidSerializer, RegisterSerializer, CompanyRegistrationSerializer
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
from django.utils.timezone import now
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from fuzzywuzzy import process

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
        active_cycles = AuctionCycle.objects.filter(status="open")
        listings = Listing.objects.filter(auction_cycle__in=active_cycles)
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)

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
        
        bids = Bid.objects.filter(
            buyer=user.company,
            listing__auction_cycle__status="open"
        )
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)


    
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
            created_by__company=user.company,  # Ensure listings are tied to the user's company
            is_active=True,  # Only active listings
            auction_cycle__status="open"  # Part of the current open auction cycle
        ).select_related("product", "auction_cycle")  # Optimize queries

        # Serialize data with corrected fields and logic
        data = [
            {
                "id": listing.id,
                "name": listing.product.name,
                "quantity_available": listing.quantity_available,
                "minimum_selling_price": float(listing.minimum_selling_price),
                "bids_received": listing.bids.count(),
                "highest_bid": listing.bids.aggregate(Max("price_per_unit"))["price_per_unit__max"] or 0,
                "time_remaining": (listing.auction_cycle.end_date - timezone.now().date()).days,
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

        # Fetch closed auction cycles associated with the company
        closed_cycles = AuctionCycle.objects.filter(
            status="closed", listings__created_by__company=company
        ).distinct()

        # Calculate total sales
        total_sales = (
            Bid.objects.filter(listing__auction_cycle__in=closed_cycles)
            .aggregate(total_sales=Sum(F("price_per_unit") * F("quantity")))["total_sales"]
            or 0
        )

        # Calculate most active buyers
        most_active_buyers = (
            Bid.objects.filter(listing__auction_cycle__in=closed_cycles)
            .values("buyer__name")  # Reference the company name
            .annotate(total_bids=Count("id"))
            .order_by("-total_bids")[:5]
        )

        # Calculate auction completion rate
        total_cycles = closed_cycles.count()
        completed_cycles = closed_cycles.filter(
            listings__bids__isnull=False
        ).distinct().count()

        completion_rate = (
            (completed_cycles / total_cycles) * 100 if total_cycles > 0 else 0
        )

        # Prepare data for the response
        data = {
            "total_sales": round(total_sales, 2),
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
        # Simplified serializer with only required fields
        serializer = CompanyRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Extract validated data
            company_name = serializer.validated_data["company_name"]
            admin_email = serializer.validated_data["admin_email"]
            admin_password = serializer.validated_data["admin_password"]
            roles = serializer.validated_data["roles"]
            terms_accepted = serializer.validated_data["terms_accepted"]

            # Determine the timestamp for terms acceptance
            terms_accepted_datetime = now() if terms_accepted else None

            # Create the company
            company = Company.objects.create(
                name=company_name,
                roles=roles,
                terms_accepted=terms_accepted_datetime,  # Save the timestamp
                terms_accepted_boolean=terms_accepted,   # Save the boolean
            )

            # Create the admin user
            admin_user = User.objects.create_user(
                username=admin_email,
                email=admin_email,
                password=admin_password,
                company=company,
                is_admin=True
            )

            # Return success response
            return Response(
                {
                    "message": "Company and admin user registered successfully.",
                    "company": {"name": company.name, "roles": company.roles},
                    "admin_user": {"email": admin_user.email, "username": admin_user.username},
                },
                status=status.HTTP_201_CREATED,
            )

        # If validation fails, return errors
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
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def request_network_access(self, request):
        """
        Allows a buyer to request access to a seller's network.
        """
        buyer = request.user.company
        seller_id = request.data.get("seller_company")

        if not buyer:
            return Response({"error": "You are not associated with a company."}, status=400)

        seller = get_object_or_404(Company, id=seller_id)

        # Check if already in network
        if buyer in seller.network.all():
            return Response({"error": "Already in seller's network."}, status=400)

        # Check if a pending request exists
        existing_request = NetworkRequest.objects.filter(buyer_company=buyer, seller_company=seller, status="pending").first()
        if existing_request:
            return Response({"error": "Request already pending."}, status=400)

        # Create request
        NetworkRequest.objects.create(buyer_company=buyer, seller_company=seller, status="pending")

        return Response({"message": "Request sent successfully."}, status=201)
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def handle_network_request(self, request):
        """
        Allows a seller to approve or reject a buyer's request to join their network.
        """
        seller = request.user.company
        request_id = request.data.get("request_id")
        action = request.data.get("action")  # "approve" or "reject"

        if not seller:
            return Response({"error": "You are not associated with a company."}, status=400)

        network_request = get_object_or_404(NetworkRequest, id=request_id, seller_company=seller)

        if network_request.status != "pending":
            return Response({"error": "Request already processed."}, status=400)

        if action == "approve":
            # Add buyer to seller's network
            seller.network.add(network_request.buyer_company)
            network_request.status = "approved"
        elif action == "reject":
            network_request.status = "rejected"
        else:
            return Response({"error": "Invalid action."}, status=400)

        network_request.save()
        return Response({"message": f"Request {action}d successfully."}, status=200)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def pending_requests(self, request):
        """
        Fetches all pending network requests for the logged-in seller.
        """
        seller = request.user.company

        if not seller:
            return Response({"error": "You are not associated with a company."}, status=400)

        requests = NetworkRequest.objects.filter(seller_company=seller, status="pending")
        data = [{"id": req.id, "buyer_company": req.buyer_company.name, "timestamp": req.timestamp} for req in requests]

        return Response(data, status=200)

    
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
    
    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def update_company(self, request, pk=None):
        """
        Allows updating optional fields for a company.
        """
        company = self.get_object()
        serializer = CompanyUpdateSerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Company updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def bulk_upload_buyers(self, request):
        """
        Allows sellers to upload a list of buyers in bulk.
        - Matches by email first
        - Fuzzy matches company names
        - Sends invitations to new buyers and logs them in pending invitations table
        """
        seller_company = request.user.company
        buyers = request.data.get("buyers", [])

        if not buyers:
            return Response({"error": "No buyers provided."}, status=status.HTTP_400_BAD_REQUEST)

        added_to_network = []
        invited_buyers = []
        warnings = []

        with transaction.atomic():  # Ensure atomic transactions
            for buyer in buyers:
                email = buyer.get("contact_email")
                company_name = buyer.get("company_name")

                # Step 1: Try to find the buyer by email
                existing_user = User.objects.filter(email=email).first()
                if existing_user and existing_user.company:
                    # Add to seller's network if not already added
                    if existing_user.company not in seller_company.network.all():
                        seller_company.network.add(existing_user.company)
                        added_to_network.append({
                            "company_name": existing_user.company.name,
                            "contact_email": email,
                            "status": "added"
                        })
                    continue  # Skip to the next buyer

                # Step 2: No email match, try fuzzy matching by company name
                existing_company = self.fuzzy_match_company(company_name)
                if existing_company:
                    # Warn about possible duplicate
                    warnings.append({
                        "company_name": company_name,
                        "contact_email": email,
                        "reason": f"Possible duplicate found: '{existing_company.name}' already exists."
                    })
                    continue  # Skip creating a new company

                # Step 3: No match found, create a new company and invite the buyer
                new_company = Company.objects.create(name=company_name, roles="buyer")
                new_user = User.objects.create_user(
                    username=email,
                    email=email,
                    company=new_company,
                    is_active=False  # Keep inactive until they accept the invite
                )

                # 🔥 **NEW: Create Pending Invitation**
                pending_invite = PendingInvite.objects.create(
                    seller=seller_company,
                    company_name=company_name,
                    contact_email=email,
                    status="pending"
                )

                # Send email invitation
                self.send_invite_email(email, company_name, seller_company.name)

                invited_buyers.append({
                    "company_name": company_name,
                    "contact_email": email,
                    "status": "invited",
                    "pending_invite_id": pending_invite.id  # Include for debugging
                })

        return Response({
            "added_to_network": added_to_network,
            "invited_buyers": invited_buyers,
            "warnings": warnings
        }, status=status.HTTP_200_OK)

    def fuzzy_match_company(self, company_name):
        """
        Attempts to match an uploaded company name with existing companies using fuzzy logic.
        Returns the best-matching company or None.
        """
        existing_companies = Company.objects.values_list("name", flat=True)
        match, score = process.extractOne(company_name, existing_companies)

        if score > 85:  # Adjust sensitivity as needed
            return Company.objects.filter(name=match).first()

        return None

    def send_invite_email(self, email, buyer_company, seller_company):
        """
        Sends an email invite to a new buyer.
        """
        subject = f"Invitation to join Aiden Marketplace"
        message = (
            f"Hello,\n\n"
            f"{seller_company} has invited your company, {buyer_company}, to join Aiden Marketplace.\n"
            f"Click the link below to sign up:\n\n"
            # f"{settings.FRONTEND_URL}/register?email={email}\n\n"
            f"{settings.FRONTEND_URL}\n\n"
            f"Best,\nAiden Team"
        )
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def pending_invites(self, request):
        """
        Fetch all pending invitations sent by the seller.
        """
        seller_company = request.user.company

        if not seller_company:
            return Response({"detail": "You are not associated with a company."}, status=400)

        pending_invites = PendingInvite.objects.filter(seller=seller_company, status="pending")
        serializer = PendingInviteSerializer(pending_invites, many=True)

        return Response(serializer.data, status=200)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    @action(detail=False, methods=["post"])
    def bulk_upload(self, request):
        """
        API endpoint to bulk upload products.
        The uploaded products will automatically be linked to the seller's company.
        """
        if not request.user.company:
            return Response({"error": "You are not associated with a company."}, status=status.HTTP_403_FORBIDDEN)

        products_data = request.data  # List of products
        
        # Ensure company is set on each product upon creation
        products = []
        for product_data in products_data:
            product = Product(
                name=product_data["name"],
                category=product_data.get("category", ""),
                description=product_data["description"],
                brand=product_data["brand"],
                gtin=product_data["gtin"],
                length=product_data["length"],
                width=product_data["width"],
                height=product_data["height"],
                weight=product_data["weight"],
                units_per_case=product_data["units_per_case"],
                cases_per_pallet=product_data["cases_per_pallet"],
                certifications=product_data.get("certifications", None),
                expiration_date=product_data.get("expiration_date", None),
                image=product_data.get("image", "product_images/default.png"),
                company=request.user.company  # ✅ Assign company here at model level
            )
            products.append(product)

        with transaction.atomic():  # Ensures all or nothing is committed
            Product.objects.bulk_create(products)

        return Response({"message": "Products uploaded successfully!"}, status=status.HTTP_201_CREATED)

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
    permission_classes = [IsAuthenticated, HasAcceptedTerms]

    @action(detail=False, methods=["post"])
    def batch_upload(self, request):
        """
        Allows batch uploading of listings via an ERP system.
        - Accepts GTIN instead of product_id.
        - Automatically assigns the correct product and auction cycle.
        - Saves all listings in a single database transaction.
        """
        data = request.data
        listings_data = data.get("listings", [])
        auction_cycle_id = data.get("auction_cycle_id")

        if not listings_data:
            return Response({"error": "No listings provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch or determine the correct auction cycle
        if auction_cycle_id:
            try:
                auction_cycle = AuctionCycle.objects.get(id=auction_cycle_id)
            except AuctionCycle.DoesNotExist:
                return Response({"error": "Invalid auction cycle ID."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            auction_cycle = AuctionCycle.objects.filter(status="listing").order_by("start_date").first()
            if not auction_cycle:
                return Response({"error": "No valid auction cycles available."}, status=status.HTTP_400_BAD_REQUEST)

        listings_to_create = []
        for listing in listings_data:
            gtin = listing.get("gtin")
            if not gtin:
                return Response({"error": "Each listing must have a GTIN."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                product = Product.objects.get(gtin=gtin)
            except Product.DoesNotExist:
                return Response({"error": f"Product with GTIN {gtin} not found."}, status=status.HTTP_400_BAD_REQUEST)

            # Create a new listing instance but don't save it yet
            new_listing = Listing(
                product=product,
                quantity_available=listing["quantity_available"],
                minimum_selling_price=listing["minimum_selling_price"],
                warehouse_location=listing["warehouse_location"],
                shipping_instructions=listing.get("shipping_instructions", ""),
                is_active=True,
                created_by=request.user,
                auction_cycle=auction_cycle
            )
            listings_to_create.append(new_listing)

        # Save all listings in one atomic transaction
        with transaction.atomic():
            Listing.objects.bulk_create(listings_to_create)

        return Response({"message": "Batch listings uploaded successfully!"}, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
            # Check if auction_cycle_id is provided
            auction_cycle_id = self.request.data.get("auction_cycle_id")
            if auction_cycle_id:
                try:
                    auction_cycle = AuctionCycle.objects.get(id=auction_cycle_id)
                except AuctionCycle.DoesNotExist:
                    raise serializers.ValidationError({"auction_cycle_id": "Invalid auction cycle ID."})
            else:
                # Default to the next auction cycle
                auction_cycle = AuctionCycle.objects.filter(status="listing").order_by("start_date").first()
                if not auction_cycle:
                    raise serializers.ValidationError({"auction_cycle_id": "No valid auction cycles available."})

            # Save the listing with the auction cycle
            serializer.save(created_by=self.request.user, auction_cycle=auction_cycle)

    def get_queryset(self):
        """
        Customize queryset based on the action:
        - For 'retrieve', include all listings to allow access by ID.
        - For other actions, restrict to listings created by the authenticated seller.
        """
        if self.action == "retrieve":
            return self.queryset  # Include all listings for retrieve
        user = self.request.user
        if hasattr(user, "company") and user.company:
            if user.company.roles in ["seller", "both"]:
                return self.queryset.filter(created_by=user)
        return self.queryset.none()

    def retrieve(self, request, *args, **kwargs):
        """
        Allows fetching a listing's details:
        - Sellers can access their own listings.
        - Buyers can access listings if they are in the seller's network.
        """
        listing = self.get_object()
        user_company = request.user.company
        seller_company = listing.created_by.company
        is_in_network = user_company in seller_company.network.all()

        # Check if the user is associated with a company
        if not user_company:
            raise PermissionDenied("You are not associated with a company.")

        # Allow sellers to access their own listings
        if listing.created_by.company == user_company:
            return super().retrieve(request, *args, **kwargs)
        
        response = super().retrieve(request, *args, **kwargs)
        response.data["is_in_network"] = is_in_network 

        # Allow buyers to access listings if in the seller's network
        return response
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def active(self, request):
        """Fetch listings in active auction cycles."""
        active_cycles = AuctionCycle.objects.filter(
            status__in=["listing", "open", "closing"]
        )
        listings = self.queryset.filter(auction_cycle__in=active_cycles, created_by=request.user)
        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def available_for_bidding(self, request):
        """Fetch listings available for buyers to bid on."""
        category = request.query_params.get("category", None)
        product_name = request.query_params.get("product_name", None)

        # Filter listings in auction cycles that are open
        open_cycles = AuctionCycle.objects.filter(status="open")
        listings = self.queryset.filter(auction_cycle__in=open_cycles)

        # Apply additional filters if provided
        if category:
            listings = listings.filter(category__icontains=category)
        if product_name:
            listings = listings.filter(product__name__icontains=product_name)

        serializer = ListingSerializer(listings, many=True)
        return Response(serializer.data)

    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def by_cycle(self, request):
        """Fetch listings by auction cycle."""
        cycle_id = request.query_params.get("cycle_id")
        listings = self.queryset.filter(auction_cycle__id=cycle_id)
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def bids(self, request, pk=None):
        """
        Fetch all bids for a specific listing.
        Only the seller of the listing can view the bids.
        """
        try:
            listing = self.get_object()
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found."}, status=404)

        # Ensure only the seller can access the bids
        if listing.created_by.company != request.user.company:
            raise PermissionDenied("You are not authorized to view bids for this listing.")

        # Fetch all bids related to the listing
        bids = Bid.objects.filter(listing=listing)
        serializer = BidSerializer(bids, many=True)

        return Response(serializer.data, status=200)
    
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


class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated, IsBuyer, HasAcceptedTerms, IsInSellerNetwork]

    def perform_create(self, serializer):
        """
        Automatically associates the bid with the authenticated user's company.
        """
        serializer.save(buyer=self.request.user.company)

    def get_queryset(self):
        """Fetch bids associated with the authenticated user's company, with optional filtering."""
        user_company = self.request.user.company
        auction_id = self.request.query_params.get("auction_id")
        status_filter = self.request.query_params.get("status")

        queryset = self.queryset.filter(buyer=user_company)

        if auction_id:
            queryset = queryset.filter(listing__auction_cycle__id=auction_id)

        if status_filter:
            if status_filter == "won":
                queryset = queryset.filter(is_winning_bid=True)
            elif status_filter == "lost":
                queryset = queryset.filter(is_winning_bid=False, listing__auction_cycle__status="closed")

        return queryset

    @action(detail=False, methods=["get"])
    def my_bids(self, request):
        """Fetch all bids for the authenticated buyer, categorized as active, won, and lost."""
        user_company = request.user.company

        active_bids = self.queryset.filter(buyer=user_company, listing__auction_cycle__status="open")
        won_bids = self.queryset.filter(buyer=user_company, is_winning_bid=True)
        lost_bids = self.queryset.filter(buyer=user_company, is_winning_bid=False, listing__auction_cycle__status="closed")

        return Response({
            "active": BidSerializer(active_bids, many=True).data,
            "won": BidSerializer(won_bids, many=True).data,
            "lost": BidSerializer(lost_bids, many=True).data
        })

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
