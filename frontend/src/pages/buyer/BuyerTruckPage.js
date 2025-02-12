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
  useColorModeValue,
} from "@chakra-ui/react";
import { fetchBuyerTrucks } from "../../services/api"; // Mock API call

const BuyerTrucksPage = ({ buyerId }) => {
  const [buyerData, setBuyerData] = useState(null);
  const bgColor = useColorModeValue("white", "gray.700");

  useEffect(() => {
    const loadTrucks = async () => {
      try {
        const response = await fetchBuyerTrucks(buyerId);
        setBuyerData(response.data);
      } catch (error) {
        console.error("Failed to fetch buyer trucks", error);
      }
    };
    loadTrucks();
  }, [buyerId]);

  if (!buyerData) {
    return <Text>Loading your awarded trucks...</Text>;
  }

  const { buyer_summary, trucks } = buyerData;

  return (
    <Box bg={bgColor} p={6} minH="100vh">
      {/* Buyer Summary */}
      <Heading mb={4}>Your Awarded Trucks</Heading>
      <Box bg="gray.100" p={4} borderRadius="lg" mb={6}>
        <Text fontSize="lg"><strong>Buyer Name:</strong> {buyer_summary.buyer_name}</Text>
        <Text fontSize="lg"><strong>Auction Closed:</strong> {buyer_summary.auction_closed}</Text>
        <Text fontSize="lg"><strong>Total Trucks Awarded:</strong> {buyer_summary.total_trucks}</Text>
        <Text fontSize="lg"><strong>Total Units Purchased:</strong> {buyer_summary.total_units.toLocaleString()}</Text>
        <Text fontSize="lg"><strong>Total Spend:</strong> ${buyer_summary.total_spent.toLocaleString()}</Text>
      </Box>

      {/* Truck Breakdown Section */}
      <Heading size="lg" mb={4}>Your Trucks</Heading>
      <Accordion allowMultiple>
        {trucks.map((truck, index) => (
          <AccordionItem key={truck.truck_id}>
            <h2>
              <AccordionButton _expanded={{ bg: "blue.500", color: "white" }}>
                <Box flex="1" textAlign="left">
                  🚛 <strong>Truck {index + 1} → {truck.destination}</strong>
                  <Text ml={4} fontSize="sm"><strong>Weight:</strong> {truck.truck_weight.toLocaleString()} lbs</Text>
                  <Text ml={4} fontSize="sm"><strong>Total Cost:</strong> ${truck.truck_total_cost.toLocaleString()}</Text>
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

export default BuyerTrucksPage;
