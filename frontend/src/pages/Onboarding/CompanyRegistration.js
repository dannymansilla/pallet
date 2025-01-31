import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  useToast,
  RadioGroup,
  Stack,
  Radio,
  Text,
  Flex,
} from "@chakra-ui/react";
import { InputField, CheckboxField, PrimaryButton } from "../../components/Form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registerCompany } from "../../services/api";

const CompanyRegistration = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  

  const [formData, setFormData] = useState({
    companyName: "",
    adminEmail: "",
    adminPassword: "",
    companyRole: "", // Default to buyer
    termsAccepted: false,
  });

  useEffect(() => {
    // Get the role from the query parameters and set it in the form data
    const roleFromParams = searchParams.get("role");
    const emailFromParams = searchParams.get("email");
    if (roleFromParams) {
      setFormData((prev) => ({
        ...prev,
        companyRole: roleFromParams || "",
        adminEmail: emailFromParams || "",
      }));
    }
  }, [searchParams]);

  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      companyRole: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.companyName || !formData.adminEmail || !formData.adminPassword) {
      toast({
        title: "Error",
        description: "All fields are required.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    // Ensure role is selected
    if (!formData.companyRole) {
      toast({
        title: "Error",
        description: "Please select a role (Buyer or Seller).",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }
  
    if (!formData.termsAccepted) {
      toast({
        title: "Error",
        description: "You must accept the Terms of Service.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await registerCompany(formData);
      toast({
        title: "Success",
        description: "Registration successful! Awaiting approval.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Registration failed. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg="brand.background_color" p={8} minH="80vh">
      <Flex direction="column" maxW="800px" mx="auto" p={6} bg="white" borderRadius="md" >
    <Box maxW="md" mx="auto" mt={10}>
      <Heading mb={6}>
        Company Registration
      </Heading>
      <VStack as="form" onSubmit={handleSubmit} spacing={4} borderRadius="md">
        <InputField
          label="Company Name"
          placeholder="company name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          isRequired
        />
        <InputField
          label="Email"
          placeholder="email"
          type="email"
          name="adminEmail"
          value={formData.adminEmail}
          onChange={handleChange}
          isRequired
        />
        <InputField
          label="Password"
          placeholder="password"
          type="password"
          name="adminPassword"
          value={formData.adminPassword}
          onChange={handleChange}
          isRequired
        />
          {/* Role Selection Cards */}
  <Heading fontSize="lg" textAlign="left" mt={4}>
    Select Your Role
  </Heading>
  <Flex justify="space-between" direction={{ base: "column", md: "row" }} gap={4}>
    <Box
      as="button"
      onClick={() => handleRoleChange("buyer")}
      borderWidth="2px"
      borderColor={formData.companyRole === "buyer" ? "teal.500" : "gray.200"}
      bg={formData.companyRole === "buyer" ? "teal.50" : "white"}
      p={6}
      rounded="md"
      shadow="sm"
      textAlign="center"
      _hover={{ bg: "teal.100", borderColor: "teal.500" }}
    >
      <Heading fontSize="md" color="teal.700">
        Buyer
      </Heading>
    </Box>
        <Box
          as="button"
          onClick={() => handleRoleChange("seller")}
          borderWidth="2px"
          borderColor={formData.companyRole === "seller" ? "teal.500" : "gray.200"}
          bg={formData.companyRole === "seller" ? "teal.50" : "white"}
          p={6}
          rounded="md"
          shadow="sm"
          textAlign="center"
          _hover={{ bg: "teal.100", borderColor: "teal.500" }}
        >
          <Heading fontSize="md" color="teal.700">
            Seller
          </Heading>
        </Box>
      </Flex>
        <CheckboxField
          label={
            <>
              I accept the{" "}
              <a
                href="/onboarding/accept-terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "teal", textDecoration: "underline" }}
              >
                Terms of Service
              </a>
            </>
          }
          isChecked={formData.termsAccepted}
          onChange={handleChange}
          name="termsAccepted"
        />
        <PrimaryButton label="Register" type="submit" isLoading={isSubmitting} />
      </VStack>
    </Box>
    </Flex>
    </Box>
  );
};

export default CompanyRegistration;
