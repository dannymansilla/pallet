from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Order, OrderLineItem
from apps.auctions.models import OptimizedLoad, SaleEvent
from apps.inventory.models import BuyerProfile, SellerProfile
from django.db.models.functions import TruncMonth
import logging

logger = logging.getLogger(__name__)

class AuctionTrucksView(APIView):
    """
    API endpoint for retrieving auction trucks data.
    This view aggregates data from both OptimizedLoad and Order models
    to provide a complete view of trucks associated with an auction.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, auction_id):
        try:
            # Get the auction
            auction = SaleEvent.objects.get(id=auction_id)
            
            # Get the current user's profile
            user = request.user
            if user.role == 'seller':
                profile = user.organization.sellerprofile
            elif user.role == 'buyer':
                profile = user.organization.buyerprofile
            else:
                return Response(
                    {'error': 'User must be a seller or buyer'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get optimized loads for this auction
            optimized_loads = OptimizedLoad.objects.filter(sale_event=auction)
            
            # If user is a seller, filter loads for this seller
            if user.role == 'seller':
                optimized_loads = optimized_loads.filter(
                    items__listing__seller=profile
                ).distinct()
            
            # If user is a buyer, filter loads for this buyer
            if user.role == 'buyer':
                optimized_loads = optimized_loads.filter(buyer=profile)
            
            # Group loads by month
            loads_by_month = {}
            for load in optimized_loads:
                # Use created_at date for grouping
                month_key = load.created_at.strftime('%Y-%m')
                
                if month_key not in loads_by_month:
                    loads_by_month[month_key] = []
                
                # Get order if it exists
                order = None
                try:
                    order = Order.objects.get(optimized_load=load)
                except Order.DoesNotExist:
                    pass
                
                # Get items for this load
                items = []
                for item in load.items.all():
                    # If user is a seller, only include items for this seller
                    if user.role == 'seller' and item.listing.seller != profile:
                        continue
                    
                    items.append({
                        'brand': item.listing.product.brand,
                        'productName': item.listing.product.name,
                        'pricePerPallet': float(item.listing.reserve_price or 0),
                        'pallets': item.allocated_quantity,
                    })
                
                # Skip if no items (for seller view)
                if not items:
                    continue
                
                # Add to month data
                loads_by_month[month_key].append({
                    'buyer': load.buyer.organization.name,
                    'orderId': f"O-{order.id}" if order else f"L-{load.id}",
                    'numTrucks': 1,  # Each load represents one truck
                    'totalValue': float(load.load_value or 0),
                    'paymentDue': (load.created_at + timedelta(days=30)).strftime('%Y-%m-%d'),
                    'isPaid': order.order_status == 'completed' if order else load.truckload_status == 'delivered',
                    'items': items
                })
            
            # Convert to list of months
            months_data = [
                {
                    'month': month,
                    'orders': orders
                }
                for month, orders in loads_by_month.items()
            ]
            
            # Sort months in descending order
            months_data.sort(key=lambda x: x['month'], reverse=True)
            
            # Calculate auction summary
            auction_summary = {
                'auction_name': auction.name,
                'auction_closed': auction.end_date.strftime('%Y-%m-%d'),
                'total_trucks': optimized_loads.count(),
                'total_buyers_awarded': optimized_loads.values('buyer').distinct().count(),
                'total_auction_revenue': sum(load.load_value or 0 for load in optimized_loads)
            }
            
            return Response({
                'auction_summary': auction_summary,
                'months': months_data
            })
            
        except SaleEvent.DoesNotExist:
            return Response(
                {'error': 'Auction not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SellerTrucksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Check if user has a seller profile through their organization
            logger.info(f"Checking seller profile for user: {request.user.id}")
            seller_profile = SellerProfile.objects.filter(organization=request.user.organization).first()
            if not seller_profile:
                logger.warning(f"No seller profile found for user's organization: {request.user.organization.id}")
                return Response(
                    {"error": "User's organization does not have a seller profile"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            logger.info(f"Found seller profile: {seller_profile.id}")
            
            # Get all completed orders for this seller
            orders = Order.objects.filter(
                seller=seller_profile,
                order_status='completed'
            ).select_related(
                'buyer',
                'buyer__organization'
            ).prefetch_related(
                'line_items',
                'line_items__listing',
                'line_items__listing__product'
            )
            
            logger.info(f"Found {orders.count()} completed orders")

            # Group orders by month
            orders_by_month = {}
            for order in orders:
                try:
                    # Get the month-year string (e.g., "2025-03")
                    month = order.order_date.strftime("%Y-%m")
                    
                    if month not in orders_by_month:
                        orders_by_month[month] = {
                            "month": month,
                            "orders": []
                        }
                    
                    # Build the order data
                    order_data = {
                        "buyer": order.buyer.organization.name,
                        "orderId": f"O-S{order.id:04d}",
                        "numTrucks": order.num_trucks or 1,  # Default to 1 if not specified
                        "totalValue": float(order.total_price),
                        "paymentDue": None,  # We'll need to add this back when we have invoice functionality
                        "isPaid": order.order_status == 'completed',  # For now, consider completed orders as paid
                        "items": []
                    }
                    
                    # Add line items
                    for line_item in order.line_items.all():
                        product = line_item.listing.product
                        item_data = {
                            "brand": product.brand,
                            "productName": product.name,
                            "pricePerPallet": float(line_item.price),
                            "pallets": line_item.quantity,
                            "totalValue": float(line_item.price * line_item.quantity)
                        }
                        order_data["items"].append(item_data)
                    
                    orders_by_month[month]["orders"].append(order_data)
                except Exception as e:
                    logger.error(f"Error processing order {order.id}: {str(e)}")
                    continue
            
            # Calculate auction summary
            total_trucks = sum(order.num_trucks or 1 for order in orders)
            total_buyers = orders.values('buyer').distinct().count()
            total_revenue = sum(float(order.total_price) for order in orders)
            
            logger.info(f"Calculated summary: {total_trucks} trucks, {total_buyers} buyers, ${total_revenue} revenue")
            
            # Build the final response
            response_data = {
                "auction_summary": {
                    "auction_name": "Seller Trucks History",
                    "auction_closed": datetime.now().strftime("%Y-%m-%d"),
                    "total_trucks": total_trucks,
                    "total_buyers_awarded": total_buyers,
                    "total_auction_revenue": total_revenue
                },
                "months": list(orders_by_month.values())
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error in SellerTrucksView: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BuyerTrucksView(APIView):
    """
    API endpoint for retrieving buyer trucks data.
    This view aggregates data from both OptimizedLoad and Order models
    to provide a complete view of trucks associated with a buyer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Get the current user's buyer profile
            user = request.user
            if user.role != 'buyer':
                return Response(
                    {'error': 'User must be a buyer'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            buyer_profile = user.organization.buyerprofile
            
            # Get optimized loads for this buyer
            optimized_loads = OptimizedLoad.objects.filter(buyer=buyer_profile)
            
            # Group loads by month
            loads_by_month = {}
            for load in optimized_loads:
                # Use created_at date for grouping
                month_key = load.created_at.strftime('%Y-%m')
                
                if month_key not in loads_by_month:
                    loads_by_month[month_key] = []
                
                # Get order if it exists
                order = None
                try:
                    order = Order.objects.get(optimized_load=load)
                except Order.DoesNotExist:
                    pass
                
                # Get items for this load
                items = []
                for item in load.items.all():
                    items.append({
                        'brand': item.listing.product.brand,
                        'name': item.listing.product.name,
                        'awarded_price_per_unit': float(item.listing.reserve_price or 0),
                        'pallets': item.allocated_quantity,
                    })
                
                # Add to month data
                loads_by_month[month_key].append({
                    'seller_name': load.sale_event.seller.organization.name,
                    'truck_id': f"T-{load.id}",
                    'truck_total_cost': float(load.load_value or 0),
                    'items': items
                })
            
            # Convert to list of months
            months_data = [
                {
                    'month': month,
                    'orders': orders
                }
                for month, orders in loads_by_month.items()
            ]
            
            # Sort months in descending order
            months_data.sort(key=lambda x: x['month'], reverse=True)
            
            # Calculate buyer summary
            buyer_summary = {
                'buyer_name': buyer_profile.organization.name,
                'total_trucks': optimized_loads.count(),
                'total_units': sum(
                    sum(item.allocated_quantity for item in load.items.all())
                    for load in optimized_loads
                ),
                'total_spent': sum(float(load.load_value or 0) for load in optimized_loads)
            }
            
            return Response({
                'buyer_summary': buyer_summary,
                'months': months_data
            })
            
        except Exception as e:
            logger.error(f"Error in BuyerTrucksView: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
