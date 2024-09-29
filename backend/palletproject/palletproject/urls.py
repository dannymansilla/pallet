from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Include the app-level URLs
    path('api/', include('palletapp.urls')),  # Replace 'myapp' with the name of your app

    # JWT token authentication views (login and refresh)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # For login (generate tokens)
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # For refreshing tokens
]
