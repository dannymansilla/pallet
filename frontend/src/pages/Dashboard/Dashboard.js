import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext"; 
import SellerDashboard from "../../components/SellerPortal/SellerDashboard";
import BuyerDashboard from "../../components/BuyerPortal/BuyerDashboard";

export default function UnifiedDashboard() {
  const { user } = useAuth();

  // If user isn't logged in or no user data, bail out early
  if (!user) {
    return <Box p={8}><Text>Please log in to view the dashboard.</Text></Box>;
  }

  // If account is pending approval
  if (user.organization?.approval_status === "pending") {
    return (
      <Box p={8}>
        <Text>Your account is pending approval. Please check back later.</Text>
      </Box>
    );
  }

  // Check roles based on both role field and organization settings
  const isBuyer = user.role === 'buyer' || user.organization?.is_buyer;
  const isSeller = user.role === 'seller' || user.organization?.is_seller;

  return (
    <Box p={0}>
      {isSeller && <SellerDashboard />}
      {isBuyer && <BuyerDashboard />}
      
      {/* Show error if no valid role */}
      {!isSeller && !isBuyer && (
        <Text>
          You do not have any Buyer or Seller roles assigned. Please contact support.
        </Text>
      )}
    </Box>
  );
}
