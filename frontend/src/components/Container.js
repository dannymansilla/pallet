import React from "react";
import { Box } from "@chakra-ui/react";

const Container = ({ children }) => {
  return (
    <Box mx="auto">
      {children}
    </Box>
  );
};

export default Container;
