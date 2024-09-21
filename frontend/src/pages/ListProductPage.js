
import React, { useState } from 'react';
import { Box, Flex, Heading, Button, Stack, Input, Textarea, FormControl, FormLabel, Select, Image } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const ListProductPage = () => {
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(URL.createObjectURL(file));
  };

  return (
    <Box bg="brand.background_color" p={8} minH="80vh">
      <Flex direction="column" align="center" maxW="800px" mx="auto" p={6} bg="brand.background_color" borderRadius="md" boxShadow="md">
        <Heading as="h1" size="xl" color="black" mb={6}>
          List a New Product
        </Heading>
        
        <FormControl id="product-name" mb={4}>
          <FormLabel>Product Name</FormLabel>
          <Input placeholder="Enter product name" />
        </FormControl>

        <FormControl id="sku" mb={4}>
          <FormLabel>SKU</FormLabel>
          <Input placeholder="Enter SKU" />
        </FormControl>

        <FormControl id="description" mb={4}>
          <FormLabel>Description</FormLabel>
          <Textarea placeholder="Enter product description" />
        </FormControl>

        <FormControl id="quantity" mb={4}>
          <FormLabel>Quantity</FormLabel>
          <Input type="number" placeholder="Enter quantity" />
        </FormControl>

        <FormControl id="starting-bid" mb={4}>
          <FormLabel>Starting Bid</FormLabel>
          <Input type="number" placeholder="Enter starting bid" />
        </FormControl>

        <FormControl id="auction-end-date" mb={4}>
          <FormLabel>Auction End Date</FormLabel>
          <Input type="date" />
        </FormControl>

        <FormControl id="expiration-date" mb={4}>
          <FormLabel>Expiration Date</FormLabel>
          <Input type="date" />
        </FormControl>

        <FormControl id="units" mb={4}>
          <FormLabel>Units</FormLabel>
          <Select placeholder="Select unit type">
            <option value="units">Units</option>
            <option value="cases">Cases</option>
            <option value="pallets">Pallets</option>
          </Select>
        </FormControl>

        <FormControl id="price-per-unit" mb={4}>
          <FormLabel>Price per Unit</FormLabel>
          <Input type="number" placeholder="Enter price per unit" />
        </FormControl>

        <FormControl id="product-image" mb={4}>
          <FormLabel>Product Image</FormLabel>
          <Input type="file" onChange={handleImageUpload} />
          {image && <Image src={image} alt="Product Preview" borderRadius="8px" mt={4} />}
        </FormControl>

        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={6}>
          <Button variant="solid" size="lg" colorScheme="blue">
            List Product
          </Button>
          <Button as={RouterLink} to="/" variant="outline" size="lg">
            Cancel
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
};

export default ListProductPage;
