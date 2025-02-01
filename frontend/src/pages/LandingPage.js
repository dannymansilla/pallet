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
  Circle,
  Input,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import cpg_photo from '../images/hero_image_warehouse.png';
import SubtleBackground from '../components/SubtleBackground';


const LandingPage = () => {
  const [email, setEmail] = useState('');

  // Only show the subtle background on medium and larger screens.
  const showLottie = useBreakpointValue({ base: false, md: true });

  const features = [
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
    {
      title: 'Seamless Integration',
      description: 'Connect with your existing tools and workflows seamlessly.',
      icon: '🔗',
    },
    {
      title: 'Robust Security',
      description: 'Built with security in mind to protect your data and transactions.',
      icon: '🔒',
    },
  ];

  const FeatureCard = ({ icon, title, description }) => (
    <VStack
      spacing={4}
      p={6}
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      align="center"
      textAlign="center"
      transition="transform 0.3s"
      _hover={{ transform: 'translateY(-4px)' }}
    >
      <Circle size="60px" bg="teal.500" color="white">
        <Text fontSize="2xl">{icon}</Text>
      </Circle>
      <Heading as="h3" size="md" color="gray.800">
        {title}
      </Heading>
      <Text fontSize="sm" color="gray.600">
        {description}
      </Text>
    </VStack>
  );
  

  return (
    <Box bg="transparent" color="black" minW="100vw">
      {/* Background */}
      {showLottie && <SubtleBackground />}
      <Flex
      position="relative"  // This container will serve as the positioning reference
      minH="100vh"
      align="center"
      justify="center"
      overflow="hidden"
    >
      
      {/* Hero Section */}
      <Flex
        align="center"
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        minH="100vh" // Full viewport height
        px={{ base: 6, md: 16 }}
        position="relative"
        overflow="hidden"
      >
        <VStack
          spacing={8}
          align={{ base: 'center', md: 'flex-start' }}
          maxW="600px"
          textAlign={{ base: 'center', md: 'left' }}
          py={{ base: 8, md: 0 }}
        >
          <Heading
            fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
            fontWeight="bold"
            color="black"
            letterSpacing="-2px"
            lineHeight="1.2"
          >
            Automate excess inventory sales
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.700">
            Our B2B auction platform allows sellers to automate the sale of excess consumer packaged goods inventory and buyers to bid on a variety of products from well-known brands across categories.
          </Text>
          <Box width="100%">
            <Text fontSize="lg" mb={4} fontWeight="semibold">
              Join our platform today
            </Text>
            <Box mb={4}>
              <Input
                placeholder="youremail@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
                bg="gray.100"
                _focus={{ bg: 'white', borderColor: 'teal.500' }}
              />
            </Box>
            <HStack spacing={6} align="center" justify="center" w="full">
              <VStack spacing={2} align="center">
                <Button
                  as={RouterLink}
                  to={`/onboarding/register?role=buyer&email=${encodeURIComponent(email)}`}
                  colorScheme="teal"
                  size="lg"
                  shadow="md"
                  _hover={{ bg: 'teal.400' }}
                  isDisabled={!email}
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
                  to={`/onboarding/register?role=seller&email=${encodeURIComponent(email)}`}
                  colorScheme="teal"
                  size="lg"
                  shadow="md"
                  _hover={{ bg: 'teal.400' }}
                  isDisabled={!email}
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
          display="flex"
          justifyContent="center"
          alignItems="center"
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
      </Flex>
      {/* Key Features Section */}
      <Box bg="black" minH="80vh" color="white" display="flex" flexDirection="column" justifyContent="center">
        {/* Inner Container (Centers Content) */}
        <Box maxW="1200px" mx="auto" width="100%" px={{ base: 6, md: 12 }}>
          {/* Header Section */}
          <Box mb={12} alignSelf="flex-start">
            <Heading fontSize="3xl" textAlign="left">
              How It Works
            </Heading>
          </Box>
          {/* Grid of Feature Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </SimpleGrid>
        </Box>
      </Box>


      {/* Features Showcase Section */}
      <Box bg="brand.background_color" py={20} px={{ base: 6, md: 12 }}>
        <Box maxW="1200px" mx="auto" py={20} px={{ base: 4, md: 8 }}>
          <SimpleGrid columns={1} spacing={16}>
            {[
              {
                title: 'Manage Auctions Effortlessly',
                description: 'Create, monitor, and manage your auctions with intuitive dashboards that provide real-time insights into bidding activity and performance.',
                image: 'https://source.unsplash.com/600x400/?dashboard,technology',
              },
              {
                title: 'Dynamic Bidding',
                description: 'Empower buyers with an easy-to-use bidding interface that ensures a seamless experience while maximizing your sales.',
                image: 'https://source.unsplash.com/600x400/?bidding,finance',
              },
              {
                title: 'Streamlined Selling',
                description: 'List your products efficiently with streamlined workflows designed to simplify bulk CPG transactions.',
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
                <Box flex="1" textAlign={{ base: 'center', md: 'left' }}>
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
      <Box bg="brand.background_color" textAlign="center" py={16} px={{ base: 6, md: 12 }}>
        <Heading fontSize="3xl" mb={4} color="white">
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
