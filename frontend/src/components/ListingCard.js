import React from "react";
import { Box, Text, Button, Flex } from "@chakra-ui/react";

const ListingCard = ({ listing, onViewDetails }) => {
  return (
    <Box
      bg="white"
      shadow="md"
      borderRadius="lg"
      p={4}
      _hover={{ shadow: "lg" }}
      display="flex"
      flexDirection="column"
      h="100%" // Ensures all cards have the same height
    >
      {/* Product Info */}
      <Flex flexDirection="column" flex="1">
        <Text pb={4} fontWeight="bold">{listing.product.name}</Text>
        <Text>{listing.product.description}</Text>
        <Text>
          Auction ends:{" "}
          {new Date(listing.auction_cycle.end_date).toLocaleDateString()}
        </Text>
      </Flex>

      {/* View Details Button - Always Stays at Bottom */}
      <Button mt={6} variant="outline" onClick={() => onViewDetails(listing.id)}>
        View Details
      </Button>
    </Box>
  );
};

export default ListingCard;
