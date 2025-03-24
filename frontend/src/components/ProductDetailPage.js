import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  FormLabel,
  useColorModeValue,
} from "@chakra-ui/react";

// Placeholder image
import cardboardbox from "../images/cardboardbox.png";

/**
 * SAMPLE PRODUCT DATA
 */
const sampleProduct = {
  id: "P-001",
  photoUrl: "/images/placeholder.png",
  brand: "Healthy Foods Inc.",
  name: "Protein Bar - Chocolate",
  description: "High-protein chocolate bar, perfect for active lifestyles.",
  msrpPerPallet: 2500,
  warehouseLocation: "Warehouse A (W1)",
  expirationDate: "2025-11-01",
  sellByDate: "2025-10-15",
  upc: "123456789012",
  batchNumber: "BN-5678",
  dateOfManufacture: "2024-12-01",
  salesUnit: "Case (12 bars)",
  ingredients: ["Whey Protein", "Cocoa", "Sugar", "Natural Flavors"],
  shelfLife: "12 Months",
  stopShipDate: "2025-10-25",
  consumableUnitsPerPallet: 4800,
  palletSpecs: {
    length: "48 in",
    width: "40 in",
    height: "60 in",
    weight: "400 lbs",
    stackable: true,
  },
};

/**
 * SAMPLE RECOMMENDED PRODUCTS
 */
const recommendedProducts = [
  {
    id: "P-002",
    name: "Energy Drink - Citrus",
    brand: "Power Drinks",
    shortDesc: "Refreshing energy drink.",
    photoUrl: "/images/placeholder.png",
  },
  {
    id: "P-003",
    name: "Protein Powder - Vanilla",
    brand: "Muscle Builders",
    shortDesc: "25g protein per scoop.",
    photoUrl: "/images/placeholder.png",
  },
  {
    id: "P-004",
    name: "Granola Bar - Berry",
    brand: "Healthy Snacks Co.",
    shortDesc: "Tasty berry granola bar.",
    photoUrl: "/images/placeholder.png",
  },
];

/**
 * MAIN PAGE COMPONENT
 */
const ProductDetailPage = () => {
  // Local states for bidding
  const [bidPrice, setBidPrice] = useState("");
  const [bidPallets, setBidPallets] = useState("");
  const [existingBid, setExistingBid] = useState(null);

  // Derived calculations
  const msrpString = `$${sampleProduct.msrpPerPallet.toLocaleString()}/pallet`;
  const totalUnitsBid =
    Number(bidPallets) * sampleProduct.consumableUnitsPerPallet || 0;
  const totalDollarBid = Number(bidPrice) * Number(bidPallets) || 0;

  // Chakra theming
  const bgColor = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const formBg = useColorModeValue("gray.50", "gray.700");

  const handleSubmitBid = () => {
    if (!bidPrice || !bidPallets) return;
    setExistingBid({
      bidPrice: Number(bidPrice),
      bidPallets: Number(bidPallets),
      totalUnits: totalUnitsBid,
      totalDollars: totalDollarBid,
    });
  };

  const handleRecommendedClick = (productId) => {
    alert(`Navigating to product detail page: ${productId}`);
    // In a real app, you'd route to `/products/:productId`
  };

  return (
    <Flex minH="100vh" bg={bgColor} direction="column">
      {/* TOP SECTION */}
      <Box px={[4, 6, 8]} py={[4, 6, 8]}>
        {/* Title */}
        <Heading size="lg" mb={2}>
          {sampleProduct.brand} - {sampleProduct.name}
        </Heading>
        <Text mb={6} color="gray.600" fontSize="sm">
          {sampleProduct.description}
        </Text>

        {/* Two-column layout: Product Image (left), Bidding + Key Info (right) */}
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={8}
          mb={10} // space under the top layout
        >
          {/* LEFT: PRODUCT IMAGE */}
          <Box flex="0 0 300px">
            <Image
              src={cardboardbox}
              alt={sampleProduct.name}
              boxSize="100%"
              maxW="300px"
              objectFit="cover"
              borderRadius="md"
              border="1px solid"
              borderColor={borderColor}
              mb={{ base: 4, md: 0 }}
            />
          </Box>

          {/* RIGHT: BIDDING FORM + KEY FIELDS */}
          <Box flex="1">
            {/* Bidding Card */}
            <Box
              bg={formBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              p={4}
              mb={6}
            >
              <Heading size="md" mb={2}>
                Place Your Bid
              </Heading>
              <Text fontSize="sm" mb={3}>
                MSRP per pallet: <strong>{msrpString}</strong>
              </Text>

              <Flex gap={6} flexWrap="wrap">
                {/* Bidding Form */}
                <Box minW="200px">
                  <FormLabel fontSize="sm">Bid Price (per pallet)</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g. 1900"
                    mb={4}
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    size="sm"
                  />
                  <FormLabel fontSize="sm">Number of Pallets</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g. 5"
                    mb={4}
                    value={bidPallets}
                    onChange={(e) => setBidPallets(e.target.value)}
                    size="sm"
                  />

                  {/* Computed totals */}
                  <Box mb={4} fontSize="sm">
                    <Text>
                      <strong>Total Units:</strong>{" "}
                      {totalUnitsBid.toLocaleString()}
                    </Text>
                    <Text>
                      <strong>Total Bid:</strong>{" "}
                      ${totalDollarBid.toLocaleString()}
                    </Text>
                  </Box>

                  <Button colorScheme="blue" size="sm" onClick={handleSubmitBid}>
                    Submit Bid
                  </Button>
                </Box>

                {/* Existing Bid summary */}
                {existingBid && (
                  <Box
                    flex="1"
                    bg="gray.100"
                    p={4}
                    borderRadius="md"
                    minW="200px"
                  >
                    <Heading size="sm" mb={2}>
                      Your Current Bid
                    </Heading>
                    <Text fontSize="sm">
                      <strong>Price/Pallet:</strong> $
                      {existingBid.bidPrice.toLocaleString()}
                    </Text>
                    <Text fontSize="sm">
                      <strong># of Pallets:</strong>{" "}
                      {existingBid.bidPallets.toLocaleString()}
                    </Text>
                    <Text fontSize="sm">
                      <strong>Total Units:</strong>{" "}
                      {existingBid.totalUnits.toLocaleString()}
                    </Text>
                    <Text fontSize="sm">
                      <strong>Total Bid:</strong> $
                      {existingBid.totalDollars.toLocaleString()}
                    </Text>
                    <Text mt={2} fontSize="xs" color="gray.500">
                      Update your bid at any time.
                    </Text>
                  </Box>
                )}
              </Flex>
            </Box>

            {/* Key Fields (a few highlights) */}
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              p={4}
            >
              <Heading size="sm" mb={3}>
                Quick Info
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} fontSize="sm">
                <Text>
                  <strong>Warehouse:</strong> {sampleProduct.warehouseLocation}
                </Text>
                <Text>
                  <strong>Expiration Date:</strong> {sampleProduct.expirationDate}
                </Text>
                <Text>
                  <strong>Sell By Date:</strong> {sampleProduct.sellByDate}
                </Text>
                <Text>
                  <strong>UPC:</strong> {sampleProduct.upc}
                </Text>
              </SimpleGrid>
            </Box>
          </Box>
        </Flex>

        {/* ADDITIONAL DETAILS SECTION */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={4}
          mb={8}
        >
          <Heading size="md" mb={4}>
            Additional Information
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} fontSize="sm">
            {/* Left Column */}
            <Box>
              <Text>
                <strong>Batch #:</strong> {sampleProduct.batchNumber}
              </Text>
              <Text>
                <strong>Date of Manufacture:</strong>{" "}
                {sampleProduct.dateOfManufacture}
              </Text>
              <Text>
                <strong>Sales Unit:</strong> {sampleProduct.salesUnit}
              </Text>
              {sampleProduct.ingredients && sampleProduct.ingredients.length > 0 && (
                <Text>
                  <strong>Ingredients:</strong>{" "}
                  {sampleProduct.ingredients.join(", ")}
                </Text>
              )}
              <Text>
                <strong>Shelf Life:</strong> {sampleProduct.shelfLife}
              </Text>
              <Text>
                <strong>Stop Ship Date:</strong> {sampleProduct.stopShipDate}
              </Text>
            </Box>

            {/* Right Column */}
            <Box>
              <Text>
                <strong>Consumable Units/Pallet:</strong>{" "}
                {sampleProduct.consumableUnitsPerPallet.toLocaleString()}
              </Text>
              <Box mt={2}>
                <Text fontWeight="bold">Pallet Specs:</Text>
                <Text pl={4}>
                  LxWxH: {sampleProduct.palletSpecs.length} x{" "}
                  {sampleProduct.palletSpecs.width} x{" "}
                  {sampleProduct.palletSpecs.height}
                </Text>
                <Text pl={4}>Weight: {sampleProduct.palletSpecs.weight}</Text>
                <Text pl={4}>
                  Stackable:{" "}
                  {sampleProduct.palletSpecs.stackable ? "Yes" : "No"}
                </Text>
              </Box>
            </Box>
          </SimpleGrid>
        </Box>

        {/* RECOMMENDED PRODUCTS TABLE */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={4}
        >
          <Heading size="md" mb={4}>
            Other Recommended Products
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>Photo</Th>
                  <Th>Product</Th>
                  <Th>Brand</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recommendedProducts.map((rp) => (
                  <Tr
                    key={rp.id}
                    _hover={{ bg: "gray.50", cursor: "pointer" }}
                    onClick={() => handleRecommendedClick(rp.id)}
                  >
                    <Td>
                      <Image
                        src={cardboardbox}
                        alt={rp.name}
                        boxSize="40px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    </Td>
                    <Td>{rp.name}</Td>
                    <Td>{rp.brand}</Td>
                    <Td>{rp.shortDesc}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default ProductDetailPage;
