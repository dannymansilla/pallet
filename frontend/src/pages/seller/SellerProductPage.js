import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Input,
  Spinner,
  Image,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import cardboardbox from "../../images/cardboardbox.png"; // Import your default image

// For the demo, pretend we fetch from these sample arrays.
const sampleListings = [
  {
    id: "L01",
    monthYear: "2025-03",
    brand: "Henkel",
    shortDescription: "Persil Detergent",
    msrpPerUnit: 3.5,
    minSellingPricePerUnit: 2.0,
    totalVolumeForSale: 10000,
  },
  // ...
];

// SAMPLE BIDS for a particular listing ID
// In real life, you'd fetch from an API.
const sampleBids = [
  {
    bidId: "B100",
    listingId: "L01",
    buyerCompany: "Acme Retailer",
    buyerPerson: "John Doe",
    bidPricePerUnit: 2.5,
    bidVolume: 4000,
  },
  {
    bidId: "B101",
    listingId: "L01",
    buyerCompany: "Global Market",
    buyerPerson: "Jane Smith",
    bidPricePerUnit: 1.9,
    bidVolume: 2000,
  },
  {
    bidId: "B105",
    listingId: "L02",
    buyerCompany: "Alpha Foods",
    buyerPerson: "Chris Martin",
    bidPricePerUnit: 2.6,
    bidVolume: 3000,
  },
  // etc...
];

const SellerProductPage = () => {
  const { listingId } = useParams();
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Local state for the listing info
  const [listing, setListing] = useState(null);
  const [bids, setBids] = useState([]);
  const [minSellingPrice, setMinSellingPrice] = useState("");

  // Simulate data fetch
  useEffect(() => {
    // In a real app, you'd fetch listing detail by ID.
    const foundListing = sampleListings.find((l) => l.id === listingId);
    setListing(foundListing);
    setMinSellingPrice(foundListing?.minSellingPricePerUnit ?? "");

    // Fetch relevant bids & sort from highest to lowest price
    const relevantBids = sampleBids
      .filter((b) => b.listingId === listingId)
      .sort((a, b) => b.bidPricePerUnit - a.bidPricePerUnit);

    setBids(relevantBids);
  }, [listingId]);

  if (!listing) {
    return (
      <Box p={6}>
        <Spinner />
        <Text>Loading Listing...</Text>
      </Box>
    );
  }

  const {
    monthYear,
    brand,
    shortDescription,
    msrpPerUnit,
    totalVolumeForSale,
  } = listing;

  // If you have real updating logic:
  const handleSaveMinPrice = () => {
    // In reality, you'd send a PATCH/PUT to the server
    // For demo, just update local state
    setListing((prev) => ({
      ...prev,
      minSellingPricePerUnit: parseFloat(minSellingPrice),
    }));
  };

  // "in the money" logic on the fly:
  // ITM means bidPricePerUnit >= listing.minSellingPricePerUnit
  const displayBids = bids.map((bid) => {
    const inTheMoney = bid.bidPricePerUnit >= (listing.minSellingPricePerUnit ?? 0);
    const totalBidValue = bid.bidPricePerUnit * bid.bidVolume;
    return {
      ...bid,
      inTheMoney,
      totalBidValue,
    };
  });

  return (
    <Box p={6} minH="85vh">
      <Heading mb={4}>Product Details</Heading>

      {/* Basic product info (with default product image) */}
      <Box
        border="1px solid"
        borderColor={borderColor}
        p={4}
        borderRadius="md"
        mb={4}
      >
        <Flex align="center" gap={6}>
          {/* Product Image */}
          <Image
            src={cardboardbox}
            alt={shortDescription}
            boxSize="100px"
            objectFit="cover"
            borderRadius="md"
          />

          {/* Product Info Text */}
          <Box>
            <Text>
              <strong>Month + Year:</strong> {monthYear}
            </Text>
            <Text>
              <strong>Brand:</strong> {brand}
            </Text>
            <Text>
              <strong>Description:</strong> {shortDescription}
            </Text>
            <Text>
              <strong>MSRP / Unit:</strong> ${msrpPerUnit.toFixed(2)}
            </Text>
            <Text>
              <strong>Total Volume For Sale:</strong>{" "}
              {totalVolumeForSale.toLocaleString()}
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Seller-specific controls: min selling price */}
      <Box
        border="1px solid"
        borderColor={borderColor}
        p={4}
        borderRadius="md"
        mb={4}
      >
        <Text fontWeight="bold" mb={2}>
          Minimum Selling Price
        </Text>
        <Flex gap={2} alignItems="center">
          <Input
            width="120px"
            type="number"
            step="0.01"
            value={minSellingPrice}
            onChange={(e) => setMinSellingPrice(e.target.value)}
          />
          <Button colorScheme="blue" onClick={handleSaveMinPrice}>
            Save
          </Button>
        </Flex>
      </Box>

      {/* Table of open bids */}
      <Heading size="md" mb={2}>
        Open Bids
      </Heading>
      <Box
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
        overflowX="auto"
      >
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th>ITM</Th>
              <Th>Buyer Company</Th>
              <Th>Buyer Person</Th>
              <Th isNumeric>Bid Price</Th>
              <Th isNumeric>Bid Volume</Th>
              <Th isNumeric>Total Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {displayBids.map((bid) => (
              <Tr key={bid.bidId}>
                <Td>
                  {bid.inTheMoney ? (
                    <Text color="green.600" fontWeight="bold">
                      Yes
                    </Text>
                  ) : (
                    <Text color="red.600" fontWeight="bold">
                      No
                    </Text>
                  )}
                </Td>
                <Td>{bid.buyerCompany}</Td>
                <Td>{bid.buyerPerson}</Td>
                <Td isNumeric>${bid.bidPricePerUnit.toFixed(2)}</Td>
                <Td isNumeric>{bid.bidVolume.toLocaleString()}</Td>
                <Td isNumeric>${bid.totalBidValue.toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default SellerProductPage;
