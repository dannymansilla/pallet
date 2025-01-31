import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Spinner,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { getCurrentListings, getQueuedListings, deleteListing, updateListing } from "../../services/api";

const ManageListingsPage = () => {
  const [currentListings, setCurrentListings] = useState([]);
  const [queuedListings, setQueuedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null); // State for selected listing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const [updatedData, setUpdatedData] = useState({});
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const [currentResponse, queuedResponse] = await Promise.all([
        getCurrentListings(),
        getQueuedListings(),
      ]);
      setCurrentListings(currentResponse.data);
      setQueuedListings(queuedResponse.data);
    } catch (error) {
      toast({
        title: "Error fetching listings",
        description: "Failed to load listings. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    try {
      await deleteListing(listingId);
      toast({
        title: "Listing Deleted",
        description: "The listing has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchListings(); // Refresh listings
      setIsModalOpen(false); // Close modal if open
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the listing. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditChange = (field, value) => {
    setUpdatedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      await updateListing(selectedListing.id, updatedData);
      toast({
        title: "Success",
        description: "Listing updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchListings(); // Refresh listings
      setIsEditing(false);
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the listing. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openModal = (listing) => {
    setSelectedListing(listing);
    setUpdatedData({
      quantity_available: listing.quantity_available,
      minimum_selling_price: listing.minimum_selling_price,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedListing(null);
    setIsModalOpen(false);
    setIsEditing(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  const renderTable = (listings) => (
    <Table variant="simple" bg={cardBg} shadow="md" borderRadius="lg">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Quantity</Th>
          <Th>Minimum Price</Th>
          <Th>Auction Cycle</Th>
        </Tr>
      </Thead>
      <Tbody>
        {listings.length > 0 ? (
          listings.map((listing) => (
            <Tr
              key={listing.id}
              onClick={() => openModal(listing)}
              _hover={{ cursor: "pointer", bg: "gray.100" }}
            >
              <Td>{listing.product?.name || listing.name || "N/A"}</Td>
              <Td>{listing.quantity_available}</Td>
              <Td>${listing.minimum_selling_price}</Td>
              <Td>
                {listing.auction_cycle
                  ? `${listing.auction_cycle.start_date} - ${listing.auction_cycle.end_date}`
                  : `current cycle: ${listing.time_remaining} days remaining`}
              </Td>
            </Tr>
          ))
        ) : (
          <Tr>
            <Td colSpan="4" textAlign="center">
              <Text>No listings found.</Text>
            </Td>
          </Tr>
        )}
      </Tbody>
    </Table>
  );

  return (
    <Box bg={bgColor} minH="100vh" py={6}>
      <Heading mb={6} color={textColor}>
        Manage Listings
      </Heading>

      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList>
          <Tab>Current Listings</Tab>
          <Tab>Queued Listings</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {renderTable(currentListings)}
          </TabPanel>
          <TabPanel>
            {renderTable(queuedListings)}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Listing Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!isEditing ? (
              selectedListing && (
                <Box>
                  <Text>
                    <strong>Name:</strong> {selectedListing.product?.name || "N/A"}
                  </Text>
                  <Text>
                    <strong>Quantity:</strong> {selectedListing.quantity_available}
                  </Text>
                  <Text>
                    <strong>Minimum Price:</strong> ${selectedListing.minimum_selling_price}
                  </Text>
                </Box>
              )
            ) : (
              <Box>
                <FormControl>
                  <FormLabel>Quantity Available</FormLabel>
                  <Input
                    type="number"
                    value={updatedData.quantity_available}
                    onChange={(e) =>
                      handleEditChange("quantity_available", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Minimum Selling Price</FormLabel>
                  <Input
                    type="number"
                    value={updatedData.minimum_selling_price}
                    onChange={(e) =>
                      handleEditChange("minimum_selling_price", e.target.value)
                    }
                  />
                </FormControl>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            {!isEditing ? (
              <>
                <Button colorScheme="blue" mr={3} onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button colorScheme="red" onClick={() => handleDelete(selectedListing.id)}>
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
                  Save
                </Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ManageListingsPage;
