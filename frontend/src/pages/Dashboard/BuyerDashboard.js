import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Divider,
  VStack,
  SimpleGrid,
  Button,
  Badge,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { getAvailableListings, getCurrentBids } from "../../services/api";
import ListingCard from "../../components/ListingCard";

const BuyerDashboard = () => {
  const [suggestedListings, setSuggestedListings] = useState([]);
  const [currentBids, setCurrentBids] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingBids, setLoadingBids] = useState(true);
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // Fetch suggested auctions
  useEffect(() => {
    const fetchSuggestedListings = async () => {
      try {
        const response = await getAvailableListings({ limit: 3 });
        setSuggestedListings(response.data);
      } catch (err) {
        console.error("Error fetching suggested listings:", err);
      } finally {
        setLoadingListings(false);
      }
    };

    fetchSuggestedListings();
  }, []);

  // Fetch current bids
  useEffect(() => {
    const fetchCurrentBids = async () => {
      try {
        const response = await getCurrentBids();
        setCurrentBids(response.data);
      } catch (err) {
        console.error("Error fetching current bids:", err);
      } finally {
        setLoadingBids(false);
      }
    };

    fetchCurrentBids();
  }, []);

  return (
    <Box bg={bgColor} minH="90vh" p={6} maxW="1400px">
      <Heading mb={6} color={textColor}>
        Buyer Dashboard
      </Heading>

      <Divider mt={8} mb={6} />

      {/* Suggested Auctions Section */}
      <Heading as="h3" size="lg" mb={4} color={textColor}>
        Featured Listings
      </Heading>
      {loadingListings ? (
        <Spinner size="xl" />
      ) : suggestedListings.length > 0 ? (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {suggestedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onViewDetails={(id) => (window.location.href = `/auction/details/${id}`)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <VStack spacing={4} align="center" textAlign="center">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Suggested auctions you can bid on will appear here. Check back later for updates or browse available categories.
          </Text>
          <Button colorScheme="blue" onClick={() => (window.location.href = "/auction/search")}>
            Browse Auctions
          </Button>
        </VStack>
      )}

      <Divider mt={8} mb={6} />

      {/* Current Bids Section */}
      <Heading as="h3" size="lg" mb={4} mt={8} color={textColor}>
        Current Bids
      </Heading>
      {loadingBids ? (
        <Spinner size="xl" />
      ) : currentBids.length > 0 ? (
        <VStack spacing={4} w="full">
          {currentBids.map((bid) => (
            <Box
              key={bid.id}
              bg={bgColor}
              p={4}
              shadow="md"
              borderRadius="lg"
              w="100%"
            >
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold" color={textColor}>
                  {bid.listing.product_name}
                </Text>
                <Badge colorScheme="blue">
                  {bid.listing.auction_end_date
                    ? `Ends: ${new Date(bid.listing.auction_end_date).toLocaleString()}`
                    : "No End Date"}
                </Badge>
              </HStack>
              <Text fontWeight="medium" color={textColor}>
                Your Bid: ${bid.price_per_unit}
              </Text>
              <Text color={textColor}>
                Quantity: {bid.quantity}
              </Text>
            </Box>
          ))}
        </VStack>
      ) : (
        <VStack spacing={4} align="center" textAlign="center">
          <Box
            bg={"white"}
            p={4}
            shadow="md"
            borderRadius="lg"
            w="100%"
            textAlign="center"
          >
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              No Active Bids
            </Text>
            <Text color={textColor}>
              Your active bids will appear here once you place a bid.
            </Text>
            <Button colorScheme="blue" onClick={() => (window.location.href = "/auction/search")}>
              Explore Auctions
            </Button>
          </Box>
        </VStack>
      )}

    </Box>
  );
};

export default BuyerDashboard;
