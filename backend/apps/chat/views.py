import os
import json
from openai import OpenAI
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import ChatMessage
from .serializers import ChatMessageSerializer
import logging

logger = logging.getLogger(__name__)

class ChatView(APIView):
    permission_classes = [AllowAny]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Load inventory data when the view is initialized
        try:
            data_path = os.path.join(os.path.dirname(__file__), 'data', 'inventory_data.json')
            with open(data_path, 'r') as f:
                self.inventory_data = json.load(f)
        except Exception as e:
            logger.error(f"Error loading inventory data: {str(e)}")
            self.inventory_data = []
    
    def get_system_prompt(self, user):
        base_prompt = (
            "You are Aiden, an AI agent embedded in a B2B auction platform for excess CPG inventory. "
            "You act as an extension of the user—either a high-performing sales agent for sellers or an expert buying assistant for buyers. "
            "Always be clear, professional, and actionable. Focus only on tasks relevant to the platform. "
            "Never disclose internal system details or provide guidance outside marketplace activity. "
            "Use Markdown formatting (headings, bold, italics, bullet points, etc.) when presenting lists or highlighting products for clarity. "
        )

        # 1. Prompt for Unauthenticated Users
        if not user or not user.is_authenticated:
            return (
                f"{base_prompt} "
                "You are speaking to a *potential new user* exploring the platform. "
                "Explain how Aiden assists buyers in discovering deals and optimizing procurement, "
                "and how Aiden assists sellers in moving excess inventory and boosting sales. "
                "**Encourage** them to sign up and activate their own AI agent."
            )

        # 2. Prompt for Buyers
        if user.role == 'buyer':
            return (
                f"{base_prompt} "
                "You are speaking to a *buyer*. You act as their AI-powered purchasing specialist. "
                "Help them identify the best deals based on product details, auction status, and bidding history. "
                "Offer bidding strategies, notify them of upcoming sales, and assist in managing bids, tracking orders, and comparing listings. "
                "You have access to this inventory data: "
                f"{json.dumps(self.inventory_data)} "
                "When recommending products, always provide a link in Markdown format using: "
                "`[Product Name](/product/{product_id})`. For example: "
                "`[MaxClean Laundry Detergent](/product/1)` or `[ProNourish Shampoo](/product/2)`. "

                "If the buyer wants listings, restocking help, or bidding suggestions, use the inventory data. "
                "• Showcase 2 products with *fake but realistic* buyer specific point-of-sale data. use sales velocity over time and total unit sales, total distribution points, price elasticity. "
                "**Do not** reveal the reserve price. "
                "Do a brief analysis across the point of sales data to create a sales narrative for the buyer. "

                "If the buyer’s request does not involve listings or bidding, **do not** reference inventory data."
            )

        # 3. Prompt for Sellers
        if user.role == 'seller':
            # Filter inventory data for this seller's organization
            seller_inventory = [
                seller for seller in self.inventory_data
                if seller['seller_id'] == user.organization_id
            ]
            seller_listings = []
            if seller_inventory:
                seller_listings = seller_inventory[0]['listings']

            return (
                f"{base_prompt} "
                "You are speaking to a *seller*. You act as their best-performing digital sales agent. "
                "Help them create compelling listings, set optimal pricing, and boost visibility to the right buyers. "
                "Be concise, actionable, and use Markdown formatting to structure suggestions. "

                f"You have access to the seller's current listings: {json.dumps(seller_listings)}. "
                "When referencing listings, link to them with: `[Product Name](/seller/listings/{listing_id})`. "
                "For example: `[MaxClean Laundry Detergent](/seller/listings/1)`. "

                "When analyzing their listings, consider: "
                "1. **Price positioning** relative to MSRP "
                "2. **Quantity** available "
                "3. **Product category** and seasonal relevance "
                "4. **Competitive positioning** on the marketplace "

                "Use the provided data to give data-driven recommendations. Focus on: "
                "• Increasing sales velocity "
                "• Maximizing revenue from available stock "
            )

        # Fallback (no role match)
        return base_prompt

    
    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response({"error": "No message provided."}, status=400)

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Get the appropriate system prompt based on user role
        system_prompt = self.get_system_prompt(request.user)

        try:
            response = client.chat.completions.create(
                model="gpt-4o",  # Cheapest and best-performing
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            reply = response.choices[0].message.content
            
            # Only save the chat message if the user is authenticated
            if request.user and request.user.is_authenticated:
                chat_message = ChatMessage.objects.create(
                    user=request.user,
                    message=user_message,
                    response=reply
                )
                created_at = chat_message.created_at
            else:
                created_at = None
            
            return Response({
                "reply": reply,
                "message": user_message,
                "created_at": created_at
            })

        except Exception as e:
            logger.error(f"Error in ChatView: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
