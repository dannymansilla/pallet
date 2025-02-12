import React from "react";
import { Box } from "@chakra-ui/react";

const Container = ({ children }) => {
  return (
    <Box mx="auto" minW="1200px">
      {children}
    </Box>
  );
};

export default Container;
