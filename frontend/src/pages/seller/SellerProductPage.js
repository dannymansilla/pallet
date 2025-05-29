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
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import cardboardbox from "../../images/cardboardbox.png";
import { useDataMode } from "../../context/DataModeContext";
import { getListingDetails, getListingBids } from "../../services/api";

// Sample data for demo mode
const sampleListings = [
  {
    id: 1,
    month_year: "2025-05",
    brand: "Henkelish",
    short_description: "MaxClean Laundry Detergent",
    msrp_per_unit: "11.99",
    min_selling_price_per_unit: "8.39",
    total_volume_for_sale: 10,
  },
  {
    id: 2,
    month_year: "2025-05",
    brand: "Henkelish",
    short_description: "ProNourish Shampoo",
    msrp_per_unit: "6.49",
    min_selling_price_per_unit: "4.54",
    total_volume_for_sale: 10,
  },
  {
    id: 3,
    month_year: "2025-05",
    brand: "Henkelish",
    short_description: "AquaShield Body Wash",
    msrp_per_unit: "7.99",
    min_selling_price_per_unit: "5.59",
    total_volume_for_sale: 10,
  },
  {
    id: 4,
    month_year: "2025-05",
    brand: "Henkelish",
    short_description: "FreshGuard Hand Soap",
    msrp_per_unit: "4.99",
    min_selling_price_per_unit: "3.49",
    total_volume_for_sale: 10,
  },
  {
    id: 5,
    month_year: "2025-05",
    brand: "Henkelish",
    short_description: "SparkClean Dish Soap",
    msrp_per_unit: "3.99",
    min_selling_price_per_unit: "2.79",
    total_volume_for_sale: 10,
  },
];


const sampleBids = [
  {
    bidId: "B100",
    listingId: 1,
    buyerCompany: "Acme Retailer",
    bidPricePerUnit: 9.5,
    bidVolume: 4000,
    status: "active",
    pallets: 20
  },
  {
    bidId: "B101",
    listingId: 1,
    buyerCompany: "Mega Corp",
    bidPricePerUnit: 9.2,
    bidVolume: 2000,
    status: "active",
    pallets: 10
  },
  {
    bidId: "B102",
    listingId: 1,
    buyerCompany: "Global Foods",
    bidPricePerUnit: 9.8,
    bidVolume: 3000,
    status: "active",
    pallets: 15
  }
];

const getImageUrl = (image) => {
  if (process.env.NODE_ENV === 'production') {
    return '/static/media/cardboardbox.3a11b4e24ee4ded8288a.png';
  }
  return image;
};

const SellerProductPage = () => {
  const { listingId } = useParams();
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { useSampleData } = useDataMode();

  // Local state for the listing info
  const [listing, setListing] = useState(null);
  const [bids, setBids] = useState([]);
  const [minSellingPrice, setMinSellingPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch listing data and bids
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (useSampleData) {
          // Use sample data
          const foundListing = sampleListings.find((l) => l.id === parseInt(listingId));
          if (!foundListing) {
            throw new Error("Listing not found");
          }
          setListing(foundListing);
          setMinSellingPrice(foundListing.min_selling_price_per_unit);

          // Get relevant bids
          const relevantBids = sampleBids
            .filter((b) => b.listingId === parseInt(listingId))
            .sort((a, b) => b.bidPricePerUnit - a.bidPricePerUnit);
          setBids(relevantBids);
        } else {
          // Fetch listing details
          const listingResponse = await getListingDetails(listingId);
          const listingData = listingResponse.data;
          setListing(listingData);
          setMinSellingPrice(listingData.min_selling_price_per_unit);

          // Fetch bids for this listing
          const bidsResponse = await getListingBids(listingId);
          console.log('Bids response:', bidsResponse); // Debug log
          const bidsData = bidsResponse.data;
          console.log('Bids data:', bidsData); // Debug log
          setBids(bidsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [listingId, useSampleData]);

  if (loading) {
    return (
      <Box p={6}>
        <Spinner />
        <Text>Loading Listing...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      </Box>
    );
  }

  if (!listing) {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          <Text>Listing not found</Text>
        </Alert>
      </Box>
    );
  }

  const handleSaveMinPrice = async () => {
    try {
      if (!useSampleData) {
        // Make API call to update min price
        const response = await fetch(`/api/auctions/listings/${listingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            min_selling_price_per_unit: parseFloat(minSellingPrice)
          })
        });

        if (!response.ok) {
          throw new Error("Failed to update minimum price");
        }
      }

      // Update local state
      setListing((prev) => ({
        ...prev,
        min_selling_price_per_unit: minSellingPrice,
      }));
    } catch (err) {
      console.error("Error updating minimum price:", err);
      setError(err.message);
    }
  };

  // "in the money" logic with safety checks
  const displayBids = bids
    .filter(bid => {
      // Handle both sample and real data structures
      const bidListingId = bid.listingId || bid.listing;
      const bidStatus = bid.status || 'active';
      return bidStatus === 'active' && bidListingId === parseInt(listingId);
    })
    .map((bid) => {
      // Add safety checks for bid data
      const bidPrice = parseFloat(bid?.bid_price || bid?.bidPricePerUnit || 0);
      const bidQuantity = parseInt(bid?.bid_quantity || bid?.bidVolume || 0, 10);
      const minPrice = parseFloat(listing?.min_selling_price_per_unit || 0);
      
      const inTheMoney = bidPrice >= minPrice;
      const totalBidValue = bidPrice * bidQuantity;
      
      return {
        ...bid,
        inTheMoney,
        totalBidValue,
        bidPrice,
        bidQuantity
      };
    });

  return (
    <Box p={6} minH="85vh">
      <Heading mb={4}>Product Details</Heading>

      {/* Basic product info */}
      <Box
        border="1px solid"
        borderColor={borderColor}
        p={4}
        borderRadius="md"
        mb={4}
      >
        <Flex align="center" gap={6}>
          <Image
            src={getImageUrl(cardboardbox)}
            alt={listing.short_description}
            boxSize="100px"
            objectFit="cover"
            borderRadius="md"
          />

          <Box>
            <Text>
              <strong>Month + Year:</strong> {listing.month_year}
            </Text>
            <Text>
              <strong>Brand:</strong> {listing.brand}
            </Text>
            <Text>
              <strong>Description:</strong> {listing.short_description}
            </Text>
            <Text>
              <strong>MSRP / Unit:</strong> ${parseFloat(listing.msrp_per_unit).toFixed(2)}
            </Text>
            <Text>
              <strong>Total Volume For Sale:</strong>{" "}
              {listing.total_volume_for_sale.toLocaleString()}
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Min selling price controls */}
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

      {/* Bids table */}
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
              <Th isNumeric>Bid Price</Th>
              <Th isNumeric>Units</Th>
              <Th isNumeric>Pallets</Th>
              <Th isNumeric>Total Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {displayBids.map((bid) => (
              <Tr key={bid.id || bid.bidId}>
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
                <Td>{bid.buyer_company || bid.buyerCompany || 'Unknown'}</Td>
                <Td isNumeric>${bid.bidPrice.toFixed(2)}</Td>
                <Td isNumeric>{bid.bidQuantity.toLocaleString()}</Td>
                <Td isNumeric>{bid.pallets.toLocaleString()}</Td>
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
