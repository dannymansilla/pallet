from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from palletapp.views import LogoutView, PasswordChangeView, RegisterView  # Import custom views
from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('palletapp.urls')),  # Include app-level URLs

    # JWT Authentication Endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/password_change/', PasswordChangeView.as_view(), name='password_change'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/password_reset/', PasswordResetView.as_view(), name='password_reset'),
    path('api/password_reset_confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/register/', RegisterView.as_view(), name='register'),
]
