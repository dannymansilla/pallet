import React from "react";
import { Box } from "@chakra-ui/react";

const Container = ({ children }) => {
  return (
    <Box maxW="1400px" mx="auto" px={4}>
      {children}
    </Box>
  );
};

export default Container;
