import React, { useState, useMemo } from "react";
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
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";
import cardboardbox from '../../images/cardboardbox.png'

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
    description: "Delicious high-protein bars perfect for a quick snack.",
  },
  {
    id: "AUC-002",
    name: "Citrus Energy Drinks",
    currentBid: 1800,
    endDate: "2025-04-12",
    imageUrl: {cardboardbox},
    category: "Drinks",
    seller: "Best Snacks Co.",
    description: "A refreshing boost of energy with a citrus twist.",
  },
  {
    id: "AUC-003",
    name: "Trail Mix - Cranberry",
    currentBid: 1200,
    endDate: "2025-04-15",
    imageUrl: {cardboardbox},
    category: "Snacks",
    seller: "Power Protein Inc.",
    description: "Hearty trail mix loaded with cranberries and nuts.",
  },
  {
    id: "AUC-004",
    name: "Vanilla Whey Protein",
    currentBid: 3200,
    endDate: "2025-05-01",
    imageUrl: {cardboardbox},
    category: "Protein",
    seller: "Power Protein Inc.",
    description: "High-quality whey isolate with a smooth vanilla flavor.",
  },
  {
    id: "AUC-005",
    name: "Berry Granola Bars",
    currentBid: 900,
    endDate: "2025-04-20",
    imageUrl: {cardboardbox},
    category: "Snacks",
    seller: "Best Snacks Co.",
    description: "Crunchy granola bars bursting with berry flavors.",
  },
  {
    id: "AUC-006",
    name: "Electrolyte Sports Drink",
    currentBid: 2200,
    endDate: "2025-04-22",
    imageUrl: {cardboardbox},
    category: "Drinks",
    seller: "Daily Health",
    description: "Replenish your electrolytes during intense workouts.",
  },
];

const CATEGORIES = ["All Categories", "Snacks", "Drinks", "Protein"];

const BuyerDashboard = () => {
  // Styling with color mode
  // const pageBgGradient = useColorModeValue(
  //   "linear(to-b, gray.50, white)",
  //   "linear(to-b, gray.800, gray.900)"
  // );
  const pageBgGradient = 'white';
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const accentBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Search and category
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter logic
  const filteredItems = useMemo(() => {
    return auctionItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeCategory === "All") return true;
      return item.category === activeCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <Flex
      flexDirection="column"
      bg={pageBgGradient}
      p={[2, 2, 2]}
    >
      {/* PAGE HEADING */}
      <Heading mb={4} color={textColor}>
        Marketplace
      </Heading>

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
          {favoriteSellers.map((seller) => (
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
              </Box>
              <Text fontSize="sm" noOfLines={2}>
                {item.description}
              </Text>
              <Text fontSize="md" fontWeight="bold">
                Current Bid: ${item.currentBid.toLocaleString()}
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
