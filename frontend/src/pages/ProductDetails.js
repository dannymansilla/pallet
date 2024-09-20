// src/pages/ProductDetails.js
import React from 'react';
import { Box, Flex, Heading, Text, List, ListItem, ListIcon, Button } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const ProductDetails = () => {
  return (
    <Box bg="brand.background_color" p={8} minH="80vh">
      <Flex
        direction="column"
        align="center"
        maxW="800px"
        mx="auto"
        p={6}
        bg="white"
        borderRadius="md"
        boxShadow="md"
        mb={8}
      >
        <Heading as="h1" size="xl" color="black" mb={4}>
          About Pallet Marketplace
        </Heading>
        <Text fontSize="lg" color="gray.600" mb={6} textAlign="center">
          Pallet Marketplace is a blind auction-style marketplace for purchasing large quantities of consumer packaged goods (CPGs).
        </Text>
        <Heading as="h2" size="md" color="black" mb={4}>
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
            Auctions close at the specified time, and the highest bids win.
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="teal.500" />
            Buyers and sellers connect to arrange payment and shipping.
          </ListItem>
        </List>
        <Button variant="solid" size="lg" as="a" href="/auctions">
          Browse Auctions
        </Button>
      </Flex>
    </Box>
  );
};

export default ProductDetails;
