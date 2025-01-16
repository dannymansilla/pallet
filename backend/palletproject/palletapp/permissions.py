from rest_framework.permissions import BasePermission

class HasAcceptedTerms(BasePermission):
    """
    Permission class to check if the user has accepted the Terms of Service.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False  # Ensure user is authenticated first
        if not request.user.company or not request.user.company.terms_accepted:
            return False  # User must belong to a company that has accepted ToS
        return True
    
from rest_framework.permissions import BasePermission
from palletapp.models import Listing

class IsInSellerNetwork(BasePermission):
    def has_permission(self, request, view):
        if request.method == "POST":
            # Check the seller network for bid creation
            listing_id = request.data.get("listing_id")
            if not listing_id:
                return False  # Require a listing_id to create a bid

            try:
                listing = Listing.objects.get(id=listing_id)
            except Listing.DoesNotExist:
                return False  # Listing must exist

            seller = listing.created_by.company
            buyer = request.user.company
            return buyer in seller.network.all()

        # For other request methods, fallback to the default behavior
        return True

