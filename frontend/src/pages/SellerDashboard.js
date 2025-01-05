import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  HStack,
  Button,
  Divider,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { getActiveListings, getAuctionPerformance } from "../services/api";

const SellerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsResponse, performanceResponse] = await Promise.all([
          getActiveListings(),
          getAuctionPerformance(),
        ]);
        setListings(listingsResponse.data);
        setPerformance(performanceResponse.data);
      } catch (err) {
        console.error("Error fetching seller data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      <Heading mb={6} color={textColor}>
        Seller Dashboard
      </Heading>

      {/* Hero Section */}
      <SimpleGrid columns={[1, 2]} spacing={6} mb={6}>
        <Stat bg={cardBg} p={4} shadow="md" borderRadius="lg">
          <StatLabel>Total Sales</StatLabel>
          <StatNumber>${performance?.total_sales || 0}</StatNumber>
        </Stat>
        <Stat bg={cardBg} p={4} shadow="md" borderRadius="lg">
          <StatLabel>Active Listings</StatLabel>
          <StatNumber>{listings.length}</StatNumber>
        </Stat>
      </SimpleGrid>

      <Divider mb={6} />

      {/* Active Listings Section */}
      <Heading as="h3" size="lg" mb={4} color={textColor}>
        Active Listings
      </Heading>
      <Box bg={cardBg} p={4} shadow="md" borderRadius="lg">
        {listings.length > 0 ? (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Listing Name</Th>
                <Th>Bids Received</Th>
                <Th>Highest Bid</Th>
                <Th>Time Remaining</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {listings.map((listing) => (
                <Tr key={listing.id}>
                  <Td>{listing.name}</Td>
                  <Td>{listing.bids_received}</Td>
                  <Td>${listing.highest_bid || 0}</Td>
                  <Td>
                    <Badge colorScheme="green">
                      {new Date(listing.time_remaining).toLocaleString()}
                    </Badge>
                  </Td>
                  <Td>
                    <Button size="sm" colorScheme="blue" mr={2}>
                      Edit
                    </Button>
                    <Button size="sm" colorScheme="red">
                      Close
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>No active listings found. Create your first listing!</Text>
        )}
      </Box>

      <Divider mt={8} mb={6} />

      {/* Quick Actions Section */}
<Heading as="h3" size="lg" mb={4} color={textColor}>
  Quick Actions
</Heading>
<SimpleGrid columns={[1, 2]} spacing={6} mt={4}>
  <Box bg={cardBg} p={4} shadow="md" borderRadius="lg" textAlign="center">
    <Heading as="h4" size="sm" mb={2}>
      Create New Listing
    </Heading>
    <Text mb={4} color={textColor}>
      Start a new auction by providing product details and setting parameters.
    </Text>
    <Button colorScheme="blue" size="sm">
      Create
    </Button>
  </Box>
  <Box bg={cardBg} p={4} shadow="md" borderRadius="lg" textAlign="center">
    <Heading as="h4" size="sm" mb={2}>
      Duplicate Listing
    </Heading>
    <Text mb={4} color={textColor}>
      Save time by duplicating an existing listing and making quick edits.
    </Text>
    <Button colorScheme="teal" size="sm">
      Duplicate
    </Button>
  </Box>
</SimpleGrid>

    </Box>
  );
};

export default SellerDashboard;
