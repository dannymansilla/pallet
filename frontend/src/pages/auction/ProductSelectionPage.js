import React, { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  SimpleGrid,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "../../services/api";

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
      const response = await searchProducts(query);
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
    navigate("/listings/create", { state: { selectedProduct: product } });
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  return (
    <Box bg={bgColor} py={6} minH="100vh" w="100%">
      {/* Page Content Wrapper */}
      <Flex mx="auto" direction="column" w="100%">
        {/* Page Title */}
        <Heading mb={4} color={textColor} textAlign="left">
          Select a Product
        </Heading>

        {/* Search Section */}
        <Flex mb={6} gap={4} align="center" w="100%">
          <Input
            placeholder="Search for a product by name or GTIN"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            flex="1"
            maxW="1400px"
          />
          <Button
            onClick={handleSearch}
            colorScheme="blue"
            isDisabled={!query}
            px={6}
          >
            Search
          </Button>
        </Flex>

        {/* Product Grid Area */}
        <Box minH="300px" w="100%">
          {loading ? (
            <Spinner mx="auto" display="block" size="xl" />
          ) : products.length > 0 ? (
            <SimpleGrid columns={[1, 2, 3]} spacing={6}>
              {products.map((product) => (
                <Box
                  key={product.id}
                  p={4}
                  bg={"white"}
                  borderRadius="md"
                  shadow="md"
                  _hover={{ shadow: "lg", bg: "gray.200" }}
                  onClick={() => openModal(product)}
                >
                  <Heading size="md" mb={2} color={textColor}>
                    {product.name}
                  </Heading>
                  <Text><strong>GTIN:</strong> {product.gtin}</Text>
                  <Text><strong>Brand:</strong> {product.brand}</Text>
                  <Button
                    mt={4}
                    colorScheme="teal"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering the modal
                      handleSelectProduct(product);
                    }}
                  >
                    Select
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <VStack spacing={4} align="center" textAlign="center" minH="300px" w="100%">
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Use the search bar above to find a product. Search results will appear here.
              </Text>
            </VStack>
          )}
        </Box>
      </Flex>

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
