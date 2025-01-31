// src/pages/ProductDetails.js
import React from 'react';
import { Box, Flex, Heading, Text, List, ListItem, ListIcon, Button } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const ProductDetails = () => {
  return (
    <Box bg="brand.background_color" py={8} minH="80vh">
      <Flex
        direction="column"
        mx="auto"
        py={6}
        bg="white"
        mb={8}
      >
        <Heading fontSize={{ base: '3xl', md: '5xl' }} color="black" mb={4}>
          Marketplace
        </Heading>
        <Text fontSize="lg" color="gray.600" mb={6}>
          Aiden Marketplace is a blind auction-style marketplace for purchasing large quantities of consumer packaged goods (CPGs).
        </Text>
        <Heading as="h2" size="md" color="black" mb={4} py={5}>
          How It Works
        </Heading>
        <List spacing={3} mb={6}>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="teal.500" />
            Sellers list pallets of CPGs with starting prices and auction details.
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="teal.500" />
            Buyers place blind bids, which are hidden from other buyers.
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="teal.500" />
            Auctions close at the specified time.
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="teal.500" />
            We optimize bids to maximize complete truckloads.
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="teal.500" />
            Buyers and sellers connect to arrange payment and shipping.
          </ListItem>
        </List>
        <Box py={16} bg="brand.background_color">
        <Button variant="solid" size="lg" as="a" href="/auctions">
          Browse Auctions
        </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default ProductDetails;
