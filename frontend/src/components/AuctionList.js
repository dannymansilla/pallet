import { VStack, Box, Heading, Text } from "@chakra-ui/react";

const AuctionList = ({ auctions }) => (
  <VStack spacing={4} align="stretch">
    {auctions.map((auction) => (
      <Box
        key={auction.id}
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="sm"
        bg="white"
        _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
        transition="0.2s"
      >
        <Heading size="md" mb={2} color="gray.700">
          {auction.name}
        </Heading>
        <Text color="gray.500">{auction.description}</Text>
      </Box>
    ))}
  </VStack>
);

export default AuctionList;