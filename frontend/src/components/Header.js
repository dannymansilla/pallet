import React from "react";
import {
  Box,
  Flex,
  Heading,
  Link,
  Button,
  IconButton,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Lottie from "lottie-react";
import globeAnimation from "../assets/aiden_globe.json";
import NotificationsDropdown from "./NotificationsDropdown";

const Header = () => {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get organization name from user context instead of localStorage
  const organizationName = user?.organization?.name || "Profile";

  // Logged-out nav
  const loggedOutNav = (
    <>
      <Link
        as={NavLink}
        to="/team"
        style={({ isActive }) =>
          isActive
            ? {
                background: "#3182ce",
                color: "white",
                borderRadius: "8px",
                padding: "8px 12px",
              }
            : { color: "black", padding: "8px 12px" }
        }
        _hover={{ textDecoration: "underline" }}
      >
        About Us
      </Link>

      <Button as={NavLink} to="/requestdemo" variant="logo_accent">
        Talk to Sales
      </Button>

      {/* <Button as={NavLink} to="/login">
        Login
      </Button> */}
    </>
  );

  // Logged-in nav
  const loggedInNav = (
    <>
      <Link
        as={NavLink}
        to="/profile"
        style={({ isActive }) =>
          isActive
            ? {
                background: "#3182ce",
                color: "white",
                borderRadius: "8px",
                padding: "8px 12px",
              }
            : { color: "black", padding: "8px 12px" }
        }
        _hover={{ textDecoration: "underline" }}
      >
        {organizationName}
      </Link>

      <NotificationsDropdown />

      <Button
        onClick={() => {
          logout();
          onClose(); // Close any open menus
        }}
        bg="black"
        color="white"
        _hover={{ bg: "gray.800" }}
        ml={2}
      >
        Logout
      </Button>
    </>
  );

  // Determine layout styles based on logged-in state
  const isLoggedIn = Boolean(user);

  // We'll override maxW, margins, and padding:
  // - Logged out: center content, max width 1400px, auto margin
  // - Logged in: full width, small horizontal padding
  const containerStyles = {
    maxW: isLoggedIn ? "100%" : "1400px",
    mx: isLoggedIn ? 0 : "auto",
    px: isLoggedIn ? 4 : 0, // some horizontal padding when full width
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      zIndex="999"
      bg="white"
      boxShadow="sm"
      px={{ base: 8, md: 24 }}
    >
      <Flex
        {...containerStyles}
        align="center"
        py={3}
        justify="space-between"
      >
        {/* Left side: Aiden Logo and Name */}
        <Flex align="center">
          <Lottie
            animationData={globeAnimation}
            loop
            style={{ width: "40px", height: "40px" }}
          />
          <Heading
            as={NavLink}
            to="/"
            size="lg"
            fontFamily="logo"
            letterSpacing="-1px"
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

        {/* Right side nav links */}
        <Flex align="center" gap={4} display={{ base: "none", md: "flex" }}>
          {user ? loggedInNav : loggedOutNav}
        </Flex>

        {/* Mobile hamburger for main nav */}
        <IconButton
          aria-label="Open Menu"
          bg="black"
          icon={<HamburgerIcon />}
          size="lg"
          onClick={onOpen}
          display={{ base: "flex", md: "none" }}
        />
      </Flex>

      {/* Divider across the bottom of the header */}
      <Divider borderBottom="1px solid #999" w="100vw" mx="calc(-50vw + 50%)" />
    </Box>
  );
};

export default Header;
