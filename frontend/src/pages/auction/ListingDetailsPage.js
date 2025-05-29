import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Spinner,
  Button,
  Image,
  List,
  ListItem,
  Flex,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  NumberInput,
  NumberInputField,
  useDisclosure,
  FormControl, 
  FormLabel, 
  FormHelperText, 
  InputLeftElement,
  InputGroup,
  Icon 
} from "@chakra-ui/react";
import { getListingDetails } from "../../services/api";
import { placeBid, requestToJoinNetwork } from "../../services/api";
import { FaDollarSign, FaBoxOpen } from "react-icons/fa";

const getImageUrl = (image) => {
  if (process.env.NODE_ENV === 'production') {
    return '/static/media/cardboardbox.3a11b4e24ee4ded8288a.png';
  }
  return image;
};

const ListingDetailsPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidQuantity, setBidQuantity] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const response = await getListingDetails(id);
        setListing(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load listing details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handlePlaceBid = async () => {
    if (bidQuantity > listing.quantity_available) {
      alert("Quantity exceeds available stock.");
      return;
    }
  
    if (!bidAmount || bidAmount < listing.minimum_selling_price) {
      alert("Bid amount must meet or exceed the minimum selling price.");
      return;
    }
  
    try {
      const bidData = {
        listing_id: listing.id,
        price_per_unit: parseFloat(bidAmount),
        quantity: parseInt(bidQuantity, 10),
      };
  
      // Call the API to place the bid
      await placeBid(bidData);
  
      alert("Your bid was placed successfully!");
      onClose(); // Close the modal
    } catch (err) {
      console.error("Error placing bid:", err);
      alert("Failed to place the bid. Please try again.");
    }
  };

  if (loading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">{error}</Text>;

  const {
    product,
    quantity_available,
    warehouse_location,
    shipping_instructions,
    auction_cycle,
  } = listing;

  return (
    <Box minH="100vh" w="100%" maxW="1400px" mx="auto" p={4}>
  <Flex direction={["column", "row"]} gap={6} align="flex-start">
    {/* Product Details (Left) */}
    <Box flex="1">
      <Text fontSize="2xl" fontWeight="bold">{product.name}</Text>
      <Text>{product.description}</Text>
      <Text fontSize="sm" color="gray.500">
        Brand: {product.brand}
      </Text>
      {product.certifications && (
        <Flex mt={2}>
          {product.certifications.non_gmo && (
            <Badge colorScheme="green" mr={2}>Non-GMO</Badge>
          )}
          {product.certifications.organic && (
            <Badge colorScheme="teal" mr={2}>Organic</Badge>
          )}
          {product.certifications.fair_trade && (
            <Badge colorScheme="blue">Fair Trade</Badge>
          )}
        </Flex>
      )}

      {/* Auction Details */}
      <Box mt={6}>
        <Text fontWeight="bold">Auction Details</Text>
        <List spacing={2} mt={2}>
          <ListItem>
            <Text>Auction Status: {auction_cycle.status}</Text>
          </ListItem>
          <ListItem>
            <Text>
              Ends on: {new Date(auction_cycle.end_date).toLocaleDateString()}
            </Text>
          </ListItem>
          <ListItem>
            <Text>Quantity Available: {quantity_available}</Text>
          </ListItem>
        </List>
      </Box>

      {/* Logistics */}
      <Box mt={6}>
        <Text fontWeight="bold">Logistics</Text>
        <List spacing={2} mt={2}>
          <ListItem>Warehouse: {warehouse_location}</ListItem>
          <ListItem>Shipping: {shipping_instructions}</ListItem>
        </List>
      </Box>

      {/* Specifications */}
      <Box mt={6}>
        <Text fontWeight="bold">Specifications</Text>
        <List spacing={2} mt={2}>
          <ListItem>GTIN: {product.gtin}</ListItem>
          <ListItem>
            Dimensions: {product.length}" x {product.width}" x {product.height}"
          </ListItem>
          <ListItem>Weight: {product.weight} lbs</ListItem>
          <ListItem>Expiration Date: {product.expiration_date}</ListItem>
          <ListItem>
            Units per Case: {product.units_per_case}, Cases per Pallet:{" "}
            {product.cases_per_pallet}
          </ListItem>
        </List>
      </Box>
    </Box>

    {/* Image (Right) */}
    <Box
      flex="1"
      bg="gray.200"
      rounded="lg"
      shadow="md"
      overflow="hidden"
      width="100%" // Ensures full width responsiveness
      maxW="500px" // Limits max width for large screens
      minH="auto" // Ensures dynamic height
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {product.image ? (
        <Image
          src={getImageUrl(product.image)}
          alt={product.name}
          objectFit="contain"
          width="100%" // Adjusts dynamically
          height="auto" // Keeps correct aspect ratio
          display="block"
          mx="auto"
          aspectRatio="1/1" // Ensures it scales proportionally
        />
      ) : (
        <Text color="gray.500" fontSize="lg" textAlign="center" py={10}>
          No Image Available
        </Text>
      )}
    </Box>


  </Flex>

  {/* Place Bid and Back Buttons */}
  <Flex px={6} mt={8} gap={4}>
    {listing.is_in_network ? (
      <Button colorScheme="blue" onClick={onOpen} px={6}>
        Place Bid
      </Button>
    ) : (
      <Button colorScheme="green" onClick={() => requestToJoinNetwork(product.company)} px={6}>
        Request to Join Seller's Network
      </Button>
    )}
    <Button px={6} colorScheme="teal" onClick={() => navigate("/auction")}>
      Back to Listings
    </Button>
  </Flex>

  {/* Modal for Bidding */}
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Place Your Bid</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {/* Bid Amount Input */}
        <FormControl mb={4}>
          <FormLabel fontWeight="medium">Bid Amount ($)</FormLabel>
          <InputGroup w="100%">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaDollarSign} color="gray.500" />
            </InputLeftElement>
            <NumberInput
              min={listing.minimum_selling_price}
              value={bidAmount}
              onChange={(valueString) => setBidAmount(valueString)}
              clampValueOnBlur={false}
              w="100%"
            >
              <NumberInputField pl="10" placeholder="Enter bid amount" />
            </NumberInput>
          </InputGroup>
        </FormControl>

        {/* Bid Quantity Input */}
        <FormControl>
          <FormLabel fontWeight="medium">Bid Quantity</FormLabel>
          <InputGroup w="100%">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaBoxOpen} color="gray.500" />
            </InputLeftElement>
            <NumberInput
              min={1}
              max={quantity_available}
              value={bidQuantity}
              onChange={(valueString) => setBidQuantity(Number(valueString))}
              clampValueOnBlur={false}
              w="100%"
            >
              <NumberInputField pl="10" placeholder="Enter quantity" />
            </NumberInput>
          </InputGroup>
          <FormHelperText>Available: {quantity_available} units</FormHelperText>
        </FormControl>
      </ModalBody>

      <ModalFooter>
        <Button colorScheme="blue" onClick={handlePlaceBid}>
          Submit Bid
        </Button>
        <Button variant="ghost" onClick={onClose} ml={3}>
          Cancel
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>

</Box>

  );
};

export default ListingDetailsPage;
