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

  // Check roles
  const hasBuyerRole =
    user.company.roles.includes("buyer") || user.company.roles.includes("both");
  const hasSellerRole =
    user.company.roles.includes("seller") || user.company.roles.includes("both");

  // Basic logic: if they have the seller role, show Seller; if they have buyer role, show Buyer
  // If a user has BOTH, we can show both. Or you could implement tabs, or a toggle, etc.

  return (
    <Box bg="white" minH="100vh" p={6}>
      {/* This container ensures some spacing/padding */}
      {/* If you want a max width, add something like maxW="1400px" mx="auto" here */}
      
      {hasSellerRole && <SellerDashboard />}

      {hasBuyerRole && <BuyerDashboard />}
      
      {/* If a user doesn't have either role, maybe show an error or message */}
      {!hasSellerRole && !hasBuyerRole && (
        <Text>
          You do not have any Buyer or Seller roles assigned. Contact support.
        </Text>
      )}
    </Box>
  );
}
