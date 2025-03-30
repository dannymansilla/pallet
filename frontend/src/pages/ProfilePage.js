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
  Badge,
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
          <Avatar 
            size="lg" 
            name={profile.email} 
            src={profile.avatar_url} 
          />
          <VStack align="start" ml={4}>
            <Heading as="h2" size="md">
              {profile.email}
            </Heading>
            <Badge colorScheme="blue">{profile.role}</Badge>
          </VStack>
        </Flex>

        <Divider my={4} />

        {profile.organization ? (
          <>
            <Heading as="h3" size="sm" mb={4}>
              Organization Details
            </Heading>
            <Box>
              <Text fontWeight="bold">Name:</Text>
              <Text mb={2}>{profile.organization.name}</Text>

              <Text fontWeight="bold">Type:</Text>
              <Flex gap={2} mb={2}>
                {profile.organization.is_buyer && (
                  <Badge colorScheme="green">Buyer</Badge>
                )}
                {profile.organization.is_seller && (
                  <Badge colorScheme="purple">Seller</Badge>
                )}
              </Flex>

              <Text fontWeight="bold">Status:</Text>
              <Badge
                mb={2}
                colorScheme={
                  profile.organization.approval_status === "pending"
                    ? "yellow"
                    : "green"
                }
              >
                {profile.organization.approval_status.charAt(0).toUpperCase() +
                  profile.organization.approval_status.slice(1)}
              </Badge>

              {profile.organization.approval_status === "pending" && (
                <Alert status="warning" mt={4}>
                  <AlertIcon />
                  Your organization is awaiting approval. You'll have full access once approved.
                </Alert>
              )}
            </Box>
          </>
        ) : (
          <Alert status="info" mt={4}>
            <AlertIcon />
            No organization information associated with your account.
          </Alert>
        )}
      </Box>
    </Flex>
  );
};

export default ProfilePage;
