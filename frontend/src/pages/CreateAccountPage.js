import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig'; 
import { Box, Button, Input, FormControl, FormLabel, Heading, Stack, Select, Checkbox } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext'; // Using AuthContext for login

const CreateAccountPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');  // Role state
  const [company, setCompany] = useState('');  // Company state
  const [newCompany, setNewCompany] = useState(false); // Toggle for new company
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companies, setCompanies] = useState([]);  // List of companies
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Navigate after successful registration

  const { checkLoginStatus } = useAuth(); // Access AuthContext to check login status

  // Fetch available companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axiosInstance.get('/api/companies/');
        setCompanies(response.data);
      } catch (err) {
        console.error('Error fetching companies', err);
      }
    };
    fetchCompanies();
  }, []);

  // Function to handle registration
  const handleRegister = async () => {
    try {
      let companyId = company;

      // If creating a new company, send API request to create the company
      if (newCompany) {
        const companyResponse = await axiosInstance.post('/api/companies/', {
          company_name: companyName,
          address: companyAddress,
          phone: companyPhone
        });
        companyId = companyResponse.data.id;  // Use the newly created company ID
      }

      // Make API request to register user
      const response = await axiosInstance.post('/api/register/', {
        name,
        email,
        password,
        role,
        company: companyId,  // Use the company ID (either selected or newly created)
      });

      // Extract the tokens from the response
      const { access, refresh } = response.data;

      // Store the tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      checkLoginStatus(); // Call to update authentication context

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
        <FormControl id="role" mb={4}>
          <FormLabel>Role</FormLabel>
          <Select placeholder="Select your role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </Select>
        </FormControl>

        {/* Checkbox for creating a new company */}
        <FormControl id="new-company" mb={4}>
          <Checkbox isChecked={newCompany} onChange={(e) => setNewCompany(e.target.checked)}>
            Create a New Company
          </Checkbox>
        </FormControl>

        {/* Show either company selection or new company form based on toggle */}
        {newCompany ? (
          <>
            <FormControl id="company-name" mb={4}>
              <FormLabel>Company Name</FormLabel>
              <Input placeholder="Enter company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </FormControl>
            <FormControl id="company-address" mb={4}>
              <FormLabel>Company Address</FormLabel>
              <Input placeholder="Enter company address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
            </FormControl>
            <FormControl id="company-phone" mb={4}>
              <FormLabel>Company Phone</FormLabel>
              <Input placeholder="Enter company phone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
            </FormControl>
          </>
        ) : (
          <FormControl id="company" mb={4}>
            <FormLabel>Company</FormLabel>
            <Select placeholder="Select your company" value={company} onChange={(e) => setCompany(e.target.value)}>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={6}>
          <Button colorScheme="blue" onClick={handleRegister}>
            Create Account
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default CreateAccountPage;
