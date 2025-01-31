import React from "react";
import { Box, VStack, SimpleGrid, Text } from "@chakra-ui/react";

const WidthPlaceholder = ({ columns = 6, boxCount = 1 }) => {
  return (
    <Box w="100%">
      <VStack align="center" textAlign="center" w="100%">
        <SimpleGrid columns={[columns]} spacing={6} w="100%">
          {Array(boxCount)
            .fill("")
            .map((_, index) => (
              <Box
                key={index}
                visibility="hidden"
                p={6}
                bg="white"
                borderRadius="md"
                shadow="md"
              >
                <Text color="white">Empty Placeholder</Text>
              </Box>
            ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default WidthPlaceholder;
