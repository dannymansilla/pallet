import React from "react";
import { Box, Flex, Heading, Link, Image, Button, HStack, Divider } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../images/logo.png";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <Box bg="white" w="100%" >
      {/* Header */}
      <Flex maxW="1400px" mx="auto" align="center" px={6} py={2}>
        {/* Logo */}
        <Flex align="center">
          <Image src={logo} alt="Pallet Logo" boxSize="40px" mr={2} />
          <Heading as={NavLink} to="/" size="lg" letterSpacing="wider" _hover={{ textDecoration: "none" }}>
            Pallet
          </Heading>
        </Flex>

        <Flex ml="auto" gap={4} align="center">
          {/* Global Navigation */}
          <NavLink
            to="/details"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                : { color: "black", padding: "8px 12px" }
            }
          >
            Product
          </NavLink>
          <NavLink
            to="/team"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                : { color: "black", padding: "8px 12px" }
            }
          >
            Team
          </NavLink>

          {/* User-Specific Actions */}
          {user ? (
            <>
              <NavLink
                to="/profile"
                style={({ isActive }) =>
                  isActive
                    ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                    : { color: "black", padding: "8px 12px" }
                }
              >
                Profile
              </NavLink>
              <Button onClick={logout} bg="black" color="white" _hover={{ bg: "gray.800" }}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              as={NavLink}
              to="/login"
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

      {/* <Divider borderBottom="1px solid black" /> */}


      {/* Horizontal Navigation for Role-Specific Links */}
      {user && (
        <Box>
          <Divider borderBottom="1px solid black" />

        <Box bg="brand.background_color" py={2}>
          <Flex maxW="1400px" mx="auto" px={6} align="center">
            <HStack spacing={8}>
              {(user?.company.roles.includes("buyer") || user?.company.roles.includes("both")) && (
                <>
                  <NavLink
                    to="/buyer-dashboard"
                    style={({ isActive }) =>
                      isActive
                        ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                        : { color: "black", padding: "8px 12px" }
                    }
                  >
                    Buyer Dashboard
                  </NavLink>
                  <NavLink
                    to="/auction"
                    style={({ isActive }) =>
                      isActive
                        ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                        : { color: "black", padding: "8px 12px" }
                    }
                  >
                    Auctions
                  </NavLink>
                  <NavLink
                    to="/current-bids"
                    style={({ isActive }) =>
                      isActive
                        ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                        : { color: "black", padding: "8px 12px" }
                    }
                  >
                    Current Bids
                  </NavLink>
                </>
              )}
              {(user?.company.roles.includes("buyer") || user?.company.roles.includes("both")) && (
                <>
                  <NavLink
                    to="/seller-dashboard"
                    style={({ isActive }) =>
                      isActive
                        ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                        : { color: "black", padding: "8px 12px" }
                    }
                  >
                    Seller Dashboard
                  </NavLink>
                  <NavLink
                    to="/products/select"
                    style={({ isActive }) =>
                      isActive
                        ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                        : { color: "black", padding: "8px 12px" }
                    }
                  >
                    Create Listing
                  </NavLink>
                  <NavLink
                    to="/seller/manage-listings"
                    style={({ isActive }) =>
                      isActive
                        ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                        : { color: "black", padding: "8px 12px" }
                    }
                  >
                    Manage Listings
                  </NavLink>
                  <NavLink
                    to="/seller/network"
                    style={({ isActive }) =>
                      isActive
                        ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                        : { color: "black", padding: "8px 12px" }
                    }
                  >
                    Manage Network
                  </NavLink>
                </>
              )}
            </HStack>
          </Flex>
        </Box>
        <Divider borderBottom="1px solid black" />
        </Box>
      )}
    </Box>
  );
};

export default Header;
