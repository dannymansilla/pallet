// src/components/Footer.js
import React from 'react';
import { Box, Text, Flex, Link } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box bg="gray.800" p={6} mt={8} color="gray.300">
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
          <Link href="/privacy" mx={2} color="gray.400" fontSize="sm" _hover={{ color: 'brand.600' }}>
            Privacy Policy
          </Link>
          <Link href="/terms" mx={2} color="gray.400" fontSize="sm" _hover={{ color: 'brand.600' }}>
            Terms of Service
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;
