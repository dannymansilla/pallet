import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  useToast,
  RadioGroup,
  Stack,
  Radio,
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
    address: "",
    contactEmail: "",
    contactPhone: "",
    adminEmail: "",
    adminPassword: "",
    adminUsername: "",
    companyRole: "", // Default to buyer
    termsAccepted: false,
  });

  useEffect(() => {
    // Get the role from the query parameters and set it in the form data
    const roleFromParams = searchParams.get("role");
    if (roleFromParams) {
      setFormData((prev) => ({
        ...prev,
        companyRole: roleFromParams,
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
      navigate("/onboarding/approval-status");
    } catch (error) {
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} minH="100vh">
      <Heading mb={6} textAlign="center">
        Company Registration
      </Heading>
      <VStack as="form" onSubmit={handleSubmit} spacing={4}>
        <InputField
          label="Company Name"
          placeholder="Enter your company name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          isRequired
        />
        {/* <InputField
          label="Contact Email"
          placeholder="Enter company contact email"
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          isRequired
        /> */}
        {/* <InputField
          label="Contact Phone"
          placeholder="Enter company contact phone"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleChange}
          isRequired
        /> */}
        <InputField
          label="Email"
          placeholder="Enter admin email"
          type="email"
          name="adminEmail"
          value={formData.adminEmail}
          onChange={handleChange}
          isRequired
        />
        {/* <InputField
          label="Admin Username"
          placeholder="Enter admin username"
          name="adminUsername"
          value={formData.adminUsername}
          onChange={handleChange}
          isRequired
        /> */}
        <InputField
          label="Password"
          placeholder="Enter admin password"
          type="password"
          name="adminPassword"
          value={formData.adminPassword}
          onChange={handleChange}
          isRequired
        />
        <InputField
          label="Address"
          placeholder="Enter company address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        <RadioGroup
          onChange={handleRoleChange}
          value={formData.companyRole}
          name="companyRole"
        >
          <Stack direction="row" spacing={4} p={6}>
            <Radio value="buyer">Buyer</Radio>
            <Radio value="seller">Seller</Radio>
          </Stack>
        </RadioGroup>
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
  );
};

export default CompanyRegistration;
