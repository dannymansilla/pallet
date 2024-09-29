import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Input, FormControl, FormLabel, Heading, Stack } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const CreateAccountPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [companyName, setCompanyName] = useState('');
  // const [companyAddress, setCompanyAddress] = useState('');
  // const [companyPhone, setCompanyPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Updated navigate method

  const { checkLoginStatus } = useAuth();

  // Function to handle registration
  const handleRegister = async () => {
    try {
      // Make API request to register user
      const response = await axios.post('/api/register/', {
        username: name,  // Using name as the username for Django User model
        email,
        password
      });
      console.log("Registration successful", response.data);

      // Extract the tokens from the response
      const { access, refresh } = response.data;

      // Store the tokens in localStorage (or sessionStorage for temporary sessions)
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      checkLoginStatus();
      // Redirect to the home page after successful registration and login
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please check the information and try again.');
      console.log(err.response);
    }
  };

  return (
    <Box bg="brand.background_color" p={8} minH="80vh">
      <Box maxW="600px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading as="h1" size="xl" mb={6}>
          Create an Account
        </Heading>
        {error && <Box color="red.500" mb={4}>{error}</Box>}
        <FormControl id="name" mb={4}>
          <FormLabel>Name</FormLabel>
          <Input placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
        </FormControl>
        <FormControl id="email" mb={4}>
          <FormLabel>Email</FormLabel>
          <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="password" mb={4}>
          <FormLabel>Password</FormLabel>
          <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        {/* <FormControl id="companyName" mb={4}>
          <FormLabel>Company Name</FormLabel>
          <Input placeholder="Enter your company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </FormControl>
        <FormControl id="companyAddress" mb={4}>
          <FormLabel>Company Address</FormLabel>
          <Textarea placeholder="Enter your company address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
        </FormControl>
        <FormControl id="companyPhone" mb={4}>
          <FormLabel>Company Phone</FormLabel>
          <Input placeholder="Enter your company phone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
        </FormControl> */}
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={6}>
          <Button colorScheme="blue" onClick={handleRegister}>
            Create Account
          </Button>
           {/* <Button variant="outline" onClick={() => history.push('/login')}>
            Cancel
          </Button> */}
        </Stack>
      </Box>
    </Box>
  );
};

export default CreateAccountPage;
