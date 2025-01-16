import React from "react";
import { Box, Flex, Heading, Link, Image, Button, Spacer, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import logo from '../images/logo.png';
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <Box bg="white" color="black" w="100%" p={4} borderBottom="1px solid" borderColor="gray.200">
      <Flex maxW="1400px" mx="auto" align="center">
        {/* Logo */}
        <Image
            src={logo} 
            alt="Pallet Marketplace Logo"
            boxSize="40px" // Adjust size as needed
            mr={2} // Margin-right for spacing
          />
        <Heading as={RouterLink} to="/" size="lg" letterSpacing="wider">
          Pallet
        </Heading>
        <Spacer />

        {/* General Links */}
        <Flex align="center">
          <Link as={RouterLink} to="/details" mx={2} fontSize="lg" _hover={{ textDecoration: "underline" }}>
            Product
          </Link>
          <Link as={RouterLink} to="/team" mx={2} fontSize="lg" _hover={{ textDecoration: "underline" }}>
            Team
          </Link>

          {/* Conditional Links for Authenticated Users */}
          {user ? (
            <>
              {(user.company.roles.includes("buyer") || user.company.roles.includes("both")) && (
                <Menu>
                  <MenuButton
                    as={Button}
                    mx={2}
                    variant="outline"
                    borderColor="black"
                    color="black"
                    _hover={{ bg: "gray.100" }}
                    _active={{ bg: "gray.200" }}
                    borderRadius="md"
                  >
                    Buyer Actions
                  </MenuButton>
                  <MenuList bg="white" color="black" borderColor="gray.200" zIndex="dropdown">
                    <MenuItem as={RouterLink} to="/buyer-dashboard">Dashboard</MenuItem>
                    <MenuItem as={RouterLink} to="/auction">Auctions</MenuItem>
                    <MenuItem as={RouterLink} to="/current-bids">Current Bids</MenuItem>
                  </MenuList>
                </Menu>
              )}
              {(user.company.roles.includes("seller") || user.company.roles.includes("both")) && (
                <Menu>
                  <MenuButton
                    as={Button}
                    mx={2}
                    variant="outline"
                    borderColor="black"
                    color="black"
                    _hover={{ bg: "gray.100" }}
                    _active={{ bg: "gray.200" }}
                    borderRadius="md"
                  >
                    Seller Actions
                  </MenuButton>
                  <MenuList bg="white" color="black" borderColor="gray.200" zIndex="dropdown">
                    <MenuItem as={RouterLink} to="/seller-dashboard">Dashboard</MenuItem>
                    <MenuItem as={RouterLink} to="/products/select">Create Listing</MenuItem>
                    <MenuItem as={RouterLink} to="/seller/manage-listings">Manage Listings</MenuItem>
                    <MenuItem as={RouterLink} to="/seller/network">Manage Network</MenuItem>
                  </MenuList>
                </Menu>
              )}
              <Button onClick={logout} ml={4} bg="black" color="white" _hover={{ bg: "gray.800" }}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              as={RouterLink}
              to="/login"
              ml={4}
              bg="black"
              color="white"
              _hover={{ bg: "gray.800" }}
              borderRadius="md"
            >
              Login
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
