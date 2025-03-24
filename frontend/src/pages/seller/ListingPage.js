import React, { useState } from "react";
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
  useColorModeValue
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

/**
 * SAMPLE DATA for demonstration:
 * Each product listing includes:
 *  - monthYear: "2025-03" or "2025-02" etc.
 *  - brand, shortDescription, msrpPerUnit, minSellingPricePerUnit
 *  - totalVolumeForSale
 *  - volumeAboveMSPPercent
 *  - weightedAverageBidPricePerUnit
 *  - recoveryRatePercent
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

  // State for filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // Determine unique months & brands from sampleListings
  const allMonths = [...new Set(sampleListings.map((l) => l.monthYear))];
  const allBrands = [...new Set(sampleListings.map((l) => l.brand))];

  // Filter logic
  const filteredData = sampleListings.filter((listing) => {
    if (selectedMonth && listing.monthYear !== selectedMonth) return false;
    if (selectedBrand && listing.brand !== selectedBrand) return false;
    return true;
  });

  return (
    <Box p={6} minH="100vh">
      <Heading mb={4}>Seller Listings</Heading>

      {/* Filters */}
      <Flex gap={4} mb={4} alignItems="center">
        {/* Month Filter */}
        <Flex direction="column">
          <Text fontWeight="bold" mb={1}>Month:</Text>
          <Select
            placeholder="All Months"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            width="180px"
            size="sm"
          >
            {allMonths.map((month) => (
              <option key={month} value={month}>
                {month} {/* e.g. "2025-03" */}
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
      <Box border="1px solid" borderColor={borderColor} borderRadius="md" overflowX="auto">
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
            {filteredData.map((listing) => (
              <Tr
                key={listing.id}
                _hover={{ bg: "gray.50", cursor: "pointer" }}
                onClick={() => navigate(`/seller/listings/${listing.id}`)}
              >
                <Td>{listing.monthYear}</Td>
                <Td>{listing.brand}</Td>
                <Td>{listing.shortDescription}</Td>
                <Td isNumeric>${listing.msrpPerUnit.toFixed(2)}</Td>
                <Td isNumeric>${listing.minSellingPricePerUnit.toFixed(2)}</Td>
                <Td isNumeric>{listing.totalVolumeForSale.toLocaleString()}</Td>
                <Td isNumeric>{listing.volumeAboveMSPPercent}%</Td>
                <Td isNumeric>${listing.weightedAverageBidPricePerUnit.toFixed(2)}</Td>
                <Td isNumeric>{listing.recoveryRatePercent}%</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default SellerListingsPage;
