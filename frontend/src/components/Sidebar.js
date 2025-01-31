import React from "react";
import { Box, List, ListItem, Link, Heading } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Heading size="md" mb={4}>
        Actions
      </Heading>
      <List spacing={3}>
        {(user?.company.roles.includes("buyer") || user?.company.roles.includes("both")) && (
          <>
            <ListItem>
              <Link as={RouterLink} to="/buyer-dashboard">Buyer Dashboard</Link>
            </ListItem>
            <ListItem>
              <Link as={RouterLink} to="/auction">Auctions</Link>
            </ListItem>
            <ListItem>
              <Link as={RouterLink} to="/current-bids">Current Bids</Link>
            </ListItem>
          </>
        )}
        {(user?.company.roles.includes("seller") || user?.company.roles.includes("both")) && (
          <>
            <ListItem>
              <Link as={RouterLink} to="/seller-dashboard">Seller Dashboard</Link>
            </ListItem>
            <ListItem>
              <Link as={RouterLink} to="/products/select">Create Listing</Link>
            </ListItem>
            <ListItem>
              <Link as={RouterLink} to="/seller/manage-listings">Manage Listings</Link>
            </ListItem>
            <ListItem>
              <Link as={RouterLink} to="/seller/network">Manage Network</Link>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
};

export default Sidebar;
