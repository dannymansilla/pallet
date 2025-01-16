// src/components/Layout.js

import { Flex, Box } from "@chakra-ui/react";

const Layout = ({ children }) => {
  return (
    <Flex direction="column" minH="100vh">
      {/* Header */}
      <Box as="header" w="100%">
        {/* Your header content here */}
      </Box>

      {/* Main Content */}
      <Box as="main" flex="1">
        {children} {/* This will render your page content */}
      </Box>

      {/* Footer */}
      <Box as="footer">
        {/* Your footer content here */}
      </Box>
    </Flex>
  );
};

export default Layout;
