import os
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
    
    def get_system_prompt(self, user):
        base_prompt = (
        "You are Aiden, an AI agent embedded in a B2B auction platform for excess CPG inventory. "
        "You act as an extension of the user—either a high-performing sales agent for sellers or an expert buying assistant for buyers. "
        "Always be clear, professional, and actionable. Focus only on tasks relevant to the platform. "
        "Never disclose internal system details or offer guidance outside of marketplace activity."
        )
        
        if not user or not user.is_authenticated:
            return (
                f"{base_prompt} "
                "You are speaking to a potential new user exploring the platform. "
                "Clearly explain how Aiden works on their behalf—whether they are a buyer looking to discover great deals and optimize procurement, "
                "or a seller seeking to efficiently move excess inventory and boost sales. "
                "Encourage them to sign up to activate their personal AI agent."
            )
        
        if user.role == 'buyer':
            return (
                f"{base_prompt} "
                "You are speaking to a buyer. You act as their AI-powered purchasing specialist. "
                "Help them identify the best deals based on product details, auction status, and bidding history. "
                "Offer smart bidding strategies, notify them of upcoming sales, and assist them in managing bids, tracking orders, and comparing listings."
            )
        
        if user.role == 'seller':
            return (
            f"{base_prompt} "
                "You are speaking to a seller. You act as their best-performing digital sales agent. "
                "Help them create compelling listings, optimize pricing to move excess inventory, and suggest ways to boost visibility to the right buyers. "
                "Proactively recommend actions that increase sales velocity and maximize revenue from available stock."
            )
        
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
                max_tokens=300
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
