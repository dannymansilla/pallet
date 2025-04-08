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
  Flex,
  Text,
  useToast,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Switch,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  getSellerNetwork,
  addBuyerToNetwork,
  removeBuyerFromNetwork,
  updateNetworkRequest,
  searchBuyers,
  uploadBuyersBulk,
} from "../../services/api";

// FAKE DATA FOR DEMO
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

  // Toggle between sample and backend data
  const [useSampleData, setUseSampleData] = useState(true);

  // General loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Network management states
  const [network, setNetwork] = useState(fakeNetwork);
  const [pendingRequests, setPendingRequests] = useState(fakePendingRequests);
  const [pendingInvites, setPendingInvites] = useState(fakePendingInvites);

  // Simulate uploads
  const [isUploading, setIsUploading] = useState(false);

  // Theming
  const pageBg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // ------------------------------------
  // DATA FETCH / RESET on Toggle
  // ------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      // If switching to real data
      if (!useSampleData) {
        setLoading(true);
        try {
          const response = await getSellerNetwork();
          // Transform the data for local state
          const activeNetwork = response.active_network.map(item => ({
            id: item.id,
            name: item.buyer_name,
            email: item.buyer_email
          }));
          const requests = response.pending_requests.map(item => ({
            id: item.id,
            buyer_company: item.buyer_name,
            timestamp: new Date(item.created_at).getTime()
          }));
          const invites = response.pending_invites.map(item => ({
            contact_email: item.buyer_email,
            company_name: item.buyer_name,
            status: item.status_display
          }));

          setNetwork(activeNetwork);
          setPendingRequests(requests);
          setPendingInvites(invites);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch network data:", err);
          setError("Failed to load data. Using sample data instead.");
          setUseSampleData(true);
        }
        setLoading(false);
      } else {
        // Switch back to sample data
        setNetwork(fakeNetwork);
        setPendingRequests(fakePendingRequests);
        setPendingInvites(fakePendingInvites);
      }
    };

    // Whenever we toggle "useSampleData", reset search + load data
    setSearchTerm("");
    setSearchResults([]);
    setHasSearched(false);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSampleData]);

  // ------------------------------------
  // SEARCH HANDLER
  // ------------------------------------
  const handleSearch = async () => {
    // If no input, bail out
    if (!searchTerm) return;

    setSearchLoading(true);
    setHasSearched(true);

    if (useSampleData) {
      // Simulate a delay for fake data
      setTimeout(() => {
        // Filter the fakeSearchResults by searchTerm (case-insensitive substring match)
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = fakeSearchResults.filter((buyer) =>
          buyer.name.toLowerCase().includes(lowerTerm)
        );

        setSearchResults(filtered);
        setSearchLoading(false);
      }, 800);
    } else {
      // Real data fetch
      try {
        const response = await searchBuyers(searchTerm);
        const transformed = response.results.map((buyer) => ({
          id: buyer.id,
          name: buyer.name,
          email: buyer.email,
        }));
        setSearchResults(transformed);
      } catch (error) {
        toast({
          title: "Search Error",
          description: "Failed to fetch search results.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setSearchLoading(false);
      }
    }
  };

  // ------------------------------------
  // ADD / REMOVE FROM NETWORK
  // ------------------------------------

  const handleAddToNetwork = async (companyId, companyName) => {
    if (useSampleData) {
      // Only add if not already in the network
      if (!network.find((c) => c.id === companyId)) {
        setNetwork((prev) => [...prev, { id: companyId, name: companyName }]);
      }
      // Remove from search results
      setSearchResults((prev) => prev.filter((c) => c.id !== companyId));
      toast({
        title: "Company Added",
        description: `${companyName} has been added to your network.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      try {
        await addBuyerToNetwork(companyId);
        // Refresh network data
        const response = await getSellerNetwork();
        const activeNetwork = response.active_network.map(item => ({
          id: item.id,
          name: item.buyer_name,
          email: item.buyer_email
        }));
        setNetwork(activeNetwork);

        // Remove from search results
        setSearchResults((prev) => prev.filter((c) => c.id !== companyId));

        toast({
          title: "Company Added",
          description: `${companyName} has been added to your network.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add company to your network.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleRemoveFromNetwork = async (companyId, companyName) => {
    if (useSampleData) {
      setNetwork((prev) => prev.filter((m) => m.id !== companyId));
      toast({
        title: "Company Removed",
        description: `${companyName} has been removed from your network.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      try {
        await removeBuyerFromNetwork(companyId);
        // Refresh network data
        const response = await getSellerNetwork();
        const activeNetwork = response.active_network.map(item => ({
          id: item.id,
          name: item.buyer_name,
          email: item.buyer_email
        }));
        setNetwork(activeNetwork);
        
        toast({
          title: "Company Removed",
          description: `${companyName} has been removed from your network.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove company from your network.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // ------------------------------------
  // BULK UPLOAD
  // ------------------------------------
  const handleBulkUploadBuyers = async () => {
    setIsUploading(true);
    if (useSampleData) {
      setTimeout(() => {
        toast({
          title: "Buyers Added Successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setIsUploading(false);
      }, 1200);
    } else {
      try {
        const sampleBuyers = [
          { company_name: "New Buyer 1", contact_email: "buyer1@example.com" },
          { company_name: "New Buyer 2", contact_email: "buyer2@example.com" },
        ];
        const response = await uploadBuyersBulk(sampleBuyers);

        // Refresh network data
        const networkResponse = await getSellerNetwork();
        const activeNetwork = networkResponse.active_network.map((item) => ({
          id: item.id,
          name: item.buyer_name,
          email: item.buyer_email,
        }));
        setNetwork(activeNetwork);

        const invites = networkResponse.pending_invites.map((item) => ({
          contact_email: item.buyer_email,
          company_name: item.buyer_name,
          status: item.status_display,
        }));
        setPendingInvites(invites);

        toast({
          title: "Buyers Added Successfully",
          description: `${response.success.length} buyers were added to your network.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload buyers.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      setIsUploading(false);
    }
  };

  // ------------------------------------
  // HANDLE NETWORK REQUEST (pending requests)
  // ------------------------------------
  const handleNetworkRequest = async (requestId, action) => {
    if (useSampleData) {
      if (action === "approve") {
        const request = pendingRequests.find((req) => req.id === requestId);
        if (request) {
          setNetwork((prev) => [...prev, { id: requestId, name: request.buyer_company }]);
        }
        setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
        toast({
          title: "Request Approved",
          description: `${request?.buyer_company} was added to your network.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (action === "reject") {
        setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
        toast({
          title: "Request Rejected",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      try {
        await updateNetworkRequest(requestId, action);

        // Refresh network data
        const response = await getSellerNetwork();
        const activeNetwork = response.active_network.map((item) => ({
          id: item.id,
          name: item.buyer_name,
          email: item.buyer_email,
        }));
        setNetwork(activeNetwork);

        const requests = response.pending_requests.map((item) => ({
          id: item.id,
          buyer_company: item.buyer_name,
          timestamp: new Date(item.created_at).getTime(),
        }));
        setPendingRequests(requests);

        toast({
          title: action === "approve" ? "Request Approved" : "Request Rejected",
          description:
            action === "approve"
              ? "The buyer was added to your network."
              : "The request was rejected.",
          status: action === "approve" ? "success" : "info",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to ${action} the request.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // ------------------------------------
  // PAGE RENDER
  // ------------------------------------
  return (
    <Box bg={pageBg} p={6} minH="100vh">
      {/* Header & Toggle */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Manage Your Buyer Network</Heading>
        <FormControl display="flex" alignItems="center" w="auto">
          <FormLabel htmlFor="sample-data" mb="0" mr={2}>
            Use Sample Data
          </FormLabel>
          <Switch
            id="sample-data"
            isChecked={useSampleData}
            onChange={(e) => setUseSampleData(e.target.checked)}
          />
        </FormControl>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Global Loading */}
      {loading && (
        <Flex justify="center" mb={4}>
          <Spinner size="xl" />
        </Flex>
      )}

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
            isLoading={searchLoading}
            px={6}
          >
            Search
          </Button>
        </Flex>

        {/* Search Results */}
        {hasSearched && (
          <Box
            mt={6}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            p={4}
          >
            <Heading size="sm" mb={2}>
              Search Results
            </Heading>
            {searchLoading ? (
              <Spinner />
            ) : searchResults.length > 0 ? (
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
                          onClick={() =>
                            handleAddToNetwork(company.id, company.name)
                          }
                        >
                          Add to Network
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>No results found for "{searchTerm}"</Text>
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
            {/* 1) Pending Requests */}
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
                            onClick={() =>
                              handleNetworkRequest(request.id, "approve")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            colorScheme="red"
                            size="sm"
                            ml={2}
                            onClick={() =>
                              handleNetworkRequest(request.id, "reject")
                            }
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

            {/* 2) Pending Invitations */}
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

            {/* 3) Current Network */}
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
                            onClick={() =>
                              handleRemoveFromNetwork(member.id, member.name)
                            }
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

      {/* Bulk Import Button */}
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
