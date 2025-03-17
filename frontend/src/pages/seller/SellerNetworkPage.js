import React, { useState, useEffect, useCallback } from "react";
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
  Flex,
  Text,
  useToast,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  addToNetwork,
  removeFromNetwork,
  searchCompanies,
  fetchNetwork,
  fetchPendingRequests,
  handleNetworkRequest,
  fetchPendingInvites,
  bulkUploadBuyers,
} from "../../services/api";

const SellerNetworkPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [network, setNetwork] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const toast = useToast();

  const bgColor = "white";
  const cardBg = useColorModeValue("white", "gray.700");

  // Fetch companies based on search term
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchCompanies(searchTerm);
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

  const handleBulkUploadBuyers = async () => {
    setIsUploading(true);
    try {
      await bulkUploadBuyers();
      toast({
        title: "Buyers Added Successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  
      // Small delay to allow backend to update
      setTimeout(async () => {
        const [networkResponse, pendingInvitesResponse, pendingRequestsResponse] = await Promise.all([
          fetchNetwork(),
          fetchPendingInvites(),
          fetchPendingRequests(),
        ]);
  
        // Note: fetchNetwork returns an object with a data property
        setNetwork([...networkResponse?.data || []]);
        // But fetchPendingInvites and fetchPendingRequests return arrays directly.
        setPendingInvites([...pendingInvitesResponse || []]);
        setPendingRequests([...pendingRequestsResponse || []]);
      }, 1000); // Delay fetch to allow backend to update
    } catch (error) {
      toast({
        title: "Error Adding Buyers",
        description: "Failed to add buyers to network. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  

  // Load network, pending requests, and invites
  const loadNetwork = useCallback(async () => {
    try {
      const response = await fetchNetwork();
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
  }, [toast]);

  const loadPendingRequests = useCallback(async () => {
    try {
      const response = await fetchPendingRequests();
      setPendingRequests(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending requests.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const loadPendingInvites = useCallback(async () => {
    try {
      const invites = await fetchPendingInvites();
      setPendingInvites(Array.isArray(invites) ? invites : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invites.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setPendingInvites([]);
    }
  }, [toast]);

  useEffect(() => {
    loadNetwork();
    loadPendingRequests();
    loadPendingInvites();
  }, [loadNetwork, loadPendingRequests, loadPendingInvites]);

  return (
    <Box bg={bgColor} p={6} minH="100vh">
      {/* <Heading mb={6}>Seller Network</Heading> */}

      {/* Search Bar */}
      <Flex mb={6} gap={4} align="center" w="100%">
        <Input
          placeholder="Search for companies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          flex="1"
          maxW="1400px"
        />
        <Button
          onClick={handleSearch}
          colorScheme="blue"
          isDisabled={!searchTerm}
          isLoading={loading}
          px={6}
        >
          Search
        </Button>
      </Flex>

      {/* Search Results */}
      {(loading || searchResults.length > 0) && (
      <Box bg={cardBg} p={4} borderRadius="lg" shadow="md" mb={6}>
        <Heading size="md" mb={4}>Search Results</Heading>
        {loading ? (
          <Spinner />
        ) : (
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
  onClick={async () => {
    try {
      await addToNetwork(company.id);
      toast({
        title: "Company Added",
        description: `${company.name} has been added to your network.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // **Refresh the network list after adding a company**
      const response = await fetchNetwork();
      setNetwork(response.data);

      // Optional: Remove the company from search results so it's not added twice
      setSearchResults((prevResults) => prevResults.filter((c) => c.id !== company.id));
    } catch (error) {
      toast({
        title: "Error Adding Company",
        description: "Failed to add the company. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }}
>
  Add to Network
</Button>

                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    )}

      {/* Tabs for Managing Network */}
      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList py={6}>
          <Tab>Pending Requests</Tab>
          <Tab>Pending Invitations</Tab>
          <Tab>Current Network</Tab>
        </TabList>

        <TabPanels>
          {/* Pending Requests */}
          <TabPanel>
            {pendingRequests.length > 0 ? (
              <Table variant="simple" shadow="md" borderRadius="lg">
                <Thead>
                  <Tr>
                    <Th>Company Name</Th>
                    <Th>Requested On</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingRequests.map((request) => (
                    <Tr key={request.id}>
                      <Td>{request.buyer_company}</Td>
                      <Td>{new Date(request.timestamp).toLocaleDateString()}</Td>
                      <Td>
                        <Button colorScheme="green" size="sm" onClick={() => handleNetworkRequest(request.id, "approve")}>
                          Approve
                        </Button>
                        <Button colorScheme="red" size="sm" onClick={() => handleNetworkRequest(request.id, "reject")} ml={2}>
                          Reject
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>No pending requests.</Text>
            )}
          </TabPanel>

          {/* Pending Invitations */}
          <TabPanel>
            {pendingInvites.length > 0 ? (
              <Table variant="simple" shadow="md" borderRadius="lg">
                <Thead>
                  <Tr>
                    <Th>Company Name</Th>
                    <Th>Email</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingInvites.map((invite) => (
                    <Tr key={invite.contact_email}>
                      <Td>{invite.company_name}</Td>
                      <Td>{invite.contact_email}</Td>
                      <Td>{invite.status}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>No pending invitations.</Text>
            )}
          </TabPanel>

          {/* Current Network */}
          <TabPanel>
            {network.length > 0 ? (
              <Table variant="simple" shadow="md" borderRadius="lg">
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
  onClick={async () => {
    try {
      await removeFromNetwork(member.id);
      toast({
        title: "Company Removed",
        description: `${member.name} has been removed from your network.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // **Refresh the network list after removal**
      const response = await fetchNetwork();
      setNetwork(response.data);
    } catch (error) {
      toast({
        title: "Error Removing Company",
        description: "Failed to remove the company. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }}
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
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Box my={6} position="relative">
        <Flex justifyContent="flex-end">
          <Button 
            colorScheme="blue" 
            onClick={handleBulkUploadBuyers} 
            isLoading={isUploading}
            isDisabled={isUploading} // Prevents duplicate uploads
          >
            Import Buyers
          </Button>
        </Flex>
      </Box>

    </Box>
  );
};

export default SellerNetworkPage;
