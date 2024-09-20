// src/pages/AuctionsPage.js
import React from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Image, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const auctions = [
  {
    id: 1,
    title: 'Pallet of Canned Goods',
    description: 'A pallet of assorted canned goods. Best before: 2023.',
    image: 'https://via.placeholder.com/150',
    sku: 'CAN123',
    closeDate: '2024-09-30',
    status: 'Open',
  },
  {
    id: 2,
    title: 'Bulk Pack of Beverages',
    description: 'A large batch of various soft drinks. Best before: 2024.',
    image: 'https://via.placeholder.com/150',
    sku: 'BEV456',
    closeDate: '2024-10-05',
    status: 'Open',
  },
  // Add more auction items here
];

const AuctionsPage = () => {
  return (
    <Box bg="brand.background_color" p={8} minH="80vh">
      <Flex direction="column" align="center" maxW="1200px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading as="h1" size="xl" color="brand.600" mb={6}>
          Current Auctions
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="100%">
          {auctions.map((auction) => (
            <Box
              key={auction.id}
              p={5}
              bg="brand.background_color"
              borderRadius="md"
              boxShadow="sm"
              _hover={{ boxShadow: 'md' }}
              transition="box-shadow 0.2s ease-in-out"
            >
              <Image src={auction.image} alt={auction.title} borderRadius="md" mb={4} />
              <Heading as="h3" size="md" color="brand.600" mb={2}>
                {auction.title}
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={2}>
                SKU: {auction.sku}
              </Text>
              <Text fontSize="md" color="gray.700" mb={4}>
                {auction.description}
              </Text>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Closing Date: {auction.closeDate}
              </Text>
              <Button
                as={Link} // Use Link component for navigation
                to={`/bid/${auction.id}`} // Dynamic link to auction details page
                colorScheme="teal"
                size="sm"
                width="100%"
                variant="outline"
              >
                View Auction
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Flex>
    </Box>
  );
};

export default AuctionsPage;
