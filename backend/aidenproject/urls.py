from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return JsonResponse({"status": "healthy"})

schema_view = get_schema_view(
    openapi.Info(
        title="Aiden API",
        default_version='v1',
        description="API documentation for the Aiden platform",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@aiden.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Health Check
    path('health/', health_check, name='health_check'),
    
    # API Documentation
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    path('admin/', admin.site.urls),
    
    # App URLs
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/auctions/', include('apps.auctions.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/integrations/', include('apps.integrations.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
