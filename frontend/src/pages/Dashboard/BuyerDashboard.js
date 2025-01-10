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
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { getActiveAuctions, getCurrentBids } from "../../services/api";

const BuyerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auctionsResponse, bidsResponse] = await Promise.all([
          getActiveAuctions(),
          getCurrentBids(),
        ]);
        setAuctions(auctionsResponse.data);
        setBids(bidsResponse.data);
      } catch (err) {
        console.error("Error fetching buyer data:", err);
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
        Buyer Dashboard
      </Heading>

      <Divider mb={6} />

      {/* Active Auctions Section */}
      <Heading as="h3" size="lg" mb={4} color={textColor}>
        Active Auctions
      </Heading>
      <VStack spacing={4}>
        {auctions.length > 0 ? (
          auctions.map((auction) => (
            <Box
              key={auction.id}
              bg={cardBg}
              p={4}
              shadow="md"
              borderRadius="lg"
              w="100%"
            >
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold" color={textColor}>
                  {auction.product_name}
                </Text>
                <Badge colorScheme="green">
                  Ends: {new Date(auction.end_time).toLocaleString()}
                </Badge>
              </HStack>
              <Text color={textColor} mb={2}>
                {auction.description}
              </Text>
              <Text fontWeight="medium" color={textColor}>
                Starting Price: ${auction.starting_price}
              </Text>
              <Button colorScheme="blue" mt={4} w="full">
                Place Bid
              </Button>
            </Box>
          ))
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            bg={cardBg}
            p={8}
            shadow="md"
            borderRadius="lg"
            w="100%"
            textAlign="center"
          >
            <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
              No Active Auctions
            </Text>
            <Text mb={4} color={textColor}>
              Auctions you can bid on will appear here. Check back later for updates or browse available categories.
            </Text>
            <Button colorScheme="blue">Browse Auctions</Button>
          </Flex>
        )}
      </VStack>

      <Divider mt={8} mb={6} />

      {/* Current Bids Section */}
      <Heading as="h3" size="lg" mb={4} color={textColor}>
        Current Bids
      </Heading>
      <VStack spacing={4}>
        {bids.length > 0 ? (
          bids.map((bid) => (
            <Box
              key={bid.auction_id}
              bg={cardBg}
              p={4}
              shadow="md"
              borderRadius="lg"
              w="100%"
            >
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold" color={textColor}>
                  {bid.product_name}
                </Text>
                <Badge colorScheme="blue">
                  Ends: {new Date(bid.end_time).toLocaleString()}
                </Badge>
              </HStack>
              <Text fontWeight="medium" color={textColor}>
                Your Bid: ${bid.bid_amount}
              </Text>
            </Box>
          ))
        ) : (
          <Box
            bg={cardBg}
            p={4}
            shadow="md"
            borderRadius="lg"
            w="100%"
            textAlign="center"
          >
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              No Active Bids
            </Text>
            <Text mb={4} color={textColor}>
              Your active bids will appear here once you place a bid.
            </Text>
            <Button colorScheme="blue">Explore Auctions</Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default BuyerDashboard;
