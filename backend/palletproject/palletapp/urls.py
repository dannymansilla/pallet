from django.urls import path
from . import views

urlpatterns = [
    # Route for user registration (creating an account)
    path('register/', views.register_user, name='register'),

    # Other app-specific URLs can be added here as your app grows
]
