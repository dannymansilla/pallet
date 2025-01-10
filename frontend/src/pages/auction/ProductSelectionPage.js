import React, { useState } from "react";
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
  useColorModeValue,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "../../services/api"; // Import the search API function

const ProductSelectionPage = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchProducts(query); // Call API to search products
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectProduct = (product) => {
    navigate("/listings/create", { state: { selectedProduct: product } }); // Updated route
  };

  return (
    <Box p={6} bg={useColorModeValue("gray.50", "gray.800")} minH="100vh">
      <Heading mb={6}>Select a Product</Heading>
      <Box mb={6}>
        <Input
          placeholder="Search for a product by name or GTIN"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch} mt={4} colorScheme="blue" isDisabled={!query}>
          Search
        </Button>
      </Box>

      {loading ? (
        <Spinner />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>GTIN</Th>
              <Th>Brand</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((product) => (
              <Tr key={product.id} onClick={() => openModal(product)} _hover={{ bg: "gray.100", cursor: "pointer" }}>
                <Td>{product.name}</Td>
                <Td>{product.gtin}</Td>
                <Td>{product.brand}</Td>
                <Td>
                  <Button
                    colorScheme="teal"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering modal
                      handleSelectProduct(product);
                    }}
                  >
                    Select
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Product Details Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Product Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProduct && (
              <Box>
                <Text><strong>Name:</strong> {selectedProduct.name}</Text>
                <Text><strong>GTIN:</strong> {selectedProduct.gtin}</Text>
                <Text><strong>Brand:</strong> {selectedProduct.brand}</Text>
                <Text><strong>Description:</strong> {selectedProduct.description}</Text>
                <Text><strong>Dimensions (LxWxH):</strong> {selectedProduct.length} x {selectedProduct.width} x {selectedProduct.height}</Text>
                <Text><strong>Weight:</strong> {selectedProduct.weight} lbs</Text>
                <Text><strong>Units per Case:</strong> {selectedProduct.units_per_case}</Text>
                <Text><strong>Cases per Pallet:</strong> {selectedProduct.cases_per_pallet}</Text>
                <Text><strong>Certifications:</strong> {JSON.stringify(selectedProduct.certifications)}</Text>
                <Text><strong>Expiration Date:</strong> {new Date(selectedProduct.expiration_date).toLocaleDateString()}</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={closeModal} mr={3}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductSelectionPage;
