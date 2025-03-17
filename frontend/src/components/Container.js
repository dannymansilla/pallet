import React from "react";
import { Box } from "@chakra-ui/react";

const Container = ({ children }) => {
  return (
    <Box 
      mx="auto" 
      w="100%" 
      maxW="1400px" 
      px={{ base: 4, md: 8 }}
      display="flex"
      flexDirection="column"
      alignItems="center"  // Ensures contents inside are centered
    >
      {children}
    </Box>
  );
};


export default Container;
