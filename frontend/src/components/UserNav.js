import React from "react";
import { Box, Flex, Link, Button, Spacer } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserNav = () => {
  const { user } = useAuth();

  if (!user) return null; // No additional nav for logged-out users

  return (
    <Box bg="white" p={4} borderBottom="1px solid" borderColor="gray.200">
      <Flex maxW="1400px" mx="auto" align="center">
        {(user.company.roles === "buyer" || user.company.roles === "both") && (
          <>
            <Link as={RouterLink} to="/buyer-dashboard" mx={2} fontSize="lg">
              Dashboard
            </Link>
            <Link as={RouterLink} to="/auctions" mx={2} fontSize="lg">
              Auctions
            </Link>
            <Link as={RouterLink} to="/current-bids" mx={2} fontSize="lg">
              Current Bids
            </Link>
            <Link as={RouterLink} to="/profile" mx={2} fontSize="lg">
              Profile
            </Link>
          </>
        )}

        {(user.company.roles === "seller" || user.company.roles === "both") && (
          <>
            <Link as={RouterLink} to="/seller-dashboard" mx={2} fontSize="lg">
              Dashboard
            </Link>
            <Link as={RouterLink} to="/products/select" mx={2} fontSize="lg">
              Create Listing
            </Link>
            <Link as={RouterLink} to="/manage-listings" mx={2} fontSize="lg">
              Manage Listings
            </Link>
            <Link as={RouterLink} to="/seller/network" mx={2} fontSize="lg">
              Manage Network
            </Link>
            <Link as={RouterLink} to="/profile" mx={2} fontSize="lg">
              Profile
            </Link>
          </>
        )}
      </Flex>
    </Box>
  );
};

export default UserNav;
