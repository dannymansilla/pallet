import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";
import Container from "./Container";
import WidthPlaceholder from "./WidthPlaceholder";

const Layout = ({ children }) => {

  return (
    <Flex direction="column" minH="100vh">
      {/* Header */}
      <Box as="header" w="100%">
        <Header />
      </Box>

      <Container>
      {/* Main Content */}
        <Box as="main" flex="1" pt={{ base: "70px", md: "0" }}>
        {children}
        <WidthPlaceholder columns={6} boxCount={1} />
      </Box>
      </Container>
      

      {/* Footer */}
      <Box as="footer" w="100%">
        <Footer />
      </Box>
    </Flex>
  );
};

export default Layout;
