// RequestDemoPage.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { InlineWidget } from "react-calendly";

const RequestDemoPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email"); // Extract email from URL

  // Construct Calendly URL with pre-filled email (if provided)
  const calendlyUrl = email
    ? `https://calendly.com/jake-hiaiden?email=${encodeURIComponent(email)}`
    : "https://calendly.com/jake-hiaiden";

  return (
    <Box bg="white" minH="100vh" py={16}>
      <Container maxW="container.md">
        {/* Page Heading */}
        <VStack spacing={4} textAlign="center" m={10}>
          <Heading as="h1" size="2xl" fontWeight="extrabold">
            Talk to Sales
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Discover how our platform can transform your business.
          </Text>
        </VStack>

        {/* Calendly Widget with Pre-filled Email */}
        <Box bg="white" p={6} borderRadius="md" boxShadow="md" overflow="hidden">
          <InlineWidget url={calendlyUrl} />
        </Box>
      </Container>
    </Box>
  );
};

export default RequestDemoPage;
