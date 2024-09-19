// src/pages/HomePage.js
import React from 'react';
import { Box, Flex, Heading, Text, Button, Link, Stack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const HomePage = () => {
  return (
    <Box bg="gray.50" p={8} minH="80vh"> {/* Updated to ensure consistent background color */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
        maxW="1200px"
        mx="auto"
        p={6}
        bg="white"
        borderRadius="md"
        boxShadow="md"
        mb={8}
      >
        <Box maxW="600px">
          <Heading as="h1" size="xl" color="brand.600" mb={4}>
            Welcome to Pallet Marketplace
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={4}>
            Discover and bid on pallets of consumer packaged goods in bulk. Our marketplace connects suppliers with buyers for seamless transactions.
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={4}>
            <Button as={RouterLink} to="/auctions" colorScheme="teal" size="lg">
              View Auctions
            </Button>
            <Button as={RouterLink} to="/contact" variant="outline" colorScheme="teal" size="lg">
              Contact Us
            </Button>
          </Stack>
        </Box>
        <Box>
          <img
            src="https://via.placeholder.com/400"
            alt="Pallets"
            style={{ borderRadius: '8px', width: '100%', maxWidth: '400px' }}
          />
        </Box>
      </Flex>
      
      <Flex direction="column" align="center" p={4} bg="gray.100" borderRadius="md" boxShadow="md">
        <Heading as="h2" size="lg" color="brand.600" mb={4}>
          How It Works
        </Heading>
        <Text fontSize="md" color="gray.600" mb={4} maxW="800px" textAlign="center">
          Browse available pallets, place your bids, and win items in bulk. Once you win, connect directly with the supplier to arrange shipping.
        </Text>
        <Button as={Link} href="/details" colorScheme="teal" size="md">
          Learn More
        </Button>
      </Flex>
    </Box>
  );
};

export default HomePage;
