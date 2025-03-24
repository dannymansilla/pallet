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

// OPTIONAL FAKE DATA FOR DEMO
const fakeSearchResults = [
  { id: "COMPANY_01", name: "Acme Retailers" },
  { id: "COMPANY_02", name: "Global Foods Inc." },
  { id: "COMPANY_03", name: "Healthy Snacks Co." },
];
const fakeNetwork = [
  { id: "C101", name: "Current Buyer A" },
  { id: "C102", name: "Current Buyer B" },
];
const fakePendingRequests = [
  {
    id: "PR001",
    buyer_company: "Requesting Buyer X",
    timestamp: Date.now(),
  },
];
const fakePendingInvites = [
  {
    contact_email: "invite@somebuyer.com",
    company_name: "Invited Buyer Z",
    status: "Pending",
  },
];

const SellerNetworkPage = () => {
  const toast = useToast();

  // State: Search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(fakeSearchResults);

  // State: Network Management
  const [network, setNetwork] = useState(fakeNetwork);
  const [pendingRequests, setPendingRequests] = useState(fakePendingRequests);
  const [pendingInvites, setPendingInvites] = useState(fakePendingInvites);

  // Loading states
  const [loading, setLoading] = useState(false); // for searching
  const [isUploading, setIsUploading] = useState(false);

  // Theming
  const pageBg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // FETCHES / API CALLS
  // ------------------------------------

  // Example search call
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchCompanies(searchTerm);
      // For DEMO: if no real response, fallback to fake
      setSearchResults(response?.data || fakeSearchResults);
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

      // Simulate a small delay for backend
      setTimeout(async () => {
        const [networkResponse, pendingInvitesResponse, pendingRequestsResponse] =
          await Promise.all([
            fetchNetwork(),
            fetchPendingInvites(),
            fetchPendingRequests(),
          ]);

        setNetwork(networkResponse?.data || fakeNetwork);
        setPendingInvites(pendingInvitesResponse || fakePendingInvites);
        setPendingRequests(pendingRequestsResponse || fakePendingRequests);
      }, 1000);
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

  const loadNetwork = useCallback(async () => {
    try {
      const response = await fetchNetwork();
      setNetwork(response?.data || fakeNetwork);
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
      setPendingRequests(response || fakePendingRequests);
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
      setPendingInvites(Array.isArray(invites) ? invites : fakePendingInvites);
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

  // On mount, load data from server
  useEffect(() => {
    loadNetwork();
    loadPendingRequests();
    loadPendingInvites();
  }, [loadNetwork, loadPendingRequests, loadPendingInvites]);

  // RENDER
  // ------------------------------------
  return (
    <Box bg={pageBg} p={6} minH="100vh">
      <Heading mb={6}>Manage Your Buyer Network</Heading>

      {/* SEARCH SECTION */}
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        p={4}
        borderRadius="md"
        mb={6}
        shadow="sm"
      >
        <Heading size="md" mb={4}>
          Search for Companies
        </Heading>
        <Flex gap={4} align="center" w="100%">
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

        {/* Search Results Table */}
        {(loading || searchResults.length > 0) && (
          <Box mt={6} border="1px solid" borderColor={borderColor} borderRadius="md" p={4}>
            <Heading size="sm" mb={2}>
              Search Results
            </Heading>
            {loading ? (
              <Spinner />
            ) : (
              <Table variant="simple" size="md">
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
                              // Refresh the network list
                              const response = await fetchNetwork();
                              setNetwork(response?.data || fakeNetwork);
                              // Remove from search results
                              setSearchResults((prev) =>
                                prev.filter((c) => c.id !== company.id)
                              );
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
      </Box>

      {/* TABS: PENDING REQUESTS, INVITES, CURRENT NETWORK */}
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
        p={4}
        shadow="sm"
      >
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList py={2}>
            <Tab>Pending Requests</Tab>
            <Tab>Pending Invitations</Tab>
            <Tab>Current Network</Tab>
          </TabList>

          <TabPanels>
            {/* Pending Requests */}
            <TabPanel>
              <Heading size="sm" mb={2}>
                Pending Requests
              </Heading>
              {pendingRequests.length > 0 ? (
                <Table variant="simple" size="md" shadow="sm" borderRadius="md">
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
                        <Td>
                          {new Date(request.timestamp).toLocaleDateString()}
                        </Td>
                        <Td>
                          <Button
                            colorScheme="green"
                            size="sm"
                            onClick={() => handleNetworkRequest(request.id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            colorScheme="red"
                            size="sm"
                            ml={2}
                            onClick={() => handleNetworkRequest(request.id, "reject")}
                          >
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
              <Heading size="sm" mb={2}>
                Pending Invitations
              </Heading>
              {pendingInvites.length > 0 ? (
                <Table variant="simple" size="md" shadow="sm" borderRadius="md">
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
              <Heading size="sm" mb={2}>
                Current Network
              </Heading>
              {network.length > 0 ? (
                <Table variant="simple" size="md" shadow="sm" borderRadius="md">
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
                                // Refresh the network list
                                const response = await fetchNetwork();
                                setNetwork(response?.data || fakeNetwork);
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
      </Box>

      {/* Import Buyers Button */}
      <Box mt={6} textAlign="right">
        <Button
          colorScheme="blue"
          onClick={handleBulkUploadBuyers}
          isLoading={isUploading}
          isDisabled={isUploading}
        >
          Import Buyers
        </Button>
      </Box>
    </Box>
  );
};

export default SellerNetworkPage;
