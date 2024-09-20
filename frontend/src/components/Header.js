// src/components/Header.js
import React from 'react';
import { Box, Flex, Heading, Button, Image, Link, Spacer } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import logo from '../images/logo.png';

const Header = () => {
  return (
    <Box bg="brand.background_color" p={4}> {/* Updated background color to match main content */}
      <Flex maxW="1200px" mx="auto" align="center">
        <Image
            src={logo} 
            alt="Pallet Marketplace Logo"
            boxSize="40px" // Adjust size as needed
            mr={2} // Margin-right for spacing
          />
          <Heading as={RouterLink} to="/" size="lg" color="black" letterSpacing="wider">
            Pallet
          </Heading>
        <Spacer />
        <Flex align="center">
          <Link as={RouterLink} to="/details" color="black" mx={2} fontSize="lg" _hover={{ textDecoration: 'underline' }}>
            Product
          </Link>
          {/* <Link as={RouterLink} to="/auctions" color="black" mx={2} fontSize="lg" _hover={{ textDecoration: 'underline' }}>
            Auctions
          </Link> */}
          <Link as={RouterLink} to="/about" color="black" mx={2} fontSize="lg" _hover={{ textDecoration: 'underline' }}>
            About
          </Link>
          {/* <Link as={RouterLink} to="/profile" color="black" mx={2} fontSize="lg" _hover={{ textDecoration: 'underline' }}>
            Profile
          </Link> */}
          <Button
            as={RouterLink}
            to="/login"
            variant="outline"
            ml={4}
          >
            Login
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;