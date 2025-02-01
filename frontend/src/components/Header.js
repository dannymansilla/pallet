import React from "react";
import {
  Box,
  Flex,
  Heading,
  Link,
  Button,
  HStack,
  Divider,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  useDisclosure,
  Image, // Import the Image component
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import aidenlogo from "../images/aiden_logo.png";

const Header = () => {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Define the main navigation links so we can reuse them in both desktop and mobile views.
  const mainNavLinks = (
    <>
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
            to="/requestdemo"
            style={({ isActive }) => ({
              background: isActive ? "#3182ce" : "transparent",
              color: isActive ? "white" : "black",
              borderRadius: isActive ? "8px" : "none",
              padding: "8px 12px",
            })}
            _hover={{ textDecoration: "underline" }}
          >
            Request a demo
          </Link>
          <Button as={NavLink} to="/login">
            Login
          </Button>
        </>
      )}
    </>
  );

  // Define role-specific navigation links.
  const roleNavLinks = (
    <>
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
    </>
  );

  return (
    <Box position="fixed" top="0" left="0" width="100%" zIndex="10" bg="white">
      {/* Main Header */}
      <Flex maxW="1400px" mx="auto" align="center" p={4}>
        <Flex align="center">
          {/* Logo Image */}
          <Image
            src={aidenlogo} // Replace with your logo path or URL
            alt="Aiden Logo"
            boxSize="40px"
            mr={2}
          />
          <Heading
            as={NavLink}
            to="/"
            size="lg"
            fontFamily="logo"
            letterSpacing="-2px"
            _hover={{ textDecoration: "none" }}
          >
            aiden
          </Heading>
        </Flex>
        {/* Desktop Navigation (hidden on mobile) */}
        <Flex ml="auto" gap={4} align="center" display={{ base: "none", md: "flex" }}>
          {mainNavLinks}
        </Flex>
        {/* Mobile Hamburger Button (visible only on mobile) */}
        <IconButton
          aria-label="Open Menu"
          backgroundColor={"black"}
          icon={<HamburgerIcon />}
          size="lg"
          onClick={onOpen}
          ml="auto" // Using ml="auto" here aligns the button to the far right in mobile view
          display={{ base: "flex", md: "none" }}
        />
      </Flex>

      <Divider borderBottom="1px solid #999" />

      {/* Mobile Drawer Navigation */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="start">
              {mainNavLinks}
              {/* If the user is approved, include the role-specific links */}
              {user !== null && user.company.status === "approved" && (
                <>
                  <Divider />
                  {roleNavLinks}
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Role-Specific Horizontal Navigation (visible only on desktop) */}
      {user !== null && user.company.status === "approved" && (
        <Box display={{ base: "none", md: "block" }}>
          <Divider borderBottom="1px solid black" />
          <Box bg="brand.background_color" py={2}>
            <Flex maxW="1400px" mx="auto" px={6} align="center">
              <HStack spacing={8}>{roleNavLinks}</HStack>
            </Flex>
          </Box>
          <Divider borderBottom="1px solid black" />
        </Box>
      )}
    </Box>
  );
};

export default Header;
