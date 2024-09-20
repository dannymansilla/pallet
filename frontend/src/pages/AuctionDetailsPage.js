// src/pages/AuctionDetailsPage.js
import React, { useEffect, useState } from 'react';
import cpg_photo from '../images/liquid_detergent.jpeg';
import { useParams } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  // Stack,
  Divider,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

// Mock data for a single auction (replace with API data)
const auctionData = {
  id: 1,
  name: 'Premium Liquid Laundry Detergent',
  sellerCompany: 'CleanCo Industries',
  description: 'A high-efficiency liquid laundry detergent designed for use in both traditional and HE washing machines. Removes tough stains and keeps clothes fresh.',
  image: 'https://example.com/images/laundry-detergent.jpg',  // Replace with an actual image URL
  sku: 'CLN-12345',
  closeDate: '2024-10-15T18:00:00Z',
  expiration: '2025-06-30',
  units: 5000,
  status: 'Open',
  currentBids: [
    { id: 1, bidder: 'Best Supplies Co.', amount: 1.5, quantity: 200 },
    { id: 2, bidder: 'Global Traders Inc.', amount: 1.4, quantity: 300 },
    { id: 3, bidder: 'Wholesale Market Ltd.', amount: 1.3, quantity: 500 },
  ],
};

const AuctionDetailsPage = () => {
  const { id } = useParams(); // Get the auction ID from the URL params
  const [auction, setAuction] = useState(null);

  useEffect(() => {
    // Replace this with an actual API call to fetch auction details by ID
    // Example: fetchAuctionDetails(id).then(data => setAuction(data));
    setAuction(auctionData); // Use mock data for now
  }, [id]);

  if (!auction) {
    return <Text>Loading...</Text>; // Show a loading state while fetching data
  }

  return (
    <Box bg="brand.background" p={8} minH="80vh">
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
          src={cpg_photo}
          alt={auction.name}
          borderRadius="md"
          boxSize="300px"
          objectFit="cover"
          mb={{ base: 4, md: 0 }}
          mr={{ base: 0, md: 6 }}
        />
        <Box>
          <Heading as="h1" size="xl" color="teal.600" mb={4}>
            {auction.name}
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={2}>
            <strong>Seller Company:</strong> {auction.sellerCompany}
          </Text>
          <Text fontSize="md" color="gray.700" mb={4}>
            <strong>Description:</strong> {auction.description}
          </Text>
          <Text fontSize="md" color="gray.600" mb={2}>
            <strong>SKU:</strong> {auction.sku}
          </Text>
          <Text fontSize="sm" color="gray.500" mb={2}>
            <strong>Auction Close Date:</strong> {auction.closeDate}
          </Text>
          <Text fontSize="sm" color="gray.500" mb={2}>
            <strong>Item Expiration:</strong> {auction.expiration}
          </Text>
          <Text fontSize="sm" color="gray.500" mb={2}>
            <strong>Units Available:</strong> {auction.units}
          </Text>
          <Badge colorScheme={auction.status === 'Open' ? 'green' : 'red'} mt={4}>
            {auction.status}
          </Badge>
        </Box>
      </Flex>

      <Divider my={8} />

      {/* Current Bids Dashboard */}
      <Box maxW="1200px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading as="h2" size="lg" color="teal.600" mb={4}>
          Current Bids
        </Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Bidder</Th>
              <Th isNumeric>Price per Unit ($)</Th>
              <Th isNumeric>Quantity</Th>
            </Tr>
          </Thead>
          <Tbody>
            {auction.currentBids.map((bid) => (
              <Tr key={bid.id}>
                <Td>{bid.bidder}</Td>
                <Td isNumeric>{bid.amount.toFixed(2)}</Td>
                <Td isNumeric>{bid.quantity}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
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
