import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { getSellerOrderHistory } from "../../services/api";
import { useDataMode } from "../../context/DataModeContext";

// Extended sample data for better visualization
const sampleOrderHistory = [
  {
    id: 1,
    month: "January 2025",
    numberOfTrucks: 3,
    totalValue: 22000,
    sellers: [
      {
        sellerName: "Henkel",
        trucks: [
          {
            truckId: "T-001",
            warehouse: "Warehouse A",
            products: [
              {
                brandName: "Persil",
                productName: "Laundry Detergent",
                pricePerPallet: 2000,
                numberOfPallets: 2,
                totalValue: 4000,
              },
              {
                brandName: "Persil",
                productName: "Laundry Detergent - Sensitive",
                pricePerPallet: 2100,
                numberOfPallets: 3,
                totalValue: 6300,
              },
            ],
          },
          {
            truckId: "T-002",
            warehouse: "Warehouse B",
            products: [
              {
                brandName: "Loctite",
                productName: "Adhesive - Strong Bond",
                pricePerPallet: 1500,
                numberOfPallets: 4,
                totalValue: 6000,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    month: "February 2025",
    numberOfTrucks: 2,
    totalValue: 18000,
    sellers: [
      {
        sellerName: "Healthy Foods",
        trucks: [
          {
            truckId: "T-003",
            warehouse: "Warehouse C",
            products: [
              {
                brandName: "Healthy Foods",
                productName: "Protein Bar - Chocolate",
                pricePerPallet: 1200,
                numberOfPallets: 5,
                totalValue: 6000,
              },
              {
                brandName: "Healthy Foods",
                productName: "Vegan Protein Powder",
                pricePerPallet: 1400,
                numberOfPallets: 3,
                totalValue: 4200,
              },
            ],
          },
          {
            truckId: "T-004",
            warehouse: "Warehouse D",
            products: [
              {
                brandName: "Healthy Foods",
                productName: "Meal Replacement Shake",
                pricePerPallet: 2000,
                numberOfPallets: 4,
                totalValue: 8000,
              },
            ],
          },
        ],
      },
    ],
  },
];

const OrderHistoryPage = ({ sellerId }) => {
  const { useSampleData } = useDataMode();
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!useSampleData) {
      setLoading(true);
      setError(null);
      getSellerOrderHistory(sellerId)
        .then((response) => {
          // Handle empty or invalid response
          if (!response?.data) {
            setLiveData([]);
            return;
          }

          // Ensure we have an array of data
          const orderData = Array.isArray(response.data) ? response.data : [];
          setLiveData(orderData);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching order history:", err);
          setError("Failed to load order history. Please try again later.");
          setLiveData([]);
        })
        .finally(() => setLoading(false));
    }
  }, [sellerId, useSampleData]);

  const displayData = useSampleData ? sampleOrderHistory : liveData;

  if (loading) {
    return (
      <Center p={6}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error loading order history</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Center>
    );
  }

  if (!displayData.length) {
    return (
      <Center p={6}>
        <VStack spacing={4}>
          <Text fontSize="lg" fontWeight="medium">
            No order history to display
          </Text>
          <Text color="gray.500">
            There are no completed orders at this time.
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={4}>
      <VStack align="start" spacing={6}>
        {displayData.map((monthEntry) => (
          <Box key={monthEntry.id} w="100%">
            <Text fontSize="xl" fontWeight="semibold" mb={2}>{monthEntry.month}</Text>
            {monthEntry.sellers.map((seller) => (
              <Box key={seller.sellerName} borderWidth="1px" borderRadius="lg" p={4} mb={4} w="100%">
                <Text fontWeight="bold" mb={2}>{seller.sellerName}</Text>
                {seller.trucks.map((truck) => (
                  <Box key={truck.truckId} mb={4}>
                    <Text fontWeight="semibold" mb={1}>Truck: {truck.truckId} ({truck.warehouse})</Text>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Brand</Th>
                          <Th>Product</Th>
                          <Th isNumeric>Price/Pallet</Th>
                          <Th isNumeric>Pallets</Th>
                          <Th isNumeric>Total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {truck.products.map((product, idx) => (
                          <Tr key={idx}>
                            <Td>{product.brandName}</Td>
                            <Td>{product.productName}</Td>
                            <Td isNumeric>${product.pricePerPallet.toLocaleString()}</Td>
                            <Td isNumeric>{product.numberOfPallets}</Td>
                            <Td isNumeric>${product.totalValue.toLocaleString()}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default OrderHistoryPage;
