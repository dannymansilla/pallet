// src/pages/LandingPage.js
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  Image,
  VStack,
  SimpleGrid,
  Input,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import cpg_photo from '../images/hero_image_warehouse.png';
import { motion } from 'framer-motion';
import SubtleBackground from '../components/SubtleBackground';

const MotionBox = motion(Box);

const LandingPage = () => {
  const [email, setEmail] = useState('');

  return (
    <Box bg="transparent" color="black">
      <Box >
      <SubtleBackground /> {/* Background Animation */}
      {/* Hero Section */}
      <Flex
        align="center"
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        minH="100vh" // ✅ Ensures hero section takes full viewport height
        px={4}
        position="relative" // ✅ Needed for Lottie to fit perfectly
        overflow="hidden" // ✅ Prevents Lottie from extending
      >
        <VStack
          px={{ base: 4, md: 10 }}
          spacing={8}
          align="start"
          maxW="600px"
          textAlign={{ base: 'center', md: 'left' }}
        >
          <Heading
            fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
            fontWeight="bold"
            color="black"
            letterSpacing="-3px"
            lineHeight="1.2"
          >
            Buy and sell excess CPG inventory
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }}>
            Our B2B auction platform allows sellers to automate the sale of excess
            consumer packaged goods inventory and buyers to bid on a variety of
            products from well-known brands across categories.
          </Text>

          <Box
            p={0}
            rounded="md"
            // shadow="sm"
            width="100%"
          >
          <Text fontSize="lg" mb={4} fontWeight="semibold">
            Join our platform today
          </Text>
          {/* Email Input */}
          <Box py={4}>
          <Input
            placeholder="youremail@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="lg"
            mb={4}
            bg="gray.100"
            _focus={{ bg: 'white', borderColor: 'teal.500' }}
          />
          </Box>
          <HStack
            spacing={6}
            align={{ base: 'center', md: 'start' }}
            justify="center"
            w="full"
          >
            <VStack spacing={2} align="center">
              <Button
                as={RouterLink}
                to={`/onboarding/register?role=buyer&email=${encodeURIComponent(
                  email
                )}`}
                colorScheme="teal"
                size="lg"
                shadow="md"
                _hover={{ bg: 'teal.400' }}
                isDisabled={!email} // Disable button if email is empty
              >
                I'm a Buyer
              </Button>
              <Text fontSize="sm" textAlign="center">
                Access exclusive auctions and bid on top CPG inventory.
              </Text>
            </VStack>
            <VStack spacing={2} align="center">
              <Button
                as={RouterLink}
                to={`/onboarding/register?role=seller&email=${encodeURIComponent(
                  email
                )}`}
                colorScheme="teal"
                size="lg"
                shadow="md"
                _hover={{ bg: 'teal.400' }}
                isDisabled={!email} // Disable button if email is empty
              >
                I'm a Seller
              </Button>
              <Text fontSize="sm" textAlign="center">
                List and sell your excess inventory with ease.
              </Text>
            </VStack>
          </HStack>
          </Box>
        </VStack>
        <Box
          flex="1"
          bg="transparent"
          rounded="lg"
          overflow="hidden"
          display="flex"
          justifyContent="center"
          alignItems="center"
          maxW="700px"
          maxH="500px"
          mt={{ base: 10, md: 0 }}
          ml={{ base: 0, md: 12 }}
        >
          <Image
            src={cpg_photo}
            alt="Pallet of CPG Goods"
            borderRadius="8px"
            width="100%"
            maxW="500px"
          />
        </Box>
      </Flex>

      </Box>


      {/* Key Features Section */}
      <Box py={16} px={0} bg="white" color="gray.800" position="relative" zIndex="1">

        <Box maxW="1200px" mx="auto" py={16} px={{ base: 4, md: 8 }}>
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
        <Box py={16} p={8} bg="brand.background_color">
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
      <Box py={16} px={8} bg="brand.background_color" textAlign="center">
        <Heading fontSize="3xl" mb={4}>
          Ready to Join?
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
