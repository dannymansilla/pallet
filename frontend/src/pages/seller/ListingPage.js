import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { getSellerListings } from "../../services/api";
import { useDataMode } from "../../context/DataModeContext";
import { InfoIcon } from "@chakra-ui/icons";

/**
 * SAMPLE DATA for demonstration:
 */
const sampleListings = [
  {
    id: "L01",
    monthYear: "2025-03",
    brand: "Henkel",
    shortDescription: "Persil Detergent",
    msrpPerUnit: 3.5,
    minSellingPricePerUnit: 2.0,
    totalVolumeForSale: 10000,
    volumeAboveMSPPercent: 40,
    weightedAverageBidPricePerUnit: 2.25,
    recoveryRatePercent: 64,
    // Optional: for "active" highlighting in the table
    isCurrentMonth: false,
  },
  {
    id: "L02",
    monthYear: "2025-03",
    brand: "Henkel",
    shortDescription: "Persil Tabs",
    msrpPerUnit: 3.8,
    minSellingPricePerUnit: 2.1,
    totalVolumeForSale: 5000,
    volumeAboveMSPPercent: 50,
    weightedAverageBidPricePerUnit: 2.5,
    recoveryRatePercent: 71,
    isCurrentMonth: false,
  },
  {
    id: "L03",
    monthYear: "2025-02",
    brand: "Henkel",
    shortDescription: "Persil Pods",
    msrpPerUnit: 3.2,
    minSellingPricePerUnit: 1.9,
    totalVolumeForSale: 8000,
    volumeAboveMSPPercent: 60,
    weightedAverageBidPricePerUnit: 2.1,
    recoveryRatePercent: 55,
    isCurrentMonth: false,
  },
];

const EmptyStateMessage = ({ title, description }) => (
  <Center p={8}>
    <VStack spacing={4}>
      <Icon as={InfoIcon} w={8} h={8} color="gray.400" />
      <Text fontSize="lg" fontWeight="bold">{title}</Text>
      <Text color="gray.600" textAlign="center">{description}</Text>
    </VStack>
  </Center>
);

const SellerListingsPage = () => {
  const navigate = useNavigate();
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { useSampleData } = useDataMode();

  // Current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7);

  // State for filters
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedBrand, setSelectedBrand] = useState("");

  // State for data
  const [listings, setListings] = useState([]);
  const [allMonths, setAllMonths] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  
  // Loading/error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Transform the API’s real data into the same shape
   * as your sample listings for consistent display.
   */
  const transformListing = (apiItem) => {
    return {
      id: apiItem.id,
      // unify naming: monthYear vs month_year
      monthYear: apiItem.month_year,
      brand: apiItem.brand,
      shortDescription: apiItem.short_description,
      msrpPerUnit: parseFloat(apiItem.msrp_per_unit),
      minSellingPricePerUnit: parseFloat(apiItem.min_selling_price_per_unit),
      totalVolumeForSale: apiItem.total_volume_for_sale,
      volumeAboveMSPPercent: apiItem.volume_above_msp_percent,
      weightedAverageBidPricePerUnit: apiItem.weighted_average_bid_price_per_unit,
      recoveryRatePercent: apiItem.recovery_rate_percent,
      // Mark if it's current month from the API
      // (or we can also check if month_year === currentMonth)
      isCurrentMonth: apiItem.is_current_month,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (useSampleData) {
        // Use sample data
        setLoading(false);
        setError(null);

        // Mark sample data if it matches currentMonth
        const updatedSamples = sampleListings.map((item) => ({
          ...item,
          isCurrentMonth: item.monthYear === currentMonth,
        }));

        setListings(updatedSamples);

        // Extract unique months & brands
        const months = [...new Set(updatedSamples.map(l => l.monthYear))].sort();
        const brands = [...new Set(updatedSamples.map(l => l.brand))].sort();

        setAllMonths(months);
        setAllBrands(brands);
      } else {
        // Real data from your API
        setLoading(true);
        setError(null);
        try {
          // Build filters for the API
          const filters = {};
          if (selectedMonth) filters.month = selectedMonth;
          if (selectedBrand) filters.brand = selectedBrand;

          const response = await getSellerListings(filters);
          if (!response) {
            setListings([]);
            setError("No response from server. Please try again later.");
            setLoading(false);
            return;
          }

          // If your API returns an array directly, transform each item
          // If your API uses response.data, adjust accordingly
          const rawData = response.data ?? response; 
          const transformed = rawData.map(transformListing);

          setListings(transformed);
          setError(null);

          // Extract unique months & brands from the transformed data
          const months = [...new Set(transformed.map(item => item.monthYear))].sort();
          const brands = [...new Set(transformed.map(item => item.brand))].sort();

          setAllMonths(months);
          setAllBrands(brands);
        } catch (err) {
          console.error("Failed to fetch listings:", err);
          setError("Failed to load data. Please try again later.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [useSampleData, selectedMonth, selectedBrand, currentMonth]);

  // Filter logic for our *already-transformed* data
  const filteredData = listings.filter((listing) => {
    if (selectedMonth && listing.monthYear !== selectedMonth) return false;
    if (selectedBrand && listing.brand !== selectedBrand) return false;
    return true;
  });

  return (
    <Box p={6} minH="100vh">
      <Heading mb={4}>Seller Listings</Heading>

      {/* Error Message */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Flex justify="center" mb={4}>
          <Spinner size="xl" />
        </Flex>
      )}

      {/* Empty State (for real data mode) */}
      {!useSampleData && !loading && listings.length === 0 && !error && (
        <EmptyStateMessage
          title="No Listings Available"
          description="Your listings will appear here once you create your first listing."
        />
      )}

      {/* Filters + Table Display (if we have data, or in sample mode) */}
      {((!useSampleData && listings.length > 0) || useSampleData) && (
        <>
          {/* Filters */}
          <Flex gap={4} mb={4} alignItems="center">
            {/* Month Filter */}
            <Flex direction="column">
              <Text fontWeight="bold" mb={1}>
                Month:
              </Text>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                width="180px"
                size="sm"
              >
                {/* "All Months" option */}
                <option value="">All Months</option>
                {allMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </Select>
            </Flex>

            {/* Brand Filter */}
            <Flex direction="column">
              <Text fontWeight="bold" mb={1}>
                Brand:
              </Text>
              <Select
                placeholder="All Brands"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                width="180px"
                size="sm"
              >
                {allBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </Select>
            </Flex>
          </Flex>

          {/* Table of listings */}
          <Box
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            overflowX="auto"
          >
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>Listing Month</Th>
                  <Th>Brand</Th>
                  <Th>Short Description</Th>
                  <Th isNumeric>MSRP/Unit</Th>
                  <Th isNumeric>Min Selling Price</Th>
                  <Th isNumeric>Total Volume</Th>
                  <Th isNumeric>% Volume Above Reserve Price</Th>
                  <Th isNumeric>Avg Bid Price</Th>
                  <Th isNumeric>% Recovery</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map((listing) => {
                  // If the API sets isCurrentMonth = true, use that
                  // Or you can also do a fallback check: listing.monthYear === currentMonth
                  const isCurrent = listing.isCurrentMonth === true;

                  return (
                    <Tr
                      key={listing.id}
                      _hover={isCurrent ? { bg: "gray.50", cursor: "pointer" } : undefined}
                      onClick={
                        isCurrent ? () => navigate(`/seller/listings/${listing.id}`) : undefined
                      }
                    >
                      <Td>
                        {listing.monthYear}
                        {isCurrent && (
                          <Badge ml={2} colorScheme="green">
                            Active
                          </Badge>
                        )}
                      </Td>
                      <Td>{listing.brand}</Td>
                      <Td>{listing.shortDescription}</Td>
                      <Td isNumeric>${(listing.msrpPerUnit || 0).toFixed(2)}</Td>
                      <Td isNumeric>${(listing.minSellingPricePerUnit || 0).toFixed(2)}</Td>
                      <Td isNumeric>{(listing.totalVolumeForSale || 0).toLocaleString()}</Td>
                      <Td isNumeric>{(listing.volumeAboveMSPPercent || 0).toFixed(2)}%</Td>
                      <Td isNumeric>
                        ${(listing.weightedAverageBidPricePerUnit || 0).toFixed(2)}
                      </Td>
                      <Td isNumeric>{(listing.recoveryRatePercent || 0).toFixed(2)}%</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SellerListingsPage;
