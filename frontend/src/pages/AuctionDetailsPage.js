// src/pages/AuctionDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Stack,
  Divider,
  Button,
  Badge,
} from '@chakra-ui/react';

// Mock data for a single auction (replace with API data)
const auctionData = {
  id: 1,
  title: 'Pallet of Canned Goods',
  description: 'A pallet of assorted canned goods. Best before: 2023.',
  image: 'https://via.placeholder.com/300',
  sku: 'CAN123',
  closeDate: '2024-09-30',
  status: 'Open',
  currentBids: [
    { id: 1, bidder: 'John Doe', amount: '$500', quantity: '100 units' },
    { id: 2, bidder: 'Jane Smith', amount: '$450', quantity: '50 units' },
  ],
};

const AuctionDetailsPage = () => {
  const { id } = useParams(); // Get the auction ID from the URL params
  const [auction, setAuction] = useState(null);

  useEffect(() => {
    // Replace this with actual API call to fetch auction details by ID
    // Example: fetchAuctionDetails(id).then(data => setAuction(data));
    setAuction(auctionData); // Use mock data for now
  }, [id]);

  if (!auction) {
    return <Text>Loading...</Text>; // Show a loading state while fetching data
  }

  return (
    <Box bg="gray.50" p={8} minH="80vh">
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        maxW="1200px"
        mx="auto"
        p={6}
        bg="white"
        borderRadius="md"
        boxShadow="md"
      >
        <Image
          src={auction.image}
          alt={auction.title}
          borderRadius="md"
          boxSize="300px"
          objectFit="cover"
          mb={{ base: 4, md: 0 }}
          mr={{ base: 0, md: 6 }}
        />
        <Box>
          <Heading as="h1" size="xl" color="brand.600" mb={4}>
            {auction.title}
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={2}>
            SKU: {auction.sku}
          </Text>
          <Text fontSize="md" color="gray.700" mb={4}>
            {auction.description}
          </Text>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Closing Date: {auction.closeDate}
          </Text>
          <Badge colorScheme={auction.status === 'Open' ? 'green' : 'red'}>
            {auction.status}
          </Badge>
        </Box>
      </Flex>

      <Divider my={8} />

      <Box maxW="1200px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading as="h2" size="lg" color="brand.600" mb={4}>
          Current Bids
        </Heading>
        <Stack spacing={4}>
          {auction.currentBids.map((bid) => (
            <Flex
              key={bid.id}
              direction="row"
              justify="space-between"
              align="center"
              bg="gray.100"
              p={4}
              borderRadius="md"
              boxShadow="sm"
            >
              <Text fontSize="md" color="gray.700">
                {bid.bidder}
              </Text>
              <Text fontSize="md" color="gray.700">
                {bid.amount}
              </Text>
              <Text fontSize="md" color="gray.700">
                {bid.quantity}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Box>

      <Flex justify="center" mt={8}>
        <Button colorScheme="teal" size="lg" variant="outline" as="a" href="/auctions">
          Back to Auctions
        </Button>
      </Flex>
    </Box>
  );
};

export default AuctionDetailsPage;
