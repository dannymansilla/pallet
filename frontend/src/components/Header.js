import React from "react";
import { Box, Flex, Heading, Link, Button, HStack, Divider } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  console.log(user);

  return (
    <Box bg="white" w="100%" >
      {/* Header */}
      <Flex maxW="1400px" mx="auto" align="center" p={4}>
        {/* Logo */}
        <Flex align="center">
          <Heading as={NavLink} to="/" size="lg" fontFamily="logo" letterSpacing="-2px" _hover={{ textDecoration: "none" }}>
            aiden
          </Heading>
        </Flex>

        <Flex ml="auto" gap={4} align="center">
          {/* Global Navigation */}
          <Link
          as={NavLink}
            to="/details"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                : { color: "black", padding: "8px 12px" }
            }
            _hover={{ textDecoration: "underline" }} 
          >
            Product
          </Link>
          <Link
          as={NavLink}
            to="/team"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                : { color: "black", padding: "8px 12px" }
            }
            _hover={{ textDecoration: "underline" }} 
          >
            About Us
          </Link>

          {/* User-Specific Actions */}
          {user ? (
            <>
              <Link
              as={NavLink}
                to="/profile"
                style={({ isActive }) =>
                  isActive
                    ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "8px 12px" }
                    : { color: "black", padding: "8px 12px" }
                }
                _hover={{ textDecoration: "underline" }} 
              >
                Profile
              </Link>
              <Button onClick={logout} bg="black" color="white" _hover={{ bg: "gray.800" }}>
                Logout
              </Button>
            </>
          ) : (
            <>
            <Link
              as={NavLink}
              to="/contact"
              style={({ isActive }) => ({
                background: isActive ? "#3182ce" : "transparent",
                color: isActive ? "white" : "black",
                borderRadius: isActive ? "8px" : "none",
                padding: "8px 12px",
              })}
              _hover={{ textDecoration: "underline" }} // Add hover effect
            >
              Contact Us
            </Link>
            <Button
              as={NavLink}
              to="/login"
            >
              Login
            </Button>
            </>
          )}
        </Flex>
      </Flex>

      <Divider borderBottom="1px solid #999" />


      {/* Horizontal Navigation for Role-Specific Links */}
      {user !== null && user.company.status === 'approved' && (
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
              {(user?.company.roles.includes("seller") || user?.company.roles.includes("both")) && (
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
