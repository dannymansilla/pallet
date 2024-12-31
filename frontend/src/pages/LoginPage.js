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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate("/admin");
      toast({
        title: "Login successful!",
        description: "Redirecting to the admin dashboard...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
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
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={4}
    >
      <Box bg="white" p={8} shadow="md" borderRadius="lg" w="full" maxW="md">
        <Heading as="h2" size="lg" mb={6} textAlign="center">
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl id="username" isRequired mb={4}>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl id="password" isRequired mb={6}>
            <FormLabel>Password</FormLabel>
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
