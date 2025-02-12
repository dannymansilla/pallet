import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { fetchAuctionTrucks } from "../../services/api"; // Mock API call

const AuctionTrucksPage = ({ auctionId }) => {
  const [auctionData, setAuctionData] = useState(null);
  const bgColor = useColorModeValue("white", "gray.700");

  useEffect(() => {
    const loadTrucks = async () => {
      try {
        const response = await fetchAuctionTrucks(auctionId);
        setAuctionData(response.data);
      } catch (error) {
        console.error("Failed to fetch trucks", error);
      }
    };
    loadTrucks();
  }, [auctionId]);

  if (!auctionData) {
    return <Text>Loading auction data...</Text>;
  }

  const { auction_summary, trucks } = auctionData;

  return (
    <Box bg={bgColor} p={6} minH="100vh">
      {/* Auction Summary */}
      <Heading mb={4}>Auction Summary</Heading>
      <Box bg="gray.100" p={4} borderRadius="lg" mb={6}>
        <Text fontSize="lg"><strong>Auction Name:</strong> {auction_summary.auction_name}</Text>
        <Text fontSize="lg"><strong>Auction Closed:</strong> {auction_summary.auction_closed}</Text>
        <Text fontSize="lg"><strong>Total Trucks:</strong> {auction_summary.total_trucks}</Text>
        <Text fontSize="lg"><strong>Total Buyers Awarded:</strong> {auction_summary.total_buyers_awarded}</Text>
        <Text fontSize="lg"><strong>Total Auction Revenue:</strong> ${auction_summary.total_auction_revenue.toLocaleString()}</Text>
      </Box>

      {/* Truck Breakdown Section */}
      <Heading size="lg" mb={4}>Trucks Built from Auction</Heading>
      <Accordion allowMultiple>
        {trucks.map((truck, index) => (
          <AccordionItem key={truck.truck_id}>
            <h2>
              <AccordionButton _expanded={{ bg: "blue.500", color: "white" }}>
                <Box flex="1" textAlign="left">
                  🚛 <strong>Truck {index + 1} → {truck.destination}</strong>
                  <Badge ml={4} colorScheme="green">{truck.buyer}</Badge>
                  <Text ml={4} fontSize="sm"><strong>Revenue:</strong> ${truck.truck_revenue.toLocaleString()}</Text>
                  <Text ml={4} fontSize="sm"><strong>Weight:</strong> {truck.truck_weight.toLocaleString()} lbs</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Quantity</Th>
                    <Th>Pallets</Th>
                    <Th>Weight</Th>
                    <Th>SKU</Th>
                    <Th>Unit Price</Th>
                    <Th>Total Price</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {truck.items.map((item) => (
                    <Tr key={item.sku}>
                      <Td>{item.name}</Td>
                      <Td>{item.quantity.toLocaleString()}</Td>
                      <Td>{item.pallets}</Td>
                      <Td>{item.weight.toLocaleString()} lbs</Td>
                      <Td>{item.sku}</Td>
                      <Td>${item.awarded_price_per_unit.toFixed(2)}</Td>
                      <Td>${item.total_price.toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default AuctionTrucksPage;
