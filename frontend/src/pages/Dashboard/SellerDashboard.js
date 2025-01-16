import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Button,
  Divider,
  VStack,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Td,
  Badge,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { getActiveListings, getQueuedListings, getAuctionPerformance, getListingBids } from "../../services/api";
import { Link as RouterLink } from "react-router-dom";

const SellerDashboard = () => {
  const [activeListings, setActiveListings] = useState([]);
  const [queuedListings, setQueuedListings] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [bids, setBids] = useState([]); // For storing bids
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control
  const [loadingBids, setLoadingBids] = useState(false);
  const [errors, setErrors] = useState([]); // To track errors

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const handleViewBids = async (listing) => {
    setLoadingBids(true);
    setSelectedListing(listing); // Store the selected listing
    try {
      const response = await getListingBids(listing.id); // Fetch bids
      setBids(response.data); // Update bids state
      onOpen(); // Open modal
    } catch (err) {
      console.error("Error fetching bids:", err);
      setErrors((prev) => [...prev, "Failed to fetch bids for the listing."]);
    } finally {
      setLoadingBids(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.allSettled([
          getActiveListings(),
          getQueuedListings(),
          getAuctionPerformance(),
        ]);

        // Handle Active Listings
        if (responses[0].status === "fulfilled") {
          setActiveListings(responses[0].value.data);
        } else {
          setErrors((prev) => [...prev, "Failed to fetch active listings."]);
        }

        // Handle Queued Listings
        if (responses[1].status === "fulfilled") {
          setQueuedListings(responses[1].value.data);
        } else {
          setErrors((prev) => [...prev, "Failed to fetch queued listings."]);
        }

        // Handle Auction Performance
        if (responses[2].status === "fulfilled") {
          setPerformance(responses[2].value.data);
        } else {
          setErrors((prev) => [...prev, "Failed to fetch auction performance."]);
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
        setErrors((prev) => [...prev, "Unexpected error while fetching data."]);
        console.logs("errors:", errors);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [errors]);

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

      {/* Display errors */}
      {errors.length > 0 && (
        <VStack mb={6} spacing={2}>
          {errors.map((error, index) => (
            <Badge key={index} colorScheme="red">
              {error}
            </Badge>
          ))}
        </VStack>
      )}

      {/* Hero Section */}
      <SimpleGrid columns={[1, 2]} spacing={6} mb={6}>
        <Stat bg={cardBg} p={4} shadow="md" borderRadius="lg">
          <StatLabel>Total Sales</StatLabel>
          <StatNumber>${performance?.total_sales || 0}</StatNumber>
        </Stat>
        <Stat bg={cardBg} p={4} shadow="md" borderRadius="lg">
          <StatLabel>Active Listings</StatLabel>
          <StatNumber>{activeListings.length}</StatNumber>
        </Stat>
      </SimpleGrid>

      <Divider mb={6} />

      {/* Active Listings Section */}
      <Heading as="h3" size="lg" mb={4} color={textColor}>
        Active Listings
      </Heading>
      <Box bg={bgColor} p={4} shadow="md" borderRadius="lg">
        {activeListings.length > 0 ? (
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
              {activeListings.map((listing) => (
                <Tr key={listing.id}>
                  <Td>{listing.name}</Td>
                  <Td>{listing.bids_received}</Td>
                  <Td>${listing.highest_bid || 0}</Td>
                  <Td>
                    <Badge colorScheme="green">
                      {listing.time_remaining} days
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleViewBids(listing)}
                    >
                      View Bids
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

      {/* Modal for Viewing Bids */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bids for {selectedListing?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxHeight="500px" overflowY="auto">
            {loadingBids ? (
              <Spinner />
            ) : bids.length > 0 ? (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Buyer</Th>
                    <Th>Bid Price</Th>
                    <Th>Quantity</Th>
                    <Th>Timestamp</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bids.map((bid) => (
                    <Tr key={bid.id}>
                      <Td>{bid.buyer.name}</Td>
                      <Td>${bid.price_per_unit}</Td>
                      <Td>{bid.quantity}</Td>
                      <Td>{new Date(bid.timestamp).toLocaleString()}</Td>
                      <Td>
                        <Badge colorScheme={bid.is_winning_bid ? "green" : "red"}>
                          {bid.is_winning_bid ? "Winning" : "Outbid"}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>No bids available for this listing.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="blue">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


      <Divider mt={8} mb={6} />

      {/* Queued Listings Section */}
      <Heading as="h3" size="lg" mb={4} color={textColor}>
        Queued Listings
      </Heading>
      <Box bg={cardBg} p={4} shadow="md" borderRadius="lg">
        {queuedListings.length > 0 ? (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Listing Name</Th>
                <Th>Quantity</Th>
                <Th>Minimum Price</Th>
                <Th>Auction Cycle</Th>
              </Tr>
            </Thead>
            <Tbody>
              {queuedListings.map((listing) => (
                <Tr key={listing.id}>
                  <Td>{listing.product?.name || "N/A"}</Td>
                  <Td>{listing.quantity_available}</Td>
                  <Td>${listing.minimum_selling_price}</Td>
                  <Td>
                    {listing.auction_cycle?.start_date || "N/A"} -{" "}
                    {listing.auction_cycle?.end_date || "N/A"}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>No queued listings for the next auction cycle.</Text>
        )}
      </Box>

      <Divider mt={8} mb={6} />

      {/* Quick Actions Section */}
<Heading as="h3" size="lg" mb={4} color={textColor}>
  Quick Actions
</Heading>
<SimpleGrid columns={[1, 3]} spacing={6} mt={4}>
  {/* Create New Listing */}
  <Box bg={cardBg} p={4} shadow="md" borderRadius="lg" textAlign="center">
    <Heading as="h4" size="sm" mb={2}>
      Create New Listing
    </Heading>
    <Text mb={4} color={textColor}>
      Start a new auction by providing product details and parameters.
    </Text>
    <Button as={RouterLink} to="/products/select" colorScheme="blue" size="sm">
      Create
    </Button>
  </Box>

  {/* Manage Network */}
  <Box bg={cardBg} p={4} shadow="md" borderRadius="lg" textAlign="center">
    <Heading as="h4" size="sm" mb={2}>
      Manage Network
    </Heading>
    <Text mb={4} color={textColor}>
      Manage your buyer network and invite companies to join.
    </Text>
    <Button as={RouterLink} to="/seller/network" colorScheme="teal" size="sm">
      Network
    </Button>
  </Box>

  {/* Manage Listings */}
  <Box bg={cardBg} p={4} shadow="md" borderRadius="lg" textAlign="center">
    <Heading as="h4" size="sm" mb={2}>
      Manage Listings
    </Heading>
    <Text mb={4} color={textColor}>
      Manage your current and upcoming listings.
    </Text>
    <Button as={RouterLink} to="/seller/manage-listings" colorScheme="teal" size="sm">
      Listings
    </Button>
  </Box>
</SimpleGrid>

    </Box>
  );
};

export default SellerDashboard;
