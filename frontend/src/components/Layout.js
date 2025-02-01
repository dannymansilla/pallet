import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";
import Container from "./Container";
import WidthPlaceholder from "./WidthPlaceholder";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {

  const { user, logout } = useAuth();

  return (
    <Flex direction="column" minH="100vh">
      {/* Header */}
      <Box as="header" w="100%">
        <Header />
      </Box>

      <Container>
      {/* Main Content */}
        <Box as="main" flex="1" pt={{ base: "70px", md: user !== null && user.company.status === "approved" ? "110px" : "80px" }}>
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
