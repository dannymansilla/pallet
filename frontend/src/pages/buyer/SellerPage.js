import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  SimpleGrid,
  Text,
  Image,
  VStack,
  HStack,
  Select,
  useColorModeValue,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import { getSellerProducts, getSellerOpenBids, getSellerOrderHistory } from "../../services/api";
import { useDataMode } from "../../context/DataModeContext";
import cardboardbox from "../../images/cardboardbox.png";

// Example child components
import OpenBidsTable from "../../components/BuyerPortal/OpenBidsTable";
import OrderHistoryPage from "../../components/BuyerPortal/OrderHistoryPage";

const getImageUrl = (image) => {
  if (process.env.NODE_ENV === 'production') {
    return '/images/cardboardbox.png';
  }
  return image;
};

const SellerPage = () => {
  const { sellerId } = useParams();
  const toast = useToast();
  const { useSampleData } = useDataMode();
  
  // State for data
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses");
  const [activeTab, setActiveTab] = useState("sales");

  // Get unique warehouses from products
  const warehouses = useMemo(() => {
    if (useSampleData) return ["All Warehouses", "Warehouse A", "Warehouse B"];
    
    const uniqueWarehouses = new Set(
      (sellerData?.products || [])
        .map(prod => prod.warehouse_name)
        .filter(Boolean)
    );
    return ["All Warehouses", ...Array.from(uniqueWarehouses)];
  }, [sellerData?.products, useSampleData]);

  // Get unique categories from products
  const categories = useMemo(() => {
    if (useSampleData) return ["All Categories", "Snacks", "Drinks", "Protein", "Supplements"];
    
    const uniqueCategories = new Set(
      (sellerData?.products || [])
        .map(prod => prod.product_brand)
        .filter(Boolean)
    );
    return ["All Categories", ...Array.from(uniqueCategories)];
  }, [sellerData?.products, useSampleData]);

  // Chakra color mode styling
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Fetch seller data
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!useSampleData && sellerId) {
        setLoading(true);
        setError(null);
        try {
          const [productsData, bidsData, ordersData] = await Promise.all([
            getSellerProducts(sellerId),
            getSellerOpenBids(sellerId),
            getSellerOrderHistory(sellerId)
          ]);
          
          setSellerData({
            products: productsData.listings,
            bids: bidsData,
            orders: ordersData,
            sellerInfo: productsData.seller_info,
            networkStatus: productsData.network_status
          });
        } catch (err) {
          console.error("Failed to fetch seller data:", err);
          setError(err.response?.data?.error || "Failed to load seller data");
          toast({
            title: "Error",
            description: "Failed to load seller data. Using sample data instead.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId, useSampleData, toast]);

  // Sample data (fallback)
  const sampleProducts = useMemo(() => [
    {
      id: "L-001",
      product_name: "Protein Bar - Chocolate",
      product_description: "High-protein chocolate bar made with organic whey and no added sugar.",
      product_brand: "PowerProtein",
      warehouse_name: "Warehouse A",
      quantity_available: 1000,
      reserve_price: 1.50,
      end_date: "2025-05-25T23:59:59Z",
      current_highest_bid: {
        price: 1.75,
        quantity: 500
      }
    },
    {
      id: "L-002",
      product_name: "Vegan Trail Mix",
      product_description: "Gluten-free mix of nuts, seeds, and dried fruit. Perfect for snacking.",
      product_brand: "Daily Health Snacks",
      warehouse_name: "Warehouse A",
      quantity_available: 800,
      reserve_price: 2.20,
      end_date: "2025-05-28T23:59:59Z",
      current_highest_bid: {
        price: 2.40,
        quantity: 600
      }
    },
    {
      id: "L-003",
      product_name: "Coconut Water Electrolyte Drink",
      product_description: "Hydrating beverage with natural electrolytes and no added sugar.",
      product_brand: "HydraLife",
      warehouse_name: "Warehouse B",
      quantity_available: 1200,
      reserve_price: 1.10,
      end_date: "2025-05-30T23:59:59Z",
      current_highest_bid: {
        price: 1.20,
        quantity: 400
      }
    },
    {
      id: "L-004",
      product_name: "Organic Granola Clusters",
      product_description: "Whole grain oats with honey and chia seeds in snackable clusters.",
      product_brand: "Daily Health Pantry",
      warehouse_name: "Warehouse B",
      quantity_available: 900,
      reserve_price: 3.00,
      end_date: "2025-05-27T23:59:59Z",
      current_highest_bid: {
        price: 3.25,
        quantity: 750
      }
    },
    {
      id: "L-005",
      product_name: "Herbal Disinfectant Wipes",
      product_description: "Plant-based surface wipes with essential oils. Alcohol-free.",
      product_brand: "EcoClean Home",
      warehouse_name: "Warehouse C",
      quantity_available: 1500,
      reserve_price: 2.50,
      end_date: "2025-05-29T23:59:59Z",
      current_highest_bid: {
        price: 2.70,
        quantity: 1000
      }
    }
  ], []);
  

  const sampleBids = [
    {
      id: "B-001",
      listing_id: "L-001",
      product_name: "Protein Bar - Chocolate",
      bid_price: 1.75,
      bid_quantity: 400,
      timestamp: "2025-03-28T14:30:00Z"
    },
    // ... more sample bids
  ];

  const sampleOrders = [
    {
      id: "O-001",
      order_date: "2025-03-27T10:00:00Z",
      total_price: 875.00,
      order_status: "completed",
      line_items: [
        {
          product_name: "Protein Bar - Chocolate",
          quantity: 500,
          price: 1.75
        }
      ]
    },
    // ... more sample orders
  ];

  // Filter logic
  const filteredProducts = useMemo(() => {
    const currentProducts = useSampleData ? sampleProducts : (sellerData?.products || []);
    
    return currentProducts.filter((prod) => {
      const queryMatch =
        prod.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.product_description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!queryMatch) return false;

      if (selectedCategory !== "All Categories" && prod.product_brand !== selectedCategory) {
        return false;
      }
      if (selectedWarehouse !== "All Warehouses" && prod.warehouse_name !== selectedWarehouse) {
        return false;
      }
      return true;
    });
  }, [useSampleData, sellerData?.products, searchQuery, selectedCategory, selectedWarehouse, sampleProducts]);

  // Render network status badge
  const renderNetworkStatus = () => {
    if (useSampleData) return null;
    
    const status = sellerData?.networkStatus;
    if (status === 'active') {
      return <Badge colorScheme="green">In Network</Badge>;
    } else if (status === 'pending') {
      return <Badge colorScheme="yellow">Request Pending</Badge>;
    } else {
      return <Badge colorScheme="gray">Not in Network</Badge>;
    }
  };

  /**
   * SALES PAGE CONTENT
   */
  const renderSalesPage = () => (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Available Products</Heading>
      </Flex>

      <Flex gap={4} mb={6}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <Select
          maxW="200px"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <Select
          maxW="200px"
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
        >
          {warehouses.map((warehouse) => (
            <option key={warehouse} value={warehouse}>
              {warehouse}
            </option>
          ))}
        </Select>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {filteredProducts.map((prod) => (
          <Box
            key={prod.id}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="lg"
            p={4}
            _hover={{ shadow: "md" }}
          >
            <Flex>
              <Image
                src={getImageUrl(cardboardbox)}
                alt={prod.product_name}
                boxSize="80px"
                objectFit="cover"
                borderRadius="md"
                mr={4}
              />
              <VStack align="start" spacing={1}>
                <Heading size="sm">{prod.product_name}</Heading>
                <Text fontSize="xs" color="gray.500">
                  {prod.product_description}
                </Text>
                <HStack>
                  <Badge colorScheme="blue">{prod.product_brand}</Badge>
                  <Badge colorScheme="purple">{prod.warehouse_name}</Badge>
                </HStack>
                {/* <Text fontSize="sm" fontWeight="bold">
                  Reserve Price: ${prod.reserve_price}
                </Text> */}
                <Text fontSize="sm">
                  Available: {prod.quantity_available} units
                </Text>
                {prod.current_highest_bid && (
                  <Text fontSize="sm" color="green.500">
                    Current Bid: ${prod.current_highest_bid.price} for {prod.current_highest_bid.quantity} units
                  </Text>
                )}
                <Button
                  size="sm"
                  colorScheme="blue"
                  as={NavLink}
                  to={`/product/${prod.id}`}
                >
                  Place Bid
                </Button>
              </VStack>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );

  /**
   * OPEN BIDS PAGE CONTENT
   */
  const renderOpenBidsPage = () => (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Your Open Bids</Heading>
      </Flex>
      <OpenBidsTable 
        sellerId={sellerId} 
        useSampleData={useSampleData} 
        bids={sellerData?.bids || []}
      />
    </Box>
  );

  /**
   * ORDER HISTORY PAGE CONTENT
   */
  const renderOrderHistoryPage = () => (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Order History</Heading>
      </Flex>
      <OrderHistoryPage sellerId={sellerId} useSampleData={useSampleData} />
    </Box>
  );

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg">
            {useSampleData ? "Sample Seller" : sellerData?.sellerInfo?.name || "Seller"}
          </Heading>
          {renderNetworkStatus()}
        </VStack>
      </Flex>

      <ButtonGroup mb={6}>
        <Button
          colorScheme={activeTab === "sales" ? "blue" : "gray"}
          onClick={() => setActiveTab("sales")}
        >
          Products
        </Button>
        <Button
          colorScheme={activeTab === "bids" ? "blue" : "gray"}
          onClick={() => setActiveTab("bids")}
        >
          Open Bids
        </Button>
        <Button
          colorScheme={activeTab === "orders" ? "blue" : "gray"}
          onClick={() => setActiveTab("orders")}
        >
          Order History
        </Button>
      </ButtonGroup>

      {loading ? (
        <Box textAlign="center" py={10}>
          <Text>Loading...</Text>
        </Box>
      ) : error ? (
        <Box textAlign="center" py={10}>
          <Text color="red.500">{error}</Text>
        </Box>
      ) : (
        <>
          {activeTab === "sales" && renderSalesPage()}
          {activeTab === "bids" && renderOpenBidsPage()}
          {activeTab === "orders" && renderOrderHistoryPage()}
        </>
      )}
    </Box>
  );
};

export default SellerPage;
