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
    
class IsInSellerNetwork(BasePermission):
    def has_permission(self, request, view):
        bid = view.get_object()
        seller_company = bid.listing.created_by.company
        return request.user.company in seller_company.network.all()
