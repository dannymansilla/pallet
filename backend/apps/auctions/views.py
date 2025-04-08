from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import (
    SaleEvent, Listing, Document, Bid, BidAuditLog,
    OptimizationRun, OptimizedLoad, TruckLoadItem, SellerBuyerNetwork
)
from .serializers import (
    SaleEventSerializer, ListingSerializer, DocumentSerializer,
    BidSerializer, BidAuditLogSerializer, OptimizationRunSerializer,
    OptimizedLoadSerializer, TruckLoadItemSerializer, SellerBuyerNetworkSerializer,
    SellerListingSerializer, AuctionTruckSerializer, BuyerDashboardListingSerializer
)
from django.db.models import Count, Sum, F, Q, FloatField, Case, When, Value, BooleanField
from datetime import datetime, timedelta
from django.db.models.functions import TruncMonth, ExtractYear, ExtractMonth
from apps.inventory.models import SellerProfile, BuyerProfile
from apps.orders.models import OrderLineItem, Order
from apps.accounts.models import Organization

# Create your views here.

class SaleEventViewSet(viewsets.ModelViewSet):
    queryset = SaleEvent.objects.all()
    serializer_class = SaleEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            return SaleEvent.objects.filter(listings__seller__organization=user.organization).distinct()
        elif user.role == 'buyer':
            return SaleEvent.objects.filter(status='open')
        return SaleEvent.objects.all()

    @action(detail=True, methods=['post'])
    def start_event(self, request, pk=None):
        event = self.get_object()
        if event.status == 'upcoming':
            event.status = 'open'
            event.save()
            return Response({'status': 'event started'})
        return Response({'error': 'Invalid event status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def close_event(self, request, pk=None):
        event = self.get_object()
        if event.status == 'open':
            event.status = 'closed'
            event.save()
            return Response({'status': 'event closed'})
        return Response({'error': 'Invalid event status'}, status=status.HTTP_400_BAD_REQUEST)

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            return Listing.objects.filter(seller__organization=user.organization)
        elif user.role == 'buyer':
            return Listing.objects.filter(listing_status='active')
        return Listing.objects.all()

class SellerListingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get the current user's seller profile
        seller_profile = request.user.organization.sellerprofile
        
        # Get filter parameters
        selected_month = request.query_params.get('month', '')
        selected_brand = request.query_params.get('brand', '')
        
        # Base queryset for the seller's listings
        queryset = Listing.objects.filter(seller=seller_profile)
        
        # Filter by month if provided
        if selected_month:
            year, month = selected_month.split('-')
            queryset = queryset.filter(
                sale_event__start_date__year=year,
                sale_event__start_date__month=month
            )
        
        # Filter by brand if provided
        if selected_brand:
            queryset = queryset.filter(product__brand=selected_brand)
        
        # Get current month for comparison
        current_date = timezone.now()
        current_month = current_date.strftime("%Y-%m")
        
        # Annotate with bid data for calculations
        queryset = queryset.annotate(
            # Total bid quantity for active bids
            total_bid_qty=Sum('bid__bid_quantity', filter=Q(bid__status='active')),
            
            # Sum of (bid_price * bid_quantity) for active bids
            sum_price_qty=Sum(
                F('bid__bid_price') * F('bid__bid_quantity'),
                filter=Q(bid__status='active'),
                output_field=FloatField()
            ),
            
            # Volume above MSP (bids with price > reserve_price)
            volume_above_msp=Sum(
                'bid__bid_quantity',
                filter=Q(bid__status='active', bid__bid_price__gt=F('reserve_price'))
            ),
            
            # Flag for current month
            is_current_month=Case(
                When(
                    sale_event__start_date__year=current_date.year,
                    sale_event__start_date__month=current_date.month,
                    then=Value(True)
                ),
                default=Value(False),
                output_field=BooleanField()
            )
        )
        
        # Serialize the data
        serializer = SellerListingSerializer(queryset, many=True)
        
        # Process the serialized data to add computed fields
        listings_data = serializer.data
        
        for listing in listings_data:
            # Get the corresponding listing object
            listing_obj = queryset.get(id=listing['id'])
            
            # Calculate weighted average bid price
            total_bid_qty = listing_obj.total_bid_qty or 0
            sum_price_qty = listing_obj.sum_price_qty or 0
            
            if total_bid_qty > 0:
                weighted_avg_price = sum_price_qty / total_bid_qty
            else:
                weighted_avg_price = 0
                
            listing['weighted_average_bid_price_per_unit'] = round(weighted_avg_price, 2)
            
            # Calculate volume above MSP percent
            volume_above_msp = listing_obj.volume_above_msp or 0
            quantity_available = listing_obj.quantity_available or 1  # Avoid division by zero
            
            volume_above_msp_percent = (volume_above_msp / quantity_available) * 100
            listing['volume_above_msp_percent'] = round(volume_above_msp_percent, 2)
            
            # Calculate recovery rate percent
            msrp = listing_obj.product.msrp if hasattr(listing_obj.product, 'msrp') else 0
            
            if msrp and msrp > 0:
                recovery_rate = (weighted_avg_price / msrp) * 100
            else:
                recovery_rate = 0
                
            listing['recovery_rate_percent'] = round(recovery_rate, 2)
        
        return Response(listings_data)

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'buyer':
            return Bid.objects.filter(buyer__organization=user.organization)
        elif user.role == 'seller':
            return Bid.objects.filter(listing__seller__organization=user.organization)
        return Bid.objects.all()

    def perform_create(self, serializer):
        # Create bid audit log entry
        bid = serializer.save(buyer=self.request.user.buyerprofile)
        BidAuditLog.objects.create(
            bid=bid,
            new_value=str(bid.bid_price),
            changed_by=self.request.user
        )

class OptimizationRunViewSet(viewsets.ModelViewSet):
    queryset = OptimizationRun.objects.all()
    serializer_class = OptimizationRunSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            return OptimizationRun.objects.filter(sale_event__listings__seller__organization=user.organization).distinct()
        return OptimizationRun.objects.none()

class OptimizedLoadViewSet(viewsets.ModelViewSet):
    queryset = OptimizedLoad.objects.all()
    serializer_class = OptimizedLoadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            return OptimizedLoad.objects.filter(sale_event__listings__seller__organization=user.organization).distinct()
        elif user.role == 'buyer':
            return OptimizedLoad.objects.filter(buyer__organization=user.organization)
        return OptimizedLoad.objects.none()

class TruckLoadItemViewSet(viewsets.ModelViewSet):
    queryset = TruckLoadItem.objects.all()
    serializer_class = TruckLoadItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            return TruckLoadItem.objects.filter(listing__seller__organization=user.organization)
        elif user.role == 'buyer':
            return TruckLoadItem.objects.filter(optimized_load__buyer__organization=user.organization)
        return TruckLoadItem.objects.none()

class SellerBuyerNetworkViewSet(viewsets.ModelViewSet):
    queryset = SellerBuyerNetwork.objects.all()
    serializer_class = SellerBuyerNetworkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            return SellerBuyerNetwork.objects.filter(seller__organization=user.organization)
        elif user.role == 'buyer':
            return SellerBuyerNetwork.objects.filter(buyer__organization=user.organization)
        return SellerBuyerNetwork.objects.all()

class ActiveListingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        active_listings = Listing.objects.filter(
            listing_status='active',
            sale_event__start_date__lte=now,
            sale_event__end_date__gt=now
        )
        serializer = ListingSerializer(active_listings, many=True)
        return Response(serializer.data)

class QueuedListingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        queued_listings = Listing.objects.filter(
            listing_status='queued',
            sale_event__start_date__gt=now
        )
        serializer = ListingSerializer(queued_listings, many=True)
        return Response(serializer.data)

class ActiveAuctionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        active_events = SaleEvent.objects.filter(
            status='open',
            start_date__lte=now,
            end_date__gt=now
        )
        serializer = SaleEventSerializer(active_events, many=True)
        return Response(serializer.data)

class CurrentBidsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'buyer':
            bids = Bid.objects.filter(
                buyer__organization=user.organization,
                status='active'
            )
        elif user.role == 'seller':
            bids = Bid.objects.filter(
                listing__seller__organization=user.organization,
                status='active'
            )
        else:
            bids = Bid.objects.filter(status='active')
        
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)

class AuctionPerformanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = self.request.user
        if user.role == 'seller':
            # Get seller's auction performance metrics
            total_listings = Listing.objects.filter(
                seller__organization=user.organization
            ).count()
            
            # Count listings that have accepted bids
            successful_sales = Listing.objects.filter(
                seller__organization=user.organization,
                listing_status='completed'
            ).filter(
                id__in=Bid.objects.filter(status='accepted').values('listing')
            ).count()
            
            return Response({
                'total_listings': total_listings,
                'successful_sales': successful_sales,
                'success_rate': (successful_sales / total_listings * 100) if total_listings > 0 else 0
            })
        elif user.role == 'buyer':
            # Get buyer's auction performance metrics
            total_bids = Bid.objects.filter(
                buyer__organization=user.organization
            ).count()
            
            winning_bids = Bid.objects.filter(
                buyer__organization=user.organization,
                status='accepted'
            ).count()
            
            return Response({
                'total_bids': total_bids,
                'winning_bids': winning_bids,
                'success_rate': (winning_bids / total_bids * 100) if total_bids > 0 else 0
            })
        
        return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_seller_metrics(request):
    """Get key metrics for seller dashboard."""
    user = request.user
    if not user.organization or user.role != 'seller':
        return Response(
            {"error": "User is not a seller or has no organization"},
            status=status.HTTP_403_FORBIDDEN
        )

    now = timezone.now()
    start_of_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_of_last_month = (start_of_this_month - timedelta(days=1)).replace(day=1)
    start_of_two_months_ago = (start_of_last_month - timedelta(days=1)).replace(day=1)

    # 1. Customer Engagement
    # Get total active buyers in network
    total_network_buyers = SellerBuyerNetwork.objects.filter(
        seller__organization=user.organization,
        status='active'
    ).count()

    # Get active buyers last month (placed at least one bid)
    active_buyers_last_month = Bid.objects.filter(
        listing__seller__organization=user.organization,
        timestamp__gte=start_of_last_month,
        timestamp__lt=start_of_this_month
    ).values('buyer').distinct().count()

    # Get active buyers two months ago for MoM comparison
    active_buyers_two_months_ago = Bid.objects.filter(
        listing__seller__organization=user.organization,
        timestamp__gte=start_of_two_months_ago,
        timestamp__lt=start_of_last_month
    ).values('buyer').distinct().count()

    # Calculate engagement percentage and MoM change
    engagement_percent = (active_buyers_last_month / total_network_buyers * 100) if total_network_buyers > 0 else 0
    engagement_mom_change = (
        ((active_buyers_last_month - active_buyers_two_months_ago) / active_buyers_two_months_ago * 100)
        if active_buyers_two_months_ago > 0 else 0
    )

    # 2. Volume (Current Month List Value)
    current_month_value = Listing.objects.filter(
        seller__organization=user.organization,
        sale_event__start_date__gte=start_of_this_month
    ).aggregate(
        total_value=Sum(F('reserve_price') * F('quantity_available'))
    )['total_value'] or 0

    last_month_value = Listing.objects.filter(
        seller__organization=user.organization,
        sale_event__start_date__gte=start_of_last_month,
        sale_event__start_date__lt=start_of_this_month
    ).aggregate(
        total_value=Sum(F('reserve_price') * F('quantity_available'))
    )['total_value'] or 0

    volume_mom_change = (
        ((current_month_value - last_month_value) / last_month_value * 100)
        if last_month_value > 0 else 0
    )

    # 3. Recovery Rate (Last Month's Performance)
    last_month_listed = Listing.objects.filter(
        seller__organization=user.organization,
        sale_event__start_date__gte=start_of_last_month,
        sale_event__start_date__lt=start_of_this_month
    ).aggregate(
        total_value=Sum(F('reserve_price') * F('quantity_available'))
    )['total_value'] or 0

    last_month_sold = Bid.objects.filter(
        listing__seller__organization=user.organization,
        timestamp__gte=start_of_last_month,
        timestamp__lt=start_of_this_month,
        status='accepted'
    ).aggregate(
        total_value=Sum(F('bid_price') * F('bid_quantity'))
    )['total_value'] or 0

    recovery_rate = (last_month_sold / last_month_listed * 100) if last_month_listed > 0 else 0

    # 4. Carried Over Value
    carried_over = last_month_listed - last_month_sold if last_month_listed > last_month_sold else 0

    return Response({
        'customerEngagement': {
            'lastMonthActivePercent': round(engagement_percent, 1),
            'MoMChange': round(engagement_mom_change, 1),
        },
        'volume': {
            'currentMonth': start_of_this_month.strftime('%B %Y'),
            'currentMonthListValue': round(current_month_value, 2),
            'MoMChange': round(volume_mom_change, 1),
        },
        'recoveryRate': {
            'prevMonthListValue': round(last_month_listed, 2),
            'prevMonthSoldValue': round(last_month_sold, 2),
        },
        'carriedOverValue': round(carried_over, 2),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_stats(request):
    """
    Returns month-by-month data for the seller's inventory & sales:
      1) listValue - total value of all listings
      2) soldListValue - value of sold listings at list price
      3) actualSales - actual revenue from sales
    """
    user = request.user

    # Must be a seller with an organization
    if not user.organization or user.role != 'seller':
        return Response(
            {"detail": "User must be a seller with an organization."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Get or create the seller profile
    seller_profile, created = SellerProfile.objects.get_or_create(
        organization=user.organization,
        defaults={'seller_since': timezone.now().date()}
    )

    # Define date range (last 12 months)
    end_date = timezone.now()
    start_date = end_date - timedelta(days=365)

    # 1. Query for total 'listValue' by month
    listings_monthly = (
        Listing.objects
        .filter(
            seller=seller_profile,
            sale_event__start_date__gte=start_date,
            sale_event__start_date__lte=end_date
        )
        .annotate(month=TruncMonth('sale_event__start_date'))
        .values('month')
        .annotate(
            listValue=Sum(F('reserve_price') * F('quantity_available'))
        )
        .order_by('month')
    )

    # 2. Query for 'soldListValue' by month (using listing's reserve price)
    sold_list_monthly = (
        OrderLineItem.objects
        .filter(
            order__seller=seller_profile,
            order__order_date__gte=start_date,
            order__order_date__lte=end_date,
            order__order_status__in=['confirmed', 'completed']
        )
        .annotate(month=TruncMonth('order__order_date'))
        .values('month')
        .annotate(
            soldListValue=Sum(F('listing__reserve_price') * F('quantity'))
        )
        .order_by('month')
    )

    # 3. Query for actual sales by month
    actual_sales_monthly = (
        OrderLineItem.objects
        .filter(
            order__seller=seller_profile,
            order__order_date__gte=start_date,
            order__order_date__lte=end_date,
            order__order_status__in=['confirmed', 'completed']
        )
        .annotate(month=TruncMonth('order__order_date'))
        .values('month')
        .annotate(
            actualSales=Sum(F('price') * F('quantity'))
        )
        .order_by('month')
    )

    # Convert querysets to dictionaries keyed by month
    def qs_to_dict(qs, value_key):
        return {row['month']: row[value_key] for row in qs}

    listings_map = qs_to_dict(listings_monthly, 'listValue')
    sold_list_map = qs_to_dict(sold_list_monthly, 'soldListValue')
    actual_sales_map = qs_to_dict(actual_sales_monthly, 'actualSales')

    # Collect all unique months
    all_months = sorted(set(listings_map.keys()) | set(sold_list_map.keys()) | set(actual_sales_map.keys()))
    
    # Format the response data
    results = []
    for month in all_months:
        month_str = month.strftime('%b %y')  # Format as "Jan '25"
        results.append({
            'month': month_str,
            'listValue': float(listings_map.get(month, 0) or 0),
            'soldListValue': float(sold_list_map.get(month, 0) or 0),
            'actualSales': float(actual_sales_map.get(month, 0) or 0)
        })

    return Response(results)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_seller_dashboard_tables(request):
    """
    Returns recent auctions, top products, and top buyers for the seller's dashboard.
    """
    user = request.user
    if not user.organization or user.role != 'seller':
        return Response({"error": "User is not a seller or has no organization"}, status=403)

    # Get or create seller profile
    seller_profile, created = SellerProfile.objects.get_or_create(
        organization=user.organization,
        defaults={'seller_since': timezone.now().date()}
    )

    # 1) Recent Auctions - Fixed query to join from Listing to SaleEvent
    recent_events = (
        SaleEvent.objects
        .filter(listing__seller=seller_profile)
        .distinct()
        .annotate(
            product_count=Count('listing__product', distinct=True),
            bid_count=Count('listing__bid', distinct=True)
        )
        .order_by('-end_date')[:5]
    )

    recent_auctions_data = []
    for event in recent_events:
        recent_auctions_data.append({
            "auctionId": f"AUC-{event.id}",
            "products": event.product_count,
            "totalBids": event.bid_count,
            "startDate": event.start_date.strftime('%Y-%m-%d'),
            "endDate": event.end_date.strftime('%Y-%m-%d'),
            "status": event.status.capitalize(),
        })

    # 2) Top Products
    top_products_qs = (
        OrderLineItem.objects
        .filter(
            order__seller=seller_profile,
            order__order_status__in=['confirmed', 'completed']
        )
        .values('listing__product', 'listing__product__name')
        .annotate(totalRevenue=Sum(F('price') * F('quantity')))
        .order_by('-totalRevenue')[:5]
    )

    # Get bid counts for products
    product_bids_qs = (
        Bid.objects
        .filter(listing__seller=seller_profile)
        .values('listing__product')
        .annotate(bidCount=Count('id'))
    )
    product_bids_map = {p['listing__product']: p['bidCount'] for p in product_bids_qs}

    top_products_data = []
    for row in top_products_qs:
        pid = row['listing__product']
        top_products_data.append({
            "productId": f"PRD-{pid}",
            "name": row['listing__product__name'],
            "totalRevenue": float(row['totalRevenue'] or 0),
            "totalBids": product_bids_map.get(pid, 0),
        })

    # 3) Top Buyers
    buyer_spent_qs = (
        OrderLineItem.objects
        .filter(
            order__seller=seller_profile,
            order__order_status__in=['confirmed', 'completed']
        )
        .values('order__buyer', 'order__buyer__organization__name')
        .annotate(totalSpent=Sum(F('price') * F('quantity')))
    )

    spent_map = {}
    for row in buyer_spent_qs:
        buyer_id = row['order__buyer']
        spent_map[buyer_id] = {
            'buyerName': row['order__buyer__organization__name'],
            'totalSpent': float(row['totalSpent'] or 0)
        }

    buyer_bids_qs = (
        Bid.objects
        .filter(listing__seller=seller_profile)
        .values('buyer')
        .annotate(totalBids=Count('id'))
    )
    bids_map = {b['buyer']: b['totalBids'] for b in buyer_bids_qs}

    # Sort by totalSpent desc
    sorted_buyers = sorted(spent_map.items(), key=lambda x: x[1]['totalSpent'], reverse=True)[:5]
    top_buyers_data = []
    for buyer_id, data in sorted_buyers:
        top_buyers_data.append({
            "buyerId": f"BUY-{buyer_id}",
            "name": data['buyerName'],
            "totalBids": bids_map.get(buyer_id, 0),
            "totalSpent": data['totalSpent']
        })

    return Response({
        "recentAuctions": recent_auctions_data,
        "topProducts": top_products_data,
        "topBuyers": top_buyers_data
    })

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'seller':
            return Document.objects.filter(listing__seller__organization=user.organization)
        elif user.role == 'buyer':
            return Document.objects.filter(listing__listing_status='active')
        return Document.objects.all()

class SellerNetworkView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get the current user's seller profile
        seller_profile = request.user.organization.sellerprofile
        
        # Get active network relationships
        active_network = SellerBuyerNetwork.objects.filter(
            seller=seller_profile,
            status='active'
        )
        
        # Get pending requests (where buyer requested to join)
        pending_requests = SellerBuyerNetwork.objects.filter(
            seller=seller_profile,
            status='pending',
            requested_by__isnull=False
        )
        
        # Get pending invitations (where seller invited buyer)
        pending_invites = SellerBuyerNetwork.objects.filter(
            seller=seller_profile,
            status='pending',
            invited_by__isnull=False
        )
        
        # Serialize the data
        active_network_data = SellerBuyerNetworkSerializer(active_network, many=True).data
        pending_requests_data = SellerBuyerNetworkSerializer(pending_requests, many=True).data
        pending_invites_data = SellerBuyerNetworkSerializer(pending_invites, many=True).data
        
        return Response({
            'active_network': active_network_data,
            'pending_requests': pending_requests_data,
            'pending_invites': pending_invites_data
        })
    
    def post(self, request):
        # Handle adding a buyer to the network
        seller_profile = request.user.organization.sellerprofile
        buyer_id = request.data.get('buyer_id')
        
        try:
            buyer_profile = BuyerProfile.objects.get(id=buyer_id)
            
            # Check if relationship already exists
            existing = SellerBuyerNetwork.objects.filter(
                seller=seller_profile,
                buyer=buyer_profile
            ).first()
            
            if existing:
                # Update status to active if it was pending or rejected
                if existing.status != 'active':
                    existing.status = 'active'
                    existing.invited_by = request.user
                    existing.save()
                    return Response(SellerBuyerNetworkSerializer(existing).data)
                return Response(SellerBuyerNetworkSerializer(existing).data)
            
            # Create new relationship
            network = SellerBuyerNetwork.objects.create(
                seller=seller_profile,
                buyer=buyer_profile,
                status='active',
                invited_by=request.user
            )
            
            return Response(SellerBuyerNetworkSerializer(network).data, status=status.HTTP_201_CREATED)
            
        except BuyerProfile.DoesNotExist:
            return Response(
                {'error': 'Buyer not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, relationship_id=None):
        # Handle removing a buyer from the network
        seller_profile = request.user.organization.sellerprofile
        
        try:
            network = SellerBuyerNetwork.objects.get(
                id=relationship_id,
                seller=seller_profile
            )
            network.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except SellerBuyerNetwork.DoesNotExist:
            return Response(
                {'error': 'Network relationship not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def patch(self, request, relationship_id=None):
        # Handle approving or rejecting a request
        seller_profile = request.user.organization.sellerprofile
        action = request.data.get('action')  # 'approve' or 'reject'
        
        try:
            network = SellerBuyerNetwork.objects.get(
                id=relationship_id,
                seller=seller_profile,
                status='pending'
            )
            
            if action == 'approve':
                network.status = 'active'
            elif action == 'reject':
                network.status = 'rejected'
            else:
                return Response(
                    {'error': 'Invalid action'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            network.save()
            return Response(SellerBuyerNetworkSerializer(network).data)
            
        except SellerBuyerNetwork.DoesNotExist:
            return Response(
                {'error': 'Network relationship not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class BuyerSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({'results': []})
        
        # Search for buyers by organization name or email
        organizations = Organization.objects.filter(
            is_buyer=True,
            name__icontains=query
        )[:10]  # Limit results
        
        # Get buyer profiles for these organizations
        buyer_profiles = BuyerProfile.objects.filter(
            organization__in=organizations
        )
        
        # Format the results
        results = []
        for profile in buyer_profiles:
            results.append({
                'id': profile.id,
                'name': profile.organization.name,
                'email': profile.organization.contact_email
            })
        
        return Response({'results': results})

class BulkUploadBuyersView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        seller_profile = request.user.organization.sellerprofile
        buyers_data = request.data.get('buyers', [])
        
        if not buyers_data:
            return Response(
                {'error': 'No buyers data provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = {
            'success': [],
            'failed': []
        }
        
        for buyer_data in buyers_data:
            company_name = buyer_data.get('company_name')
            contact_email = buyer_data.get('contact_email')
            
            if not company_name or not contact_email:
                results['failed'].append({
                    'data': buyer_data,
                    'reason': 'Missing company name or email'
                })
                continue
            
            try:
                # Check if organization exists
                organization = Organization.objects.filter(
                    email=contact_email,
                    is_buyer=True
                ).first()
                
                if not organization:
                    # Create a new organization and buyer profile
                    organization = Organization.objects.create(
                        name=company_name,
                        email=contact_email,
                        is_buyer=True,
                        is_seller=False
                    )
                    
                    buyer_profile = BuyerProfile.objects.create(
                        organization=organization
                    )
                else:
                    # Get existing buyer profile
                    buyer_profile = BuyerProfile.objects.get(organization=organization)
                
                # Check if network relationship already exists
                existing = SellerBuyerNetwork.objects.filter(
                    seller=seller_profile,
                    buyer=buyer_profile
                ).first()
                
                if existing:
                    # Update status to active if it was pending or rejected
                    if existing.status != 'active':
                        existing.status = 'active'
                        existing.invited_by = request.user
                        existing.save()
                    
                    results['success'].append({
                        'id': existing.id,
                        'name': organization.name,
                        'email': organization.email,
                        'status': 'updated'
                    })
                else:
                    # Create new relationship
                    network = SellerBuyerNetwork.objects.create(
                        seller=seller_profile,
                        buyer=buyer_profile,
                        status='active',
                        invited_by=request.user
                    )
                    
                    results['success'].append({
                        'id': network.id,
                        'name': organization.name,
                        'email': organization.email,
                        'status': 'created'
                    })
                
            except Exception as e:
                results['failed'].append({
                    'data': buyer_data,
                    'reason': str(e)
                })
        
        return Response(results)

class AuctionTruckView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, auction_id):
        try:
            auction = SaleEvent.objects.get(id=auction_id)
            serializer = AuctionTruckSerializer(auction)
            return Response(serializer.data)
        except SaleEvent.DoesNotExist:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)

class BuyerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Ensure the user is a buyer
        if request.user.role != 'buyer':
            return Response(
                {"error": "Only buyers can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get active listings
        listings = Listing.objects.filter(
            listing_status='active',
            sale_event__status='open'
        ).select_related(
            'product', 
            'seller', 
            'seller__organization',
            'sale_event'
        )
        
        # Serialize the listings with network status
        serializer = BuyerDashboardListingSerializer(
            listings, 
            many=True, 
            context={'request': request}
        )
        
        # Get favorite sellers (sellers the buyer has an active network relationship with)
        try:
            buyer_profile = BuyerProfile.objects.get(organization=request.user.organization)
            favorite_sellers = SellerProfile.objects.filter(
                network_relationships__buyer=buyer_profile,
                network_relationships__status='active'
            ).select_related('organization')
            
            favorite_sellers_data = [
                {
                    'id': seller.id,
                    'name': seller.organization.name
                }
                for seller in favorite_sellers
            ]
        except BuyerProfile.DoesNotExist:
            favorite_sellers_data = []
        
        return Response({
            'listings': serializer.data,
            'favorite_sellers': favorite_sellers_data
        })

class RequestNetworkJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Ensure the user is a buyer
        if request.user.role != 'buyer':
            return Response(
                {"error": "Only buyers can request to join a network"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        seller_id = request.data.get('seller_id')
        if not seller_id:
            return Response(
                {"error": "Seller ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            seller = SellerProfile.objects.get(id=seller_id)
        except SellerProfile.DoesNotExist:
            return Response(
                {"error": "Seller not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            buyer_profile = BuyerProfile.objects.get(organization=request.user.organization)
        except BuyerProfile.DoesNotExist:
            return Response(
                {"error": "Buyer profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if a network relationship already exists
        network_rel, created = SellerBuyerNetwork.objects.get_or_create(
            seller=seller,
            buyer=buyer_profile,
            defaults={
                "status": "pending",
                "requested_by": request.user
            }
        )
        
        # If the record already exists, update if needed
        if not created:
            if network_rel.status == 'rejected':
                network_rel.status = 'pending'
                network_rel.requested_by = request.user
                network_rel.save()
                return Response({"message": "Network request resubmitted"})
            elif network_rel.status == 'pending':
                return Response({"message": "Network request already pending"})
            elif network_rel.status == 'active':
                return Response({"message": "Already in network with this seller"})
        
        return Response({"message": "Network request submitted"})
