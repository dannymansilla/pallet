import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Button,
  Input,
  FormLabel,
  useColorModeValue,
  useToast,
  VStack,
  HStack,
  FormControl,
  Badge,
  Grid,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
} from "@chakra-ui/react";
import { useDataMode } from "../context/DataModeContext";
import cardboardbox from "../images/cardboardbox.png";
import { getListingDetails, getProductDetails, getWarehouseDetails, placeBid } from "../services/api";

const sampleProduct = [
  {
    id: "P-001",
    sku: "DHL-001",
    name: "Protein Bar - Chocolate",
    brand: "PowerProtein",
    description: "High-protein chocolate bar made with organic whey and no added sugar.",
    length: "9.60",
    width: "8.00",
    height: "12.00",
    weight: "80.00",
    units_per_case: 12,
    cases_per_pallet: 400,
    created_at: "2025-05-16T00:00:00Z",
    updated_at: "2025-05-16T00:00:00Z",
    msrp: "6.25"
  },
  {
    id: "P-002",
    sku: "DHL-002",
    name: "Vegan Trail Mix",
    brand: "Daily Health Snacks",
    description: "Gluten-free mix of nuts, seeds, and dried fruit. Perfect for snacking.",
    length: "9.60",
    width: "8.00",
    height: "11.60",
    weight: "84.00",
    units_per_case: 24,
    cases_per_pallet: 150,
    created_at: "2025-05-16T00:00:00Z",
    updated_at: "2025-05-16T00:00:00Z",
    msrp: "21.33"
  },
  {
    id: "P-003",
    sku: "DHL-003",
    name: "Coconut Water Electrolyte Drink",
    brand: "HydraLife",
    description: "Hydrating beverage with natural electrolytes and no added sugar.",
    length: "9.60",
    width: "8.00",
    height: "11.00",
    weight: "76.00",
    units_per_case: 6,
    cases_per_pallet: 700,
    created_at: "2025-05-16T00:00:00Z",
    updated_at: "2025-05-16T00:00:00Z",
    msrp: "3.00"
  },
  {
    id: "P-004",
    sku: "DHL-004",
    name: "Organic Granola Clusters",
    brand: "Daily Health Pantry",
    description: "Whole grain oats with honey and chia seeds in snackable clusters.",
    length: "9.60",
    width: "8.00",
    height: "12.00",
    weight: "82.00",
    units_per_case: 10,
    cases_per_pallet: 390,
    created_at: "2025-05-16T00:00:00Z",
    updated_at: "2025-05-16T00:00:00Z",
    msrp: "7.05"
  },
  {
    id: "P-005",
    sku: "DHL-005",
    name: "Herbal Disinfectant Wipes",
    brand: "EcoClean Home",
    description: "Plant-based surface wipes with essential oils. Alcohol-free.",
    length: "9.60",
    width: "8.00",
    height: "12.00",
    weight: "86.00",
    units_per_case: 20,
    cases_per_pallet: 155,
    created_at: "2025-05-16T00:00:00Z",
    updated_at: "2025-05-16T00:00:00Z",
    msrp: "21.94"
  }
];



const sampleListing = [
  {
    id: "L-001",
    product: "P-001",
    quantity_available: 1000,
    reserve_price: 15.99,
    end_date: "2025-05-25",
    seller_name: "Daily Health",
    seller_id: 1,
    network_status: "active",
    warehouse: "W-001",
    warehouse_name: "Main Warehouse",
    warehouse_address: "123 Storage Lane, Chicago, IL 60601",
  },
  {
    id: "L-002",
    product: "P-002",
    quantity_available: 800,
    reserve_price: 18.49,
    end_date: "2025-05-28",
    seller_name: "Daily Health",
    seller_id: 1,
    network_status: "active",
    warehouse: "W-001",
    warehouse_name: "Main Warehouse",
    warehouse_address: "123 Storage Lane, Chicago, IL 60601",
  },
  {
    id: "L-003",
    product: "P-003",
    quantity_available: 1200,
    reserve_price: 13.20,
    end_date: "2025-05-30",
    seller_name: "Daily Health",
    seller_id: 1,
    network_status: "active",
    warehouse: "W-001",
    warehouse_name: "Main Warehouse",
    warehouse_address: "123 Storage Lane, Chicago, IL 60601",
  },
  {
    id: "L-004",
    product: "P-004",
    quantity_available: 900,
    reserve_price: 17.00,
    end_date: "2025-05-27",
    seller_name: "Daily Health",
    seller_id: 1,
    network_status: "active",
    warehouse: "W-001",
    warehouse_name: "Main Warehouse",
    warehouse_address: "123 Storage Lane, Chicago, IL 60601",
  },
  {
    id: "L-005",
    product: "P-005",
    quantity_available: 1500,
    reserve_price: 21.00,
    end_date: "2025-05-29",
    seller_name: "Daily Health",
    seller_id: 1,
    network_status: "active",
    warehouse: "W-001",
    warehouse_name: "Main Warehouse",
    warehouse_address: "123 Storage Lane, Chicago, IL 60601",
  },
];


const sampleWarehouse = {
  id: "W-001",
  name: "Main Warehouse",
  address: "123 Storage Lane, Chicago, IL 60601",
  status: "active",
  capacity: 100000
};

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

const getImageUrl = (image) => {
  if (process.env.NODE_ENV === 'production') {
    return '/images/cardboardbox.png';
  }
  return image;
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { useSampleData } = useDataMode();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listing, setListing] = useState(null);
  const [product, setProduct] = useState(null);
  const [warehouse, setWarehouse] = useState(null);

  // Now storing numeric value for pallets
  const [bidPallets, setBidPallets] = useState(1);
  const [bidPrice, setBidPrice] = useState("");

  // Derived calculations
  const totalUnits =
    (product?.units_per_case ?? 0) *
    (product?.cases_per_pallet ?? 0) *
    bidPallets;
  const totalBid = totalUnits * parseFloat(bidPrice || 0);

  // Color modes
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const formBg = useColorModeValue("white", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (useSampleData) {
          // Find the matching listing and product from sample data
          const foundListing = sampleListing.find(l => l.id === id);
          if (!foundListing) {
            throw new Error("Listing not found");
          }
          setListing(foundListing);

          // Find the matching product
          const foundProduct = sampleProduct.find(p => p.id === foundListing.product);
          if (!foundProduct) {
            throw new Error("Product not found");
          }
          setProduct(foundProduct);
          setWarehouse(sampleWarehouse);
        } else {
          const listingResponse = await getListingDetails(id);
          if (listingResponse.data) {
            setListing(listingResponse.data);

            // Warehouse
            const warehouseResponse = await getWarehouseDetails(
              listingResponse.data.warehouse
            );
            if (warehouseResponse.data) {
              setWarehouse(warehouseResponse.data);
            }

            // Product
            const productResponse = await getProductDetails(
              listingResponse.data.product
            );
            if (productResponse.data) {
              setProduct(productResponse.data);
            } else {
              throw new Error("Product data not found");
            }
          } else {
            throw new Error("Listing data not found");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        if (useSampleData) {
          // fallback to sample data
          setListing(sampleListing);
          setProduct(sampleProduct);
          setWarehouse(sampleWarehouse);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, useSampleData]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      const bidData = {
        listingId: listing.id,
        saleEventId: listing.sale_event,
        bidPrice: bidPrice,
        bidQuantity: bidPallets * product.units_per_case * product.cases_per_pallet
      };

      await placeBid(bidData);

      toast({
        title: "Bid Submitted",
        description: "Your bid has been submitted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setBidPallets(1);
      setBidPrice("");
    } catch (error) {
      console.error("Error submitting bid:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit bid. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRecommendedClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <Center p={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center p={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Center>
    );
  }

  if (!listing || !product || !warehouse) {
    return (
      <Center p={8}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>Unable to load product details.</AlertDescription>
        </Alert>
      </Center>
    );
  }

  // Calculate max number of pallets they can buy if
  // quantity_available is "units" in your DB (this example depends
  // on how you track "quantity_available").
  const maxPallets = Math.floor(
    listing.quantity_available / (product.units_per_case * product.cases_per_pallet)
  );

  return (
    <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 8 }}>
      <Grid
        templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
        gap={8}
        maxW="1200px"
        mx="auto"
      >
        {/* LEFT COLUMN: Product Card + Recommended Products */}
        <VStack align="stretch" spacing={6}>
          {/* Product Card */}
          <Box
            bg={cardBg}
            borderRadius="md"
            boxShadow="md"
            p={6}
            border="1px solid"
            borderColor={borderColor}
          >
            <Flex direction={{ base: "column", md: "row" }} mb={4} align="center">
              <Image
                src={getImageUrl(cardboardbox)}
                alt={product.name}
                borderRadius="md"
                w={{ base: "100%", md: "250px" }}
                h="auto"
                objectFit="cover"
                mr={{ md: 6 }}
                mb={{ base: 4, md: 0 }}
              />
              <Box>
                <Heading size="lg" mb={1}>{product.name}</Heading>
                <Text fontSize="md" color="gray.400">{product.brand}</Text>
                <Badge
                  colorScheme={listing.listing_status === "active" ? "green" : "gray"}
                  mt={2}
                >
                  {listing.status_display}
                </Badge>
              </Box>
            </Flex>

            <Divider mb={4} />

            {/* Description */}
            <Box mb={4}>
              <Heading size="md" mb={2}>Description</Heading>
              <Text>{product.description}</Text>
            </Box>

            {/* Specs */}
            <Box mb={4}>
              <Heading size="md" mb={2}>Specifications</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontWeight="bold">SKU</Text>
                  <Text>{product.sku}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Dimensions</Text>
                  <Text>
                    {product.length}" × {product.width}" × {product.height}"
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Weight</Text>
                  <Text>{product.weight} lbs</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Units per Case</Text>
                  <Text>{product.units_per_case}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Cases per Pallet</Text>
                  <Text>{product.cases_per_pallet}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Units per Pallet</Text>
                  <Text>
                    {product.units_per_case * product.cases_per_pallet}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Box>
              <Heading size="md" mb={2}>Warehouse</Heading>
              <VStack align="stretch" spacing={1}>
                <HStack>
                  <Text fontWeight="bold">Name:</Text>
                  <Text>{warehouse.name}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Location:</Text>
                  <Text>{warehouse.address}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold">Capacity:</Text>
                  <Text>{warehouse?.capacity?.toLocaleString() ?? 'N/A'} units</Text>
                </HStack>
              </VStack>
            </Box>
          </Box>

          {/* Recommended Products */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="md"
            boxShadow="md"
            border="1px solid"
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>Recommended Products</Heading>
            <SimpleGrid columns={2} spacing={4}>
              {recommendedProducts.slice(0, 2).map((item) => (
                <Box
                  key={item.id}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => handleRecommendedClick(item.id)}
                  _hover={{ boxShadow: "lg", bg: hoverBg }}
                >
                  <Text fontWeight="bold">{item.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {item.brand}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>

        {/* RIGHT COLUMN: Bidding Form + Auction Details */}
        <VStack align="stretch" spacing={6}>
          {/* Bidding Form */}
          <Box
            bg={formBg}
            p={6}
            borderRadius="md"
            boxShadow="md"
            border="1px solid"
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>Place Your Bid</Heading>
            <form onSubmit={handleBidSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Number of Pallets</FormLabel>
                  <NumberInput
                    value={bidPallets}
                    min={1}
                    max={maxPallets}
                    clampValueOnBlur={false}
                    keepWithinRange={false}
                    onChange={(valStr, valNum) => {
                      // If the user clears out the field or types invalid text, handle gracefully
                      if (isNaN(valNum)) {
                        setBidPallets(0);
                      } else {
                        setBidPallets(valNum);
                      }
                    }}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Total Units: {totalUnits.toLocaleString()}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel>Bid Price per Unit ($)</FormLabel>
                  <Input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder="Enter your bid"
                    min={parseFloat(listing.reserve_price)}
                    step="0.01"
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Total Bid: ${totalBid.toLocaleString()}
                  </Text>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isDisabled={
                    bidPallets < 1 ||
                    !bidPrice ||
                    parseFloat(bidPrice) < parseFloat(listing.reserve_price)
                  }
                >
                  Place Bid
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Auction Details */}
          <Box
            bg={cardBg}
            borderRadius="md"
            boxShadow="md"
            p={6}
            border="1px solid"
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>Auction Details</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Text fontWeight="bold">Available Quantity</Text>
                <Text>{listing.quantity_available.toLocaleString()} units</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">MSRP (per unit)</Text>
                <Text>${parseFloat(product.msrp).toLocaleString()}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Units per Pallet</Text>
                <Text>
                  {product.units_per_case * product.cases_per_pallet} units
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold">MSRP per Pallet</Text>
                <Text>
                  $
                  {(
                    parseFloat(product.msrp) *
                    product.units_per_case *
                    product.cases_per_pallet
                  ).toLocaleString()}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
};

export default ProductDetailPage;
