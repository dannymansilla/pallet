// src/pages/LoginPage.js
import React from 'react';
import { Box, Flex, Heading, Input, Button, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import { Link } from 'react-router-dom'; 

const LoginPage = () => {
  const toast = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    // Add login logic here
    toast({
      title: 'Login Successful!',
      description: 'You are now logged in.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box bg="gray.50" p={8} minH="80vh">
      <Flex direction="column" align="center" maxW="400px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading as="h1" size="xl" color="brand.600" mb={6}>
          Log In
        </Heading>
        <Box as="form" onSubmit={handleLogin} w="100%">
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="Your Email" required />
          </FormControl>
          <FormControl id="password" mb={6}>
            <FormLabel>Password</FormLabel>
            <Input type="password" placeholder="Your Password" required />
          </FormControl>
          <Button type="submit" colorScheme="teal" size="lg" w="100%" mb={4}>
            Log In
          </Button>
          <Button as={Link} to="/create-account" colorScheme="gray" variant="link" size="sm" w="100%">
            Create an Account
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default LoginPage;
