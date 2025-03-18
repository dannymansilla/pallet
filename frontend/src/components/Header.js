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
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Lottie from 'lottie-react'; 
import globeAnimation from '../assets/aiden_globe.json';

const Header = () => {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const companyName = storedUser?.company?.name || "Profile";

  // Define the main navigation links so we can reuse them in both desktop and mobile views.
  const mainNavLinks = (
    <>
      

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
            {companyName}
          </Link>
          <Button onClick={logout} bg="black" color="white" _hover={{ bg: "gray.800" }}>
            Logout
          </Button>
        </>
      ) : (
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
          <Button
            as={NavLink}
            to="/requestdemo"
            variant="logo_accent"
          >
            Talk to Sales
          </Button>

          {/* <Button as={NavLink} to="/login">
            Login
          </Button> */}
        </>
      )}
    </>
  );

  // Define role-specific navigation links.
  const roleNavLinks = (
    <>
      {(user?.company?.roles.includes("buyer") || user?.company?.roles.includes("both")) && (
        <>
          <NavLink
            to="/buyer-dashboard"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "4px 6px" }
                : { color: "black", padding: "4px 6px" }
            }
          >
            Buyer Dashboard
          </NavLink>
          <NavLink
            to="/auction"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "4px 6px" }
                : { color: "black", padding: "4px 6px" }
            }
          >
            Auctions
          </NavLink>
          <NavLink
            to="/buyer/mybids"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "4px 6px" }
                : { color: "black", padding: "4px 6px" }
            }
          >
            My Bids
          </NavLink>
          <NavLink
            to="/buyer-trucks"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "4px 6px" }
                : { color: "black", padding: "4px 6px" }
            }
          >
            Truck History
          </NavLink>
        </>
      )}
      {(user?.company?.roles.includes("seller") || user?.company?.roles.includes("both")) && (
        <>
          <NavLink
            to="/seller-dashboard"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "4px 6px" }
                : { color: "black", padding: "4px 6px" }
            }
          >
            Seller Dashboard
          </NavLink>
          {/* <NavLink
            to="/products/select"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "4px 6px" }
                : { color: "black", padding: "4px 6px" }
            }
          >
            Create Listing
          </NavLink> */}
          <NavLink
            to="/seller/manage-listings"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "4px 6px" }
                : { color: "black", padding: "4px 6px" }
            }
          >
            Manage Listings
          </NavLink>
          <NavLink
            to="/seller/network"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "4px 6px" }
                : { color: "black", padding: "4px 6px" }
            }
          >
            Manage Network
          </NavLink>
          <NavLink
            to="/auction-trucks"
            style={({ isActive }) =>
              isActive
                ? { background: "#3182ce", color: "white", borderRadius: "8px", padding: "4px 6px" }
                : { color: "black", padding: "4px 6px" }
            }
          >
            Manage Trucks
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <Box position="fixed" top="0" left="0" width="100%" zIndex="9999" bg="white" px={{ base: 8, md: 24 }}> 
      {/* Main Header */}
      <Flex maxW="1400px" mx="auto" align="center" py={4}>
        <Flex align="center">
          {/* Logo Image */}
          <Lottie
            animationData={globeAnimation}
            loop
            style={{ width: '40px', height: '100%'}}
          />
          {/* <Image
            src={aidenlogo} // Replace with your logo path or URL
            alt="Aiden Logo"
            boxSize="40px"
            mr={2}
          /> */}
          <Heading
            as={NavLink}
            to="/"
            size="lg"
            fontFamily="logo"
            letterSpacing="-2px"
            display="inline-block" 
            _hover={{ textDecoration: "none" }}
            ml="5px"
          >
            <span style={{ marginRight: "-3px" }}>a</span>
            <span style={{ marginRight: "-4px" }}>i</span>
            <span>d</span>
            <span style={{ marginLeft: "-1px" }}>e</span>
            <span style={{ marginLeft: "-1px" }}>n</span>
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

      {/* <Divider borderBottom="1px solid #999" /> */}

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
              {user !== null && user?.company?.status === "approved" && (
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
      {user !== null && user?.company?.status === "approved" && (
        <Box display={{ base: "none", md: "block" }} pb={2}>
          <Divider borderBottom="1px solid black" />
          <Box bg="brand.background_color" py={2}>
            <Flex maxW="1400px" mx="auto" px={4} align="center">
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
