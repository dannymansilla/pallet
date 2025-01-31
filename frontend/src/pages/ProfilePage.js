import React, { useEffect, useState } from "react";
import { getProfile } from "../services/api";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Avatar,
  VStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Call useColorModeValue unconditionally
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const pendingStatusColor = "yellow.500";
  const approvedStatusColor = "green.500";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
      } catch (err) {
        setError("Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg={bgColor}>
        <Text color="red.500" fontSize="lg">
          {error}
        </Text>
      </Flex>
    );
  }

  const { user, company } = profile;

  return (
    <Flex
      direction="column"
      align="center"
      p={6}
      bg={bgColor}
      minH="100vh"
    >
      <Box
        bg={cardBgColor}
        p={8}
        shadow="lg"
        borderRadius="lg"
        w="100%"
        maxW="600px"
      >
        <Flex align="center" mb={6}>
          <Avatar size="lg" name={user.username} />
          <VStack align="start" ml={4}>
            <Heading as="h2" size="md">
              {user.username}
            </Heading>
            <Text color="gray.500">{user.email}</Text>
          </VStack>
        </Flex>

        <Divider my={4} />

        {company ? (
          <>
            <Heading as="h3" size="sm" mb={2}>
              Company Details
            </Heading>
            <Box>
              <Text fontWeight="bold">Name:</Text>
              <Text mb={2}>{company.name}</Text>

              <Text fontWeight="bold">Status:</Text>
              <Text
                mb={2}
                color={
                  company.status === "pending" ? pendingStatusColor : approvedStatusColor
                }
              >
                {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
              </Text>

              {company.status === "pending" && (
                <Alert status="warning" mt={4}>
                  <AlertIcon />
                  Your company is awaiting approval. Access will be granted once approved.
                </Alert>
              )}
            </Box>
          </>
        ) : (
          <Alert status="info" mt={4}>
            <AlertIcon />
            No company information associated with your account.
          </Alert>
        )}
      </Box>
    </Flex>
  );
};

export default ProfilePage;
