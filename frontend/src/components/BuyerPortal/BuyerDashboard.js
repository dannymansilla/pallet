import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Image,
  VStack,
  HStack,
  Select,
  Badge,
  FormControl,
  FormLabel,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import cardboardbox from '../../images/cardboardbox.png';
import { getBuyerDashboard, requestNetworkJoin } from "../../services/api";
// TODO: Add pagination
/**
 * SAMPLE DATA
 */
const favoriteSellers = [
  { id: "SEL-101", name: "Daily Health" },
  { id: "SEL-102", name: "Best Snacks Co." },
  { id: "SEL-103", name: "Power Protein Inc." },
];

const auctionItems = [
  {
    id: "AUC-001",
    name: "Chocolate Protein Bars",
    currentBid: 2500,
    endDate: "2025-04-10",
    imageUrl: {cardboardbox},
    category: "Snacks",
    seller: "Daily Health",
    sellerId: 1,
    description: "Delicious high-protein bars perfect for a quick snack.",
    is_in_network: true,
    network_status: "active",
  },
  {
    id: "AUC-002",
    name: "Citrus Energy Drinks",
    currentBid: 1800,
    endDate: "2025-04-12",
    imageUrl: {cardboardbox},
    category: "Drinks",
    seller: "Best Snacks Co.",
    sellerId: 2,
    description: "A refreshing boost of energy with a citrus twist.",
    is_in_network: false,
    network_status: "not_in_network",
  },
  {
    id: "AUC-003",
    name: "Trail Mix - Cranberry",
    currentBid: 1200,
    endDate: "2025-04-15",
    imageUrl: {cardboardbox},
    category: "Snacks",
    seller: "Power Protein Inc.",
    sellerId: 3,
    description: "Hearty trail mix loaded with cranberries and nuts.",
    is_in_network: true,
    network_status: "active",
  },
  {
    id: "AUC-004",
    name: "Vanilla Whey Protein",
    currentBid: 3200,
    endDate: "2025-05-01",
    imageUrl: {cardboardbox},
    category: "Protein",
    seller: "Power Protein Inc.",
    sellerId: 3,
    description: "High-quality whey isolate with a smooth vanilla flavor.",
    is_in_network: true,
    network_status: "active",
  },
  {
    id: "AUC-005",
    name: "Berry Granola Bars",
    currentBid: 900,
    endDate: "2025-04-20",
    imageUrl: {cardboardbox},
    category: "Snacks",
    seller: "Best Snacks Co.",
    sellerId: 2,
    description: "Crunchy granola bars bursting with berry flavors.",
    is_in_network: false,
    network_status: "pending",
  },
  {
    id: "AUC-006",
    name: "Electrolyte Sports Drink",
    currentBid: 2200,
    endDate: "2025-04-22",
    imageUrl: {cardboardbox},
    category: "Drinks",
    seller: "Daily Health",
    sellerId: 1,
    description: "Replenish your electrolytes during intense workouts.",
    is_in_network: true,
    network_status: "active",
  },
];

const CATEGORIES = ["All Categories", "Snacks", "Drinks", "Protein"];

const BuyerDashboard = () => {
  // Styling with color mode
  const pageBgGradient = 'white';
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const accentBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  // State for data
  const [useSampleData, setUseSampleData] = useState(true);
  const [listings, setListings] = useState([]);
  const [favoriteSellersList, setFavoriteSellersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search and category
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Categories");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!useSampleData) {
        setLoading(true);
        try {
          const response = await getBuyerDashboard();
          setListings(response.data.listings);
          setFavoriteSellersList(response.data.favorite_sellers);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch buyer dashboard data:", err);
          setError("Failed to load data. Using sample data instead.");
          setUseSampleData(true);
        }
        setLoading(false);
      } else {
        // Use sample data
        setListings(auctionItems);
        setFavoriteSellersList(favoriteSellers);
      }
    };

    fetchData();
  }, [useSampleData]);

  // Handle network join request
  const handleJoinNetwork = async (sellerId) => {
    try {
      const response = await requestNetworkJoin(sellerId);
      toast({
        title: "Network Request",
        description: response.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // If using real data, refresh the dashboard
      if (!useSampleData) {
        const dashboardResponse = await getBuyerDashboard();
        setListings(dashboardResponse.data.listings);
        setFavoriteSellersList(dashboardResponse.data.favorite_sellers);
      } else {
        // Update sample data
        setListings(prevListings => 
          prevListings.map(item => 
            item.sellerId === sellerId 
              ? { ...item, network_status: 'pending' } 
              : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to request network join:", err);
      toast({
        title: "Error",
        description: "Failed to send network request. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Filter logic
  const filteredItems = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeCategory === "All Categories") return true;
      return item.category === activeCategory;
    });
  }, [listings, searchQuery, activeCategory]);

  // Render network status badge
  const renderNetworkStatus = (item) => {
    if (item.network_status === 'active') {
      return <Badge colorScheme="green">In Network</Badge>;
    } else if (item.network_status === 'pending') {
      return <Badge colorScheme="yellow">Request Pending</Badge>;
    } else {
      return (
        <Button 
          size="xs" 
          colorScheme="blue" 
          onClick={() => handleJoinNetwork(item.sellerId)}
        >
          Request to Join Network
        </Button>
      );
    }
  };

  return (
    <Flex
      flexDirection="column"
      bg={pageBgGradient}
      p={6}
    >
      {/* PAGE HEADING AND TOGGLE */}
      <Flex justify="space-between" align="center" mb={4}>
        <Heading color={textColor}>
          Marketplace
        </Heading>
        <FormControl display="flex" alignItems="center" w="auto">
          <FormLabel htmlFor="sample-data" mb="0" mr={2}>
            Use Sample Data
          </FormLabel>
          <Switch
            id="sample-data"
            isChecked={useSampleData}
            onChange={(e) => setUseSampleData(e.target.checked)}
          />
        </FormControl>
      </Flex>

      {/* Error Message if any */}
      {error && (
        <Box mb={6} p={4} bg="red.100" color="red.700" borderRadius="md">
          {error}
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box mb={6} p={4} bg="blue.100" color="blue.700" borderRadius="md">
          Loading data...
        </Box>
      )}

      {/* Favorite Sellers Section */}
      <Box
        mb={6}
        p={4}
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
      >
        <Text fontSize="lg" mb={3} fontWeight="semibold" color={textColor}>
          Your Favorite Sellers
        </Text>
        <SimpleGrid columns={[1, 3, 3]} spacing="20px">
          {favoriteSellersList.map((seller) => (
            <Button
              key={seller.id}
              variant="outline"
              bg={accentBg}
              as={NavLink} 
              to="/sellerpage"
              borderColor={borderColor}
              _hover={{ bg: "blue.100" }}
            >
              {seller.name}
            </Button>
          ))}
        </SimpleGrid>
      </Box>

      {/* Search & Category */}
      <HStack mb={6} spacing={4} w="100%">
        <Box w={["40%", "30%", "15%"]}>
          <Select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            bg={accentBg}
            color={textColor}
            borderColor={borderColor}
            borderRadius="md"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </Box>
        <Box flex="1">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={accentBg}
              color={textColor}
              borderRadius="md"
            />
          </InputGroup>
        </Box>
      </HStack>

      {/* Auction Items Grid */}
      <SimpleGrid columns={[1, 3, 3]} spacing={6}>
        {filteredItems.map((item) => (
          <Box
            key={item.id}
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
            <VStack align="start" spacing={3}>
              <Image
                src={cardboardbox}
                alt={item.name}
                borderRadius="md"
                w="100%"
                maxH="300px"
                objectFit="cover"
                mb={2}
              />
              <Box>
                <Heading size="sm" mb={1}>
                  {item.name}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  {item.seller}
                </Text>
                {renderNetworkStatus(item)}
              </Box>
              <Text fontSize="sm" noOfLines={2}>
                {item.description}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Ends on: {item.endDate}
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                as={NavLink}
                to="/productdetailpage"
                // to={`/auction/${item.id}`}
              >
                Bid Now
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  );
};

export default BuyerDashboard;
