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
import { getAllCompanies, approveCompany, rejectCompany } from "../services/api";

const AdminPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await getAllCompanies(); // Fetch all companies with status
        setCompanies(response.data);
      } catch (err) {
        setError("Failed to fetch companies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleApprove = async (companyId) => {
    try {
      await approveCompany(companyId);
      toast({
        title: "Company approved!",
        description: "The company has been successfully approved.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === companyId ? { ...company, status: "approved" } : company
        )
      );
    } catch (err) {
      toast({
        title: "Approval failed",
        description: "An error occurred while approving the company.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReject = async (companyId) => {
    try {
      await rejectCompany(companyId);
      toast({
        title: "Company rejected!",
        description: "The company has been successfully rejected.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === companyId ? { ...company, status: "rejected" } : company
        )
      );
    } catch (err) {
      toast({
        title: "Rejection failed",
        description: "An error occurred while rejecting the company.",
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
        Company Management
      </Heading>
      {companies.length === 0 ? (
        <Text textAlign="center">No companies found.</Text>
      ) : (
        <VStack spacing={4}>
          {companies.map((company) => (
            <Box
              key={company.id}
              p={4}
              bg="white"
              shadow="sm"
              borderRadius="md"
              w="full"
              maxW="lg"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <Box>
                  <Text fontWeight="bold">{company.name}</Text>
                  <Text fontSize="sm">Email: {company.contact_email}</Text>
                  <Text fontSize="sm">Role: {company.roles}</Text>
                  <Badge colorScheme={company.status === "pending" ? "yellow" : company.status === "approved" ? "green" : "red"}>
                    {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                  </Badge>
                </Box>
                {company.status === "pending" && (
                  <HStack>
                    <Button
                      colorScheme="green"
                      size="sm"
                      onClick={() => handleApprove(company.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleReject(company.id)}
                    >
                      Reject
                    </Button>
                  </HStack>
                )}
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default AdminPage;
