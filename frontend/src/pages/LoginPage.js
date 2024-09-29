// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Box, Flex, Heading, Input, Button, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  // Function to handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("HELLO");

    try {
      // Make API request to login
      const response = await axios.post('/api/token/', {
        username: email,  // Since Django uses `username` by default, mapping email to username
        password,
      });
      console.log(response.data);

      // Extract tokens from response
      const { access, refresh } = response.data;

      // Store the tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Show success toast and redirect to the home page
      toast({
        title: 'Login Successful!',
        description: 'You are now logged in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to home page after successful login
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error(err.response);

      // Show error toast
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="brand.background_color" p={8} minH="80vh">
      <Flex direction="column" align="center" maxW="400px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading as="h1" size="xl" color="brand.600" mb={6}>
          Log In
        </Heading>
        <Box as="form" onSubmit={handleLogin} w="100%">
          {error && <Box color="red.500" mb={4}>{error}</Box>}
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormControl>
          <FormControl id="password" mb={6}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormControl>
          <Button type="submit" variant="solid" size="lg" w="100%" mb={4}>
            Log In
          </Button>
          <Button as={Link} to="/create-account" variant="ghost" size="sm" w="100%">
            Create an Account
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default LoginPage;
