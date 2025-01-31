import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";

const ListingCard = ({ listing, onViewDetails }) => {
  return (
    <Box
      bg="white"
      shadow="md"
      borderRadius="lg"
      p={4}
      _hover={{ shadow: "lg" }}
    >
      <Text fontWeight="bold">{listing.product.name}</Text>
      <Text>{listing.product.description}</Text>
      <Text>
        Auction ends:{" "}
        {new Date(listing.auction_cycle.end_date).toLocaleDateString()}
      </Text>
      <Button mt={4} colorScheme="teal" onClick={() => onViewDetails(listing.id)}>
        View Details
      </Button>
    </Box>
  );
};

export default ListingCard;
