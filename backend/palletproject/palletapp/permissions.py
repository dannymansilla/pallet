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
