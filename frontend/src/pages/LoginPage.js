import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Heading,
  useToast,
} from "@chakra-ui/react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      const user = JSON.parse(localStorage.getItem("user"));
      
      // First check role and approval status
      if (user.role === 'admin') {
        navigate("/admin");
      }
      else if (user.organization?.approval_status === "pending") {
        navigate("/profile");
        toast({
          title: "Account Pending",
          description: "Your account is pending approval. Please check back later.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      // If approved, check organization type
      else if (user.organization?.approval_status === "approved") {
        if (user.role === 'buyer' || (user.organization?.is_buyer && !user.organization?.is_seller)) {
          navigate("/dashboard");
        } 
        else if (user.role === 'seller' || (!user.organization?.is_buyer && user.organization?.is_seller)) {
          navigate("/dashboard");
        } 
        else if (user.organization?.is_buyer && user.organization?.is_seller) {
          navigate("/dashboard");
        }
      }

      toast({
        title: "Login successful!",
        description: "Redirecting...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Login failed:", err);
      toast({
        title: "Login failed",
        description: error || "Invalid credentials.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  

  return (
    <Box
      bg="white"
      minH="90vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box bg="white" p={8} shadow="md" borderRadius="lg" w="full" maxW="md">
        <Heading as="h2" size="lg" mb={6} textAlign="center">
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl id="email" isRequired mb={4}>
            <FormLabel>email</FormLabel>
            <Input
              type="text"
              placeholder="youremail@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="password" isRequired mb={6}>
            <FormLabel>password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            w="full"
            isLoading={isLoading}
          >
            Login
          </Button>
        </form>
        {error && (
          <Box color="red.500" mt={4} textAlign="center">
            {error}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LoginPage;
