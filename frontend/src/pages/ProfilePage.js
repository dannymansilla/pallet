// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import person_image from '../images/person_outline.jpeg';
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Divider,
  SimpleGrid,
  Badge,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import AuthContext for user token handling

const ProfilePage = () => {
  const { authTokens } = useAuth(); // Access tokens from context
  const [userData, setUserData] = useState(null); // User profile data
  const [currentBids, setCurrentBids] = useState([]); // User's current bids
  const [listings, setListings] = useState([]); // User's listings
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch user data, current bids, and listings from the backend
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await axios.get('/api/profile/', {
          headers: {
            Authorization: `Bearer ${authTokens.access}`, // Include token for authentication
          },
        });
        setUserData(profileResponse.data);

        // Fetch user's current bids
        const bidsResponse = await axios.get('/api/current-bids/', {
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
          },
        });
        setCurrentBids(bidsResponse.data);

        // Fetch user's listings
        const listingsResponse = await axios.get('/api/user-listings/', {
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
          },
        });
        setListings(listingsResponse.data);

        setLoading(false); // Turn off loading once data is fetched
      } catch (error) {
        console.error('Error fetching profile data', error);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authTokens]);

  if (loading) {
    return (
      <Flex align="center" justify="center" height="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box bg="brand.background_color" p={8} minH="80vh">
      <Flex direction="column" align="center" maxW="1200px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        {/* User Profile Section */}
        <Flex direction={{ base: 'column', md: 'row' }} align="center" mb={8}>
          <Image
            src={person_image}
            alt={userData?.name}
            borderRadius="full"
            boxSize="150px"
            objectFit="cover"
            mr={{ base: 0, md: 6 }}
            mb={{ base: 4, md: 0 }}
          />
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <Heading as="h1" size="xl" color="teal.600" mb={2}>
              {userData?.name}
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={1}>
              {userData?.email}
            </Text>
            {userData?.company && (
              <Text fontSize="md" color="gray.600" mb={1}>
                Company: {userData.company.name}
              </Text>
            )}
          </Box>
        </Flex>

        <Divider mb={8} />

        {/* Current Bids Section */}
        <Box w="100%" mb={8}>
          <Heading as="h2" size="lg" color="teal.600" mb={4}>
            Your Current Bids
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {currentBids.map((bid) => (
              <Box key={bid.id} p={5} bg="gray.100" borderRadius="md" boxShadow="sm" _hover={{ boxShadow: 'md' }}>
                <Heading as="h3" size="md" color="teal.600" mb={2}>
                  {bid.item}
                </Heading>
                <Text fontSize="md" color="gray.700" mb={2}>
                  Bid Amount: {bid.bidAmount}
                </Text>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Quantity: {bid.quantity}
                </Text>
                <Badge colorScheme={bid.status === 'OPEN' ? 'green' : 'red'}>
                  {bid.status}
                </Badge>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        <Divider mb={8} />

        {/* Your Listings Section */}
        <Box w="100%">
          <Heading as="h2" size="lg" color="teal.600" mb={4}>
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
                <Heading as="h3" size="md" color="teal.600" mb={2}>
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
                  as={Link}
                  to={`/auction/${listing.id}`} // Link to auction details page
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
