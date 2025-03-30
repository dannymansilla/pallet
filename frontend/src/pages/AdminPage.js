import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { getPendingCompanies, approveCompany, rejectCompany } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if the user is not an admin
    if (user?.role !== 'admin') {
      navigate("/unauthorized");
      return;
    }

    // Fetch pending organizations if user is admin
    const fetchOrganizations = async () => {
      try {
        const response = await getPendingCompanies();
        setOrganizations(response.data);
      } catch (err) {
        setError("Failed to fetch organizations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [user, navigate]);

  const handleApprove = async (orgId) => {
    try {
      await approveCompany(orgId);
      toast({
        title: "Organization approved!",
        description: "The organization has been successfully approved.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Remove the approved organization from the list
      setOrganizations((prev) => prev.filter(org => org.id !== orgId));
    } catch (err) {
      toast({
        title: "Approval failed",
        description: "An error occurred while approving the organization.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReject = async (orgId) => {
    try {
      await rejectCompany(orgId);
      toast({
        title: "Organization rejected!",
        description: "The organization has been successfully rejected.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Remove the rejected organization from the list
      setOrganizations((prev) => prev.filter(org => org.id !== orgId));
    } catch (err) {
      toast({
        title: "Rejection failed",
        description: "An error occurred while rejecting the organization.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box p={8} minH="100vh" bg="gray.50">
      <Heading mb={6} textAlign="center">
        Pending Organizations
      </Heading>
      {organizations.length === 0 ? (
        <Text textAlign="center">No pending organizations found.</Text>
      ) : (
        <VStack spacing={4}>
          {organizations.map((org) => (
            <Box
              key={org.id}
              p={4}
              bg="white"
              shadow="sm"
              borderRadius="md"
              w="full"
              maxW="lg"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <Box>
                  <Text fontWeight="bold">{org.name}</Text>
                  <Text fontSize="sm">
                    Type: {[
                      org.is_buyer && 'Buyer',
                      org.is_seller && 'Seller'
                    ].filter(Boolean).join(', ')}
                  </Text>
                  <Badge colorScheme="yellow">
                    Pending Approval
                  </Badge>
                </Box>
                <HStack>
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={() => handleApprove(org.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleReject(org.id)}
                  >
                    Reject
                  </Button>
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default AdminPage;
