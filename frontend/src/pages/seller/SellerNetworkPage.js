import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  VStack,
  Text,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { addToNetwork, removeFromNetwork, searchCompanies, fetchNetwork } from "../../services/api"; // Example API services

const SellerNetworkPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchCompanies(searchTerm); // API call for searching companies
      setSearchResults(response.data);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to fetch search results.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToNetwork = async (companyId) => {
    try {
      await addToNetwork(companyId); // API call to add a company to the network
      toast({
        title: "Success",
        description: "Company added to your network.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadNetwork(); // Refresh the network
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add company to your network.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRemoveFromNetwork = async (companyId) => {
    try {
      await removeFromNetwork(companyId); // API call to remove a company from the network
      toast({
        title: "Success",
        description: "Company removed from your network.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadNetwork(); // Refresh the network
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove company from your network.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const loadNetwork = async () => {
    try {
      const response = await fetchNetwork(); // API call to fetch current network
      setNetwork(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load network.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadNetwork();
  }, []);

  return (
    <Box bg={bgColor} p={6} minH="100vh">
      <Heading mb={6}>Seller Network</Heading>

      <Box mb={6} p={4} bg={cardBg} borderRadius="lg" shadow="md">
        <Input
          placeholder="Search for companies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          mb={4}
        />
        <Button
          onClick={handleSearch}
          colorScheme="blue"
          isDisabled={!searchTerm}
          isLoading={loading}
        >
          Search
        </Button>
      </Box>

      <VStack align="stretch" spacing={6}>
        <Box bg={cardBg} p={4} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4}>
            Search Results
          </Heading>
          {loading ? (
            <Spinner />
          ) : searchResults.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Company Name</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {searchResults.map((company) => (
                  <Tr key={company.id}>
                    <Td>{company.name}</Td>
                    <Td>
                      <Button
                        colorScheme="teal"
                        size="sm"
                        onClick={() => handleAddToNetwork(company.id)}
                      >
                        Add to Network
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text>No results found.</Text>
          )}
        </Box>

        <Box bg={cardBg} p={4} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4}>
            Current Network
          </Heading>
          {network.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Company Name</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {network.map((member) => (
                  <Tr key={member.id}>
                    <Td>{member.name}</Td>
                    <Td>
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleRemoveFromNetwork(member.id)}
                      >
                        Remove
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text>No companies in your network.</Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default SellerNetworkPage;
