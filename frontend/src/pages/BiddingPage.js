// src/pages/BiddingPage.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import cpg_photo from '../images/liquid_detergent.jpeg';
import {
  Box,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  FormControl,
  FormLabel,
  // Input,
  NumberInput,
  NumberInputField,
  Button,
  useToast,
  GridItem,
} from '@chakra-ui/react';

const BiddingPage = () => {
  // Use useLocation to access item data passed through the link
  // const location = useLocation();
  // const item = location.state?.item;
  const item = {
    "id": "1",
    "name": "Premium Liquid Laundry Detergent",
    "sellerCompany": "CleanCo Industries",
    "description": "A high-efficiency liquid laundry detergent designed for use in both traditional and HE washing machines. Removes tough stains and keeps clothes fresh.",
    "image": {cpg_photo},  // Replace with an actual image URL
    "sku": "CLN-12345",
    "closeDate": "2024-10-15T18:00:00Z",
    "expiration": "2025-06-30",
    "units": 5000,
    "pricePerUnit": 1.25,  // Price can be used as a starting bid price if needed
    "category": "Household",
    "status": "Open"  // Status can be Open, Closed, etc.
  };
  

  // Form state
  const [bidPrice, setBidPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Bid submitted for ${item.name}!`,
      description: `Price per unit: $${bidPrice}, Quantity: ${quantity}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    // Handle the submission logic here (e.g., API call to submit the bid)
  };

  return (
    <Flex
      direction="column"
      align="center"
      bg="brand.background_color"
      minH="100vh"
      p={8}
    >
      <Box
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="md"
        width={{ base: '100%', md: '80%' }}
        maxWidth="1000px"
      >
        <Heading as="h2" mb={6} textAlign="center" size="lg">
          Bid on {item.name}
        </Heading>

        {/* Two-Column Layout */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
          {/* Left Column - Image and Item Info */}
          <GridItem>
            <Image
              src={cpg_photo}
              alt={item.name}
              borderRadius="md"
              mb={4}
              width="60%"
              objectFit="cover"
            />
            <Box>
              <Text fontWeight="bold" mb={2}>
                Product Name:
              </Text>
              <Text mb={4}>{item.name}</Text>
              <Text fontWeight="bold" mb={2}>
                Seller Company:
              </Text>
              <Text mb={4}>{item.sellerCompany}</Text>
              <Text fontWeight="bold" mb={2}>
                Description:
              </Text>
              <Text mb={4}>{item.description}</Text>
              <Text fontWeight="bold" mb={2}>
                SKU:
              </Text>
              <Text mb={4}>{item.sku}</Text>
              <Text fontWeight="bold" mb={2}>
                Auction Close Date:
              </Text>
              <Text mb={4}>{item.closeDate}</Text>
              <Text fontWeight="bold" mb={2}>
                Item Expiration:
              </Text>
              <Text mb={4}>{item.expiration}</Text>
              <Text fontWeight="bold" mb={2}>
                Units per Pallet:
              </Text>
              <Text mb={4}>{item.units}</Text>
            </Box>
          </GridItem>

          {/* Right Column - Bidding Form */}
          <GridItem>
            <form onSubmit={handleSubmit}>
              <FormControl mb={4}>
                <FormLabel>Price per Unit</FormLabel>
                <NumberInput
                  value={bidPrice}
                  onChange={(valueString) => setBidPrice(valueString)}
                  precision={2}
                  step={0.01}
                  min={0}
                >
                  <NumberInputField placeholder="Enter price per unit" />
                </NumberInput>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Quantity</FormLabel>
                <NumberInput
                  value={quantity}
                  onChange={(valueString) => setQuantity(valueString)}
                  min={1}
                >
                  <NumberInputField placeholder="Enter quantity" />
                </NumberInput>
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                width="full"
                mt={4}
              >
                Submit Bid
              </Button>
            </form>
          </GridItem>
        </Grid>
      </Box>
    </Flex>
  );
};

export default BiddingPage;
