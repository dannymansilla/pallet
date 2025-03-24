import React, { useState, useMemo } from "react";
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
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";

// Example child components
import OpenBidsTable from "../../components/BuyerPortal/OpenBidsTable";
import OrderHistoryPage from "../../components/BuyerPortal/OrderHistoryPage";

// Placeholder image
import cardboardbox from "../../images/cardboardbox.png";

/** 
 * SAMPLE DATA 
 * (Adjust to match your real data structure)
 */
const sampleWarehouses = ["All Warehouses", "Warehouse A", "Warehouse B"];
const sampleCategories = ["All Categories", "Snacks", "Drinks", "Protein", "Supplements"];

const sampleProducts = [
  {
    productId: "P-001",
    name: "Protein Bar - Chocolate",
    description: "High-protein chocolate bar.",
    warehouse: "Warehouse A",
    category: "Snacks",
    imageUrl: cardboardbox,
  },
  {
    productId: "P-002",
    name: "Energy Drink - Citrus",
    description: "Refreshing energy drink.",
    warehouse: "Warehouse A",
    category: "Drinks",
    imageUrl: cardboardbox,
  },
  {
    productId: "P-003",
    name: "Protein Powder - Vanilla",
    description: "25g protein per scoop.",
    warehouse: "Warehouse B",
    category: "Protein",
    imageUrl: cardboardbox,
  },
  {
    productId: "P-004",
    name: "Whey Isolate",
    description: "Ultra-filtered whey isolate.",
    warehouse: "Warehouse B",
    category: "Protein",
    imageUrl: cardboardbox,
  },
  {
    productId: "P-005",
    name: "Vitamin Supplements",
    description: "Multivitamin and minerals.",
    warehouse: "Warehouse B",
    category: "Supplements",
    imageUrl: cardboardbox,
  },
  {
    productId: "P-006",
    name: "Granola Bar - Berry",
    description: "Healthy berries in each bite.",
    warehouse: "Warehouse A",
    category: "Snacks",
    imageUrl: cardboardbox,
  },
];

const SellerPage = () => {
  // Sub-page navigation
  const [activeTab, setActiveTab] = useState("sales");

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");

  // Chakra color mode styling
  const bgColor = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const accentBg = useColorModeValue("gray.50", "gray.700");

  /**
   * Filtering logic
   * - Matches search query in name or description.
   * - Matches selected category (unless it's "All").
   * - Matches selected warehouse (unless it's "All").
   */
  const filteredProducts = useMemo(() => {
    return sampleProducts.filter((prod) => {
      const queryMatch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!queryMatch) return false;

      if (selectedCategory !== "All" && prod.category !== selectedCategory) {
        return false;
      }
      if (selectedWarehouse !== "All" && prod.warehouse !== selectedWarehouse) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedWarehouse]);

  /**
   * SALES PAGE CONTENT
   */
  const renderSalesPage = () => {
    return (
      <Box mt={4}>
        {/* Search & Filters Row */}
        <HStack mb={6} spacing={4} w="100%">
          {/* Category Filter */}
          <Box w={["40%", "30%", "15%"]}>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              bg={accentBg}
              color={textColor}
              borderColor={borderColor}
              borderRadius="md"
            >
              {sampleCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </Box>

          {/* Warehouse Filter */}
          <Box w={["40%", "30%", "15%"]}>
            <Select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              bg={accentBg}
              color={textColor}
              borderColor={borderColor}
              borderRadius="md"
            >
              {sampleWarehouses.map((wh) => (
                <option key={wh} value={wh}>
                  {wh}
                </option>
              ))}
            </Select>
          </Box>
          {/* Search Bar */}
          <Box flex="1">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={accentBg}
                color={textColor}
                borderRadius="md"
              />
            </InputGroup>
          </Box>

          
        </HStack>

        {/* Product Grid */}
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {filteredProducts.map((prod) => (
            <Box
              key={prod.productId}
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
              color={textColor}
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ boxShadow: "lg", transform: "scale(1.01)" }}
            >
              <Flex>
                <Image
                  src={prod.imageUrl}
                  alt={prod.name}
                  boxSize="80px"
                  objectFit="cover"
                  borderRadius="md"
                  mr={4}
                />
                <VStack align="start" spacing={1}>
                  <Heading size="sm">{prod.name}</Heading>
                  <Text fontSize="xs" color="gray.500">
                    {prod.description}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    as={NavLink}
                    to="/productdetailpage"
                  >
                    Bid Now
                  </Button>
                </VStack>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    );
  };

  /**
   * OPEN BIDS PAGE CONTENT
   */
  const renderOpenBidsPage = () => {
    return (
      <Box mt={4}>
        <OpenBidsTable />
      </Box>
    );
  };

  /**
   * ORDER HISTORY PAGE CONTENT
   */
  const renderOrderHistoryPage = () => {
    return (
      <Box mt={4}>
        <OrderHistoryPage />
      </Box>
    );
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* TOP BAR (Sub-page Navigation) */}
      <Box
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        px={[4, 6, 8]}
        py={4}
      >
        <Heading size="lg" mb={2}>
          Best Snacks Co.
        </Heading>
        <ButtonGroup spacing={4}>
          <Button
            variant={activeTab === "sales" ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => setActiveTab("sales")}
          >
            Sales
          </Button>
          <Button
            variant={activeTab === "openBids" ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => setActiveTab("openBids")}
          >
            Open Bids
          </Button>
          <Button
            variant={activeTab === "orderHistory" ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => setActiveTab("orderHistory")}
          >
            Order History
          </Button>
        </ButtonGroup>
      </Box>

      {/* MAIN CONTENT SWITCHER */}
      <Box px={[4, 6, 8]} py={[4, 6, 8]}>
        {activeTab === "sales" && renderSalesPage()}
        {activeTab === "openBids" && renderOpenBidsPage()}
        {activeTab === "orderHistory" && renderOrderHistoryPage()}
      </Box>
    </Box>
  );
};

export default SellerPage;
