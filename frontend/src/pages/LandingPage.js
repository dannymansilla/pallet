// src/pages/LandingPage.js
import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const LandingPage = () => {
  return (
    <Box bgGradient="linear(to-r, blue.600, teal.500)" color="white" minH="100vh" p={8}>
      {/* Hero Section */}
      <Flex
        align="center"
        justify="center"
        direction={{ base: 'column', md: 'row' }}
        py={16}
        px={8}
        >
        <VStack spacing={6} align="start" maxW="600px">
            <Heading fontSize={{ base: '2xl', md: '4xl' }} fontWeight="bold">
            Revolutionizing the Bulk CPG Marketplace
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }}>
            Empowering sellers and buyers with streamlined auctions and real-time analytics.
            </Text>
            <Button
            as={RouterLink}
            to="/signup"
            colorScheme="teal"
            size="lg"
            shadow="lg"
            _hover={{ bg: 'teal.300' }}
            >
            Get Started
            </Button>
        </VStack>
        <Box
            flex="1"
            bg="gray.200"
            rounded="lg"
            shadow="lg"
            overflow="hidden"
            display="flex"
            justifyContent="center"
            alignItems="center"
            maxW="600px"
            maxH="400px"
            mt={{ base: 8, md: 0 }}
        >
            <Image
            src="https://source.unsplash.com/800x600/?warehouse,logistics"
            alt="Warehouse"
            objectFit="cover"
            width="100%"
            height="100%"
            />
        </Box>
        </Flex>



      {/* Key Features Section */}
      <Box py={16} px={8} bg="white" color="gray.800">
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
          <Heading textAlign="left" fontSize="3xl" mb={8}>
            Key Features
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {[
              {
                title: 'Effortless Auctions',
                description: 'Dynamic bidding functionality designed for bulk transactions.',
                icon: '🚀',
              },
              {
                title: 'Real-Time Insights',
                description: 'Analytics that empower decision-making for buyers and sellers.',
                icon: '📊',
              },
            ].map((feature, index) => (
              <MotionBox
                key={index}
                p={8}
                shadow="md"
                rounded="lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                bg="gray.50"
              >
                <Flex align="center" mb={4}>
                  <Box fontSize="3xl" mr={4}>
                    {feature.icon}
                  </Box>
                  <Heading fontSize="xl">{feature.title}</Heading>
                </Flex>
                <Text>{feature.description}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

        {/* Features Showcase Section */}
        <Box py={16} px={8} bg="gray.100">
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={16}>
            {[
                {
                title: 'Manage Auctions Effortlessly',
                description:
                    'Create, monitor, and manage your auctions with intuitive dashboards that provide real-time insights into bidding activity and performance.',
                image: 'https://source.unsplash.com/600x400/?dashboard,technology',
                },
                {
                title: 'Dynamic Bidding',
                description:
                    'Empower buyers with an easy-to-use bidding interface that ensures a seamless experience while maximizing your sales.',
                image: 'https://source.unsplash.com/600x400/?bidding,finance',
                },
                {
                title: 'Streamlined Selling',
                description:
                    'List your products efficiently with streamlined workflows designed to simplify bulk CPG transactions.',
                image: 'https://source.unsplash.com/600x400/?selling,warehouse',
                },
            ].map((feature, index) => (
                <Flex
                key={index}
                direction={{ base: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' }}
                align="center"
                spacing={8}
                >
                <Box
                    flex="1"
                    bg="gray.200"
                    rounded="lg"
                    shadow="lg"
                    overflow="hidden"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    mr={{ md: index % 2 === 0 ? 12 : 0 }}
                    ml={{ md: index % 2 !== 0 ? 12 : 0 }}
                    mb={{ base: 6, md: 0 }}
                >
                    <Image
                    src={feature.image}
                    alt={feature.title}
                    objectFit="cover"
                    width="100%"
                    height="auto"
                    />
                </Box>
                <Box flex="1" textAlign="left">
                    <Heading fontSize={{ base: '2xl', md: '3xl' }} mb={6} color="black">
                    {feature.title}
                    </Heading>
                    <Text fontSize={{ base: 'lg', md: 'xl' }} color="black">
                    {feature.description}
                    </Text>
                </Box>
                </Flex>
            ))}
            </SimpleGrid>
        </Box>
        </Box>




      {/* Call-to-Action Section */}
      <Box py={16} px={8} bgGradient="linear(to-r, teal.500, blue.600)" textAlign="center">
        <Heading fontSize="3xl" mb={4}>
          Ready to Join Pallet?
        </Heading>
        <Button
          as={RouterLink}
          to="/signup"
          colorScheme="blue"
          size="lg"
          shadow="lg"
          _hover={{ bg: 'blue.300' }}
        >
          Create an Account
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
