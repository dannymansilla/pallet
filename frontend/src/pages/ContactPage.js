// src/pages/ContactUs.js
import React from 'react';
import { Box, Flex, Heading, Text, Input, Textarea, Button, FormControl, FormLabel, useToast } from '@chakra-ui/react';

const ContactUs = () => {
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
    toast({
      title: 'Message Sent!',
      description: 'We have received your message and will get back to you soon.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box bg="gray.50" p={8} minH="80vh">
      <Flex direction="column" align="center" maxW="800px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading as="h1" size="xl" color="brand.600" mb={4}>
          Contact Us
        </Heading>
        <Text fontSize="lg" color="gray.600" mb={8} textAlign="center">
          Have any questions or need help? Fill out the form below, and we'll get in touch as soon as possible.
        </Text>
        <Box as="form" onSubmit={handleSubmit} w="100%">
          <FormControl id="name" mb={4}>
            <FormLabel>Name</FormLabel>
            <Input type="text" placeholder="Your Name" required />
          </FormControl>
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="Your Email" required />
          </FormControl>
          <FormControl id="message" mb={6}>
            <FormLabel>Message</FormLabel>
            <Textarea placeholder="Your Message" required />
          </FormControl>
          <Button type="submit" colorScheme="teal" size="lg" w="100%">
            Send Message
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default ContactUs;
