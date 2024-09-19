// src/pages/ProfilePage.js
import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  // Stack,
  Divider,
  SimpleGrid,
  Badge,
  Button
} from '@chakra-ui/react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  profileImage: 'https://via.placeholder.com/150',
  company: {
    name: 'Acme Corp',
    address: '123 Business St, Suite 456',
    phone: '123-456-7890'
  }
};

const currentBids = [
  {
    id: 1,
    item: 'Pallet of Paper Towels',
    bidAmount: '$500',
    quantity: '500 units',
    status: 'Leading'
  },
  {
    id: 2,
    item: 'Bulk Pack of Bottled Water',
    bidAmount: '$300',
    quantity: '1000 units',
    status: 'Outbid'
  },
];

const listings = [
  {
    id: 1,
    title: 'Pallet of Canned Goods',
    currentBids: 5,
    status: 'Open',
    closingDate: '2024-09-30'
  },
  {
    id: 2,
    title: 'Bulk Pack of Beverages',
    currentBids: 10,
    status: 'Closed',
    closingDate: '2024-10-05'
  },
];

const ProfilePage = () => {
  return (
    <Box bg="gray.50" p={8} minH="80vh">
      <Flex direction="column" align="center" maxW="1200px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Flex direction={{ base: 'column', md: 'row' }} align="center" mb={8}>
          <Image
            src={user.profileImage}
            alt={user.name}
            borderRadius="full"
            boxSize="150px"
            objectFit="cover"
            mr={{ base: 0, md: 6 }}
            mb={{ base: 4, md: 0 }}
          />
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <Heading as="h1" size="xl" color="brand.600" mb={2}>
              {user.name}
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={1}>
              {user.email}
            </Text>
            <Text fontSize="md" color="gray.500">
              {user.company.name}
            </Text>
          </Box>
        </Flex>

        <Divider mb={8} />

        <Box w="100%" mb={8}>
          <Heading as="h2" size="lg" color="brand.600" mb={4}>
            Active Bids
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {currentBids.map((bid) => (
              <Box
                key={bid.id}
                p={5}
                bg="gray.100"
                borderRadius="md"
                boxShadow="sm"
                _hover={{ boxShadow: 'md' }}
                transition="box-shadow 0.2s ease-in-out"
              >
                <Heading as="h3" size="md" color="brand.600" mb={2}>
                  {bid.item}
                </Heading>
                <Text fontSize="md" color="gray.700" mb={2}>
                  Bid Amount: {bid.bidAmount}
                </Text>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Quantity: {bid.quantity}
                </Text>
                <Badge colorScheme={bid.status === 'Leading' ? 'green' : 'red'}>
                  {bid.status}
                </Badge>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Divider mb={8} />

        <Box w="100%">
          <Heading as="h2" size="lg" color="brand.600" mb={4}>
            Your Listings
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {listings.map((listing) => (
              <Box
                key={listing.id}
                p={5}
                bg="gray.100"
                borderRadius="md"
                boxShadow="sm"
                _hover={{ boxShadow: 'md' }}
                transition="box-shadow 0.2s ease-in-out"
              >
                <Heading as="h3" size="md" color="brand.600" mb={2}>
                  {listing.title}
                </Heading>
                <Text fontSize="md" color="gray.700" mb={2}>
                  Current Bids: {listing.currentBids}
                </Text>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Status: {listing.status}
                </Text>
                <Text fontSize="sm" color="gray.500" mb={4}>
                  Closing Date: {listing.closingDate}
                </Text>
                <Button
                  as={Link} // Use Link component for navigation
                  to={`/auctions/${listing.id}`} // Link to auction details page
                  colorScheme="teal"
                  size="sm"
                  width="100%"
                  variant="outline"
                >
                  View Listing
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Flex>
    </Box>
  );
};

export default ProfilePage;
