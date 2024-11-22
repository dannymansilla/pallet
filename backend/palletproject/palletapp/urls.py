from django.urls import path
from . import views

urlpatterns = [
    # Route for user registration (creating an account)
    path('register/', views.register_user, name='register'),

    # Route for creating a new company
    path('companies/', views.companies, name='companies'),

    # Route for fetching user profile
    path('profile/', views.profile, name='profile'),

    # Route for fetching the user's current bids
    path('current-bids/', views.current_bids, name='current-bids'),

    # Route for fetching the user's listings
    path('user-listings/', views.user_listings, name='user-listings'),
    path('listings/', views.create_listing, name='create-listing'),
    path('listings/<int:listing_id>/', views.update_listing, name='update-listing'),
    path('listings/<int:listing_id>/delete/', views.delete_listing, name='delete-listing'),
]
