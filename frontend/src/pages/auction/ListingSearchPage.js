import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Spinner,
  Text,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import { getAvailableListings } from "../../services/api";
import SearchBar from "../../components/SearchBar";
import CategorySidebar from "../../components/CategorySidebar";
import ListingCard from "../../components/ListingCard";

const ListingSearchPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [categories, setCategories] = useState(["Beverages", "Snacks", "Cleaning Supplies"]);
  const [error, setError] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (category) filters.category = category;
      if (searchQuery) filters.product_name = searchQuery;

      const response = await getAvailableListings(filters);
      setListings(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch listings. Please try again later.");
    } finally {
      setLoading(false);
    }
}, [category, searchQuery]);

useEffect(() => {
  fetchListings();
}, [fetchListings]);

  return (
    <Box>
      {/* Sticky Search Bar */}
      <Box position="sticky" top="0" bg="white" zIndex="base" p={4} shadow="sm">
        <Flex justify="center" align="center" w="100%">
            <Box w="100%" maxW="1600px">
            <Flex align="center">
                <IconButton
                display={{ base: "block", md: "none" }}
                icon={<FiMenu />}
                onClick={onOpen}
                aria-label="Toggle Sidebar"
                mr={4}
                />
                <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={fetchListings}
                />
            </Flex>
            </Box>
        </Flex>
    </Box>


      {/* Sidebar for larger screens */}
      <Flex maxW="1600px" mx="auto">
        <Box
          display={{ base: "none", md: "block" }}
          w="250px"
          bg="white"
          px={4}
          borderRight="1px solid"
          borderColor="gray.200"
          h="calc(100vh - 64px)"
          position="sticky"
          top="64px"
        >
          <CategorySidebar
            categories={categories}
            selected={category}
            onSelect={(cat) => setCategory(cat)}
          />
        </Box>

        {/* Main Content */}
        <Box flex="1" p={6}>
          {loading ? (
            <Spinner size="xl" />
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : listings.length === 0 ? (
            <Text>No listings available for your search criteria.</Text>
          ) : (
            <SimpleGrid columns={[1, 2, 3]} spacing={6}>
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onViewDetails={(id) => (window.location.href = `/auction/details/${id}`)}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Flex>

      {/* Sidebar Drawer for mobile screens */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <CategorySidebar
              categories={categories}
              selected={category}
              onSelect={(cat) => {
                setCategory(cat);
                onClose();
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default ListingSearchPage;
