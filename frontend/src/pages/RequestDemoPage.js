// RequestDemoPage.jsx
import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { InlineWidget } from "react-calendly";

const RequestDemoPage = () => {
  return (
    <Box bg="white" minH="100vh" py={16}>
      <Container maxW="container.md">
        <VStack spacing={4} textAlign="center" m={10}>
          <Heading as="h1" size="2xl" fontWeight="extrabold">
            Request a Demo
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Schedule a demo with us and discover how our platform can transform your business.
          </Text>
        </VStack>
        <Box
          bg="white"
          p={6}
          borderRadius="md"
          boxShadow="md"
          overflow="hidden"
        >
          {/* Calendly inline widget */}
          <InlineWidget url="https://calendly.com/daniel-hiaiden" />
        </Box>
      </Container>
    </Box>
  );
};

export default RequestDemoPage;
