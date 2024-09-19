// src/pages/CreateAccountPage.js
import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  // Grid,
  // GridItem
} from '@chakra-ui/react';

const CreateAccountPage = () => {
  const toast = useToast();

  const handleCreateAccount = (e) => {
    e.preventDefault();
    // Add account creation logic here
    toast({
      title: 'Account Created!',
      description: 'Your account has been created successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box bg="gray.50" p={8} minH="80vh">
      <Flex direction="column" align="center" maxW="600px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading as="h1" size="xl" color="brand.600" mb={6}>
          Create an Account
        </Heading>
        <Box as="form" onSubmit={handleCreateAccount} w="100%">
          <Heading as="h2" size="md" color="gray.700" mb={4}>
            User Details
          </Heading>
          <FormControl id="user-name" mb={4}>
            <FormLabel>Name</FormLabel>
            <Input type="text" placeholder="Your Name" required />
          </FormControl>
          <FormControl id="user-email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="Your Email" required />
          </FormControl>
          <FormControl id="user-password" mb={4}>
            <FormLabel>Password</FormLabel>
            <Input type="password" placeholder="Create a Password" required />
          </FormControl>
          
          <Heading as="h2" size="md" color="gray.700" mb={4} mt={8}>
            Company Details
          </Heading>
          <FormControl id="company-name" mb={4}>
            <FormLabel>Company Name</FormLabel>
            <Input type="text" placeholder="Company Name" required />
          </FormControl>
          <FormControl id="company-address" mb={4}>
            <FormLabel>Company Address</FormLabel>
            <Input type="text" placeholder="Company Address" required />
          </FormControl>
          <FormControl id="company-phone" mb={6}>
            <FormLabel>Company Phone</FormLabel>
            <Input type="tel" placeholder="Company Phone Number" required />
          </FormControl>
          
          <Button type="submit" colorScheme="teal" size="lg" w="100%" mb={4}>
            Create Account
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default CreateAccountPage;
