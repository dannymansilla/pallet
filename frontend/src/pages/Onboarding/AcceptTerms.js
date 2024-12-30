import { useState } from "react";
import { Box, VStack, Heading, Text, Button, useToast } from "@chakra-ui/react";
import { acceptTerms } from "../../services/api";
import { useNavigate } from "react-router-dom";

const AcceptTerms = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await acceptTerms();
      toast({
        title: "Success",
        description: "Terms of Service accepted successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept Terms of Service. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10}>
      <Heading mb={6} textAlign="center">
        Terms of Service
      </Heading>
      <VStack spacing={4}>
        <Text>
          By accepting these terms, you agree to comply with our platform’s
          rules, including but not limited to fair trading practices,
          confidentiality, and adherence to applicable laws.
        </Text>
        <Button
          colorScheme="blue"
          isLoading={isSubmitting}
          onClick={handleAccept}
        >
          Accept Terms of Service
        </Button>
      </VStack>
    </Box>
  );
};

export default AcceptTerms;
