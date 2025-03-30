from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    
    # Profile management
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.PasswordChangeView.as_view(), name='change_password'),
    path('accept-terms/', views.accept_terms, name='accept_terms'),

    # Admin endpoints
    path('admin/organizations/', views.OrganizationListView.as_view(), name='admin_organization_list'),
    path('admin/organizations/pending/', views.PendingOrganizationsView.as_view(), name='admin_pending_organizations'),
    path('admin/organizations/<int:org_id>/approve/', views.approve_organization, name='admin_organization_approve'),
    path('admin/create-admin/', views.create_admin_user, name='admin_create_admin'),
] 