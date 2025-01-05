
import { Box, Heading, Text } from "@chakra-ui/react";

const AuctionCard = ({ auction }) => (
  <Box
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
    <Text color="gray.500">Status: {auction.status}</Text>
    <Text color="gray.500">Start: {auction.start_date}</Text>
    <Text color="gray.500">End: {auction.end_date}</Text>
  </Box>
);

export default AuctionCard;