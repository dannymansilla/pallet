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
  Switch,
  FormControl,
  FormLabel,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { getSellerListings } from "../../services/api";

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
  },
  // Add more...
];

const SellerListingsPage = () => {
  const navigate = useNavigate();
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // For demonstration, let's define the "current month" as 2025-03
  const currentMonth = "2025-03";

  // State for filters — default to current month
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedBrand, setSelectedBrand] = useState("");
  
  // State for data and toggle
  const [useSampleData, setUseSampleData] = useState(true);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allMonths, setAllMonths] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

  // Fetch data from backend when not using sample data
  useEffect(() => {
    const fetchData = async () => {
      if (!useSampleData) {
        setLoading(true);
        try {
          const filters = {};
          if (selectedMonth) filters.month = selectedMonth;
          if (selectedBrand) filters.brand = selectedBrand;
          
          const response = await getSellerListings(filters);
          setListings(response.data);
          
          // Extract unique months and brands from the response
          const months = [...new Set(response.data.map(item => item.month_year))].sort();
          const brands = [...new Set(response.data.map(item => item.brand))].sort();
          
          setAllMonths(months);
          setAllBrands(brands);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch listings:", err);
          setError("Failed to load data. Using sample data instead.");
          setUseSampleData(true);
        }
        setLoading(false);
      } else {
        // Use sample data
        setListings(sampleListings);
        setAllMonths([...new Set(sampleListings.map(l => l.monthYear))].sort());
        setAllBrands([...new Set(sampleListings.map(l => l.brand))].sort());
      }
    };

    fetchData();
  }, [useSampleData, selectedMonth, selectedBrand]);

  // Filter logic for sample data
  const filteredData = useSampleData 
    ? listings.filter((listing) => {
        // If selectedMonth is not empty AND doesn't match listing's monthYear => filter out
        if (selectedMonth && listing.monthYear !== selectedMonth) return false;
        // If selectedBrand is not empty AND doesn't match listing's brand => filter out
        if (selectedBrand && listing.brand !== selectedBrand) return false;
        return true;
      })
    : listings;

  return (
    <Box p={6} minH="100vh">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading>Seller Listings</Heading>
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

      {/* Filters */}
      <Flex gap={4} mb={4} alignItems="center">
        {/* Month Filter */}
        <Flex direction="column">
          <Text fontWeight="bold" mb={1}>Month:</Text>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            width="180px"
            size="sm"
          >
            {/* Option for seeing all months */}
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
          <Text fontWeight="bold" mb={1}>Brand:</Text>
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
              <Th isNumeric>% Volume Above MSP</Th>
              <Th isNumeric>Avg Bid Price</Th>
              <Th isNumeric>% Recovery</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredData.map((listing) => {
              // Determine if listing month is the current month
              const isCurrentMonth = listing.monthYear === currentMonth;

              return (
                <Tr
                  key={listing.id}
                  // Hover & click behavior only if it's current month
                  _hover={isCurrentMonth ? { bg: "gray.50", cursor: "pointer" } : undefined}
                  onClick={
                    isCurrentMonth ? () => navigate(`/seller/listings/${listing.id}`) : undefined
                  }
                >
                  <Td>
                    {listing.monthYear}
                    {isCurrentMonth && (
                      <Badge ml={2} colorScheme="green">
                        Active
                      </Badge>
                    )}
                  </Td>
                  <Td>{listing.brand}</Td>
                  <Td>{listing.shortDescription}</Td>
                  <Td isNumeric>${listing.msrpPerUnit.toFixed(2)}</Td>
                  <Td isNumeric>${listing.minSellingPricePerUnit.toFixed(2)}</Td>
                  <Td isNumeric>{listing.totalVolumeForSale.toLocaleString()}</Td>
                  <Td isNumeric>{listing.volumeAboveMSPPercent}%</Td>
                  <Td isNumeric>
                    ${listing.weightedAverageBidPricePerUnit.toFixed(2)}
                  </Td>
                  <Td isNumeric>{listing.recoveryRatePercent}%</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default SellerListingsPage;
