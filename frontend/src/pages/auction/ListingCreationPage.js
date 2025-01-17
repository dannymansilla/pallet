import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { createListing } from "../../services/api";

const ListingCreationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const selectedProduct = location.state?.selectedProduct;

  const [quantity, setQuantity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [shippingInstructions, setShippingInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdListing, setCreatedListing] = useState(null); // To store the created listing

  if (!selectedProduct) {
    toast({
      title: "No product selected.",
      description: "Please go back and select a product.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    navigate("/products/select");
    return null;
  }

  const handleCreateListing = async () => {
    setLoading(true);
    try {
      const response = await createListing({
        product_id: selectedProduct.id,
        quantity_available: quantity,
        minimum_selling_price: minPrice,
        warehouse_location: warehouseLocation,
        shipping_instructions: shippingInstructions,
      });
      setCreatedListing(response.data); // Save the created listing
      toast({
        title: "Listing created successfully.",
        description: "Your listing is now part of the next auction cycle.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error creating listing.",
        description: "Please check your inputs and try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (createdListing) {
    const { product, quantity_available, minimum_selling_price, warehouse_location, auction_cycle } =
      createdListing;
    return (
      <Box py={6} bg="brand.background_color" minH="100vh">
        <Heading mb={6}>Listing Created Successfully</Heading>
        <Box mb={6} py={4} bg="brand.background_color" borderRadius="md">
          <Heading py={4} size="md">{product.name} ({product.brand})</Heading>
          <Text py={2}><strong>Quantity Available:</strong> {quantity_available}</Text>
          <Text py={2}><strong>Minimum Selling Price:</strong> ${minimum_selling_price}</Text>
          <Text py={2}><strong>Warehouse Location:</strong> {warehouse_location}</Text>
          <Text py={2}><strong>Auction Cycle:</strong> {auction_cycle.start_date} to {auction_cycle.end_date} ({auction_cycle.status})</Text>
        </Box>
        <Button
          colorScheme="blue"
          onClick={() => {
            const user = JSON.parse(localStorage.getItem('user')); // Adjust if user info is stored differently
            if (user && user.company && user.company.roles) {
              if (user.company.roles === "buyer") {
                navigate("/buyer-dashboard");
              } else if (user.company.roles === "seller") {
                navigate("/seller-dashboard");
              } else if (user.company.roles === "both") {
                navigate("/unified-dashboard");
              } else {
                toast({
                  title: "Role not recognized.",
                  description: "Please contact support.",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                });
              }
            } else {
              toast({
                title: "User information missing.",
                description: "Please log in again.",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
              navigate("/login");
            }
          }}
          mr={4}
        >
          Go to Dashboard
        </Button>

        <Button
          colorScheme="teal"
          onClick={() => navigate("/products/select")}
        >
          Create Another Listing
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6} bg="white" minH="100vh">
      <Heading mb={6}>Create a Listing</Heading>
      <Box mb={6} p={4} bg="white" borderRadius="md">
        <Text><strong>Product:</strong> {selectedProduct.name}</Text>
        <Text><strong>GTIN:</strong> {selectedProduct.gtin}</Text>
        <Text><strong>Description:</strong> {selectedProduct.description}</Text>
      </Box>

      <FormControl mb={4}>
        <FormLabel>Quantity Available</FormLabel>
        <Input
          type="number"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Minimum Selling Price (per unit)</FormLabel>
        <Input
          type="number"
          placeholder="Enter minimum price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Warehouse Location</FormLabel>
        <Input
          type="text"
          placeholder="Enter warehouse location"
          value={warehouseLocation}
          onChange={(e) => setWarehouseLocation(e.target.value)}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Shipping Instructions (Optional)</FormLabel>
        <Input
          type="text"
          placeholder="Enter any shipping instructions"
          value={shippingInstructions}
          onChange={(e) => setShippingInstructions(e.target.value)}
        />
      </FormControl>

      <Button
        colorScheme="blue"
        onClick={handleCreateListing}
        isLoading={loading}
        isDisabled={!quantity || !minPrice || !warehouseLocation}
      >
        Create Listing
      </Button>
    </Box>
  );
};

export default ListingCreationPage;
