import React from "react";
import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  SimpleGrid,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

/**
 * SAMPLE DATA
 */
const favoriteSellers = [
  { id: "SEL-101", name: "Daily Health" },
  { id: "SEL-102", name: "Best Snacks Co." },
  { id: "SEL-103", name: "Power Protein Inc." },
];

const openBids = [
  {
    listingId: "LST-001",
    productName: "Protein Bars - Chocolate",
    currentBid: 2500,
    endDate: "2025-04-10",
    status: "Open",
    productUrl: "/products/LST-001", // link or route for the product
  },
  {
    listingId: "LST-002",
    productName: "Energy Drink - Citrus (24 pack)",
    currentBid: 1800,
    endDate: "2025-04-12",
    status: "Open",
    productUrl: "/products/LST-002",
  },
  {
    listingId: "LST-003",
    productName: "Trail Mix - Cranberry",
    currentBid: 1200,
    endDate: "2025-04-15",
    status: "Open",
    productUrl: "/products/LST-003",
  },
];

/**
 * MAIN BUYER DASHBOARD COMPONENT
 */
const OldBuyerDashboard = () => {

  // For styling
  const bgColor = useColorModeValue("white", "white");
  const sidebarBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex h="100vh" bg={bgColor}>

      {/* MAIN CONTENT AREA */}
      <Box flex="1" p={4} overflowY="auto">
        <Heading mb={6}>Dashboard</Heading>

        {/* Favorite Sellers Quick Links */}
        <Text fontSize="lg" mb={3} fontWeight="semibold">
          Your Favorite Sellers
        </Text>
        <SimpleGrid columns={[1, 2, 3]} spacing="20px" mb={6}>
          {favoriteSellers.map((seller) => (
            <Button
              key={seller.id}
              variant="outline"
              as={NavLink} to="/sellerpage"
            >
              {seller.name}
            </Button>
          ))}
        </SimpleGrid>

        {/* Table of Open Bids */}
        <Box
          bg={sidebarBg}
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
          p={4}
        >
          <Heading size="md" mb={4}>
            My Open Bids
          </Heading>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th>Listing ID</Th>
                <Th>Product Name</Th>
                <Th>Current Bid</Th>
                <Th>End Date</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {openBids.map((bid) => (
                <Tr
                  key={bid.listingId}
                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                  onClick={() => {
                    // Navigate to the product page for this listing
                    // E.g., if you're using React Router: navigate(bid.productUrl)
                    alert(`Navigating to listing: ${bid.productUrl}`);
                  }}
                >
                  <Td>{bid.listingId}</Td>
                  <Td>{bid.productName}</Td>
                  <Td>${bid.currentBid.toLocaleString()}</Td>
                  <Td>{bid.endDate}</Td>
                  <Td>{bid.status}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Flex>
  );
};

export default OldBuyerDashboard;
