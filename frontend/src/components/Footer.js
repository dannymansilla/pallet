// src/components/Footer.js
import React from 'react';
import { Box, Text, Flex, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box bg="brand.background_color" p={4} boxShadow="sm">
      <Flex
        maxW="1200px"
        mx="auto"
        justify={{ base: 'center', md: 'space-between' }}
        align="center"
        direction={{ base: 'column', md: 'row' }}
      >
        <Text mb={{ base: 4, md: 0 }} textAlign="center">
          © {new Date().getFullYear()} Pallet Marketplace. All rights reserved.
        </Text>
        <Flex>
          <Link as={RouterLink} to="/privacy" mx={2} color="black" fontSize="sm" _hover={{ color: 'brand.600' }}>
            Privacy Policy
          </Link>
          <Link as={RouterLink} to="/onboarding/accept-terms" mx={2} color="black" fontSize="sm" _hover={{ color: 'brand.600' }}>
            Terms of Service
          </Link>
          <Link as={RouterLink} to="/home" mx={2} color="black" fontSize="sm" _hover={{ color: 'brand.600' }}>
            Landing Page
          </Link>
          {/* <Link as={RouterLink} to="/contact" mx={2} color="black" fontSize="sm" _hover={{ color: 'brand.600' }}>
            Contact Us
          </Link> */}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;
