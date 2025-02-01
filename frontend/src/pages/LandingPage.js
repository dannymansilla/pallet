// src/pages/LandingPage.js
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
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
      title: 'Instant Product Sync',
      description: 'Upload UPCs or sync directly with your inventory system. Aiden automatically enriches product data.',
      icon: '📥',
    },
    {
      title: 'Automated Buyer Matching',
      description: 'AI-driven recommendations instantly match your inventory with the highest-value buyers.',
      icon: '🤖',
    },
    {
      title: 'Smart Pricing Optimization',
      description: 'Dynamic pricing adjusts in real-time to maximize your revenue while moving inventory fast.',
      icon: '💰',
    },
    {
      title: 'One-Click Order Processing',
      description: 'Receive purchase orders, generate invoices, and finalize deals with zero manual effort.',
      icon: '✅',
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
      minH="95vh"
      align="center"
      justify="center"
      overflow="hidden"
    >
      
      {/* Hero Section */}
      <Flex
        align="center"
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        minH="95vh" // Full viewport height
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
            Aiden is the only excess inventory solution that maximizing sales volume, price, and speed - while reducing manual work by over 90%. Simply upload your UPCs and let Aiden improve your margins by up to 1.0%
          </Text>
          <Box width="100%">
            <Flex
              as="form"
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="center"
            >
              <Input
                placeholder="youremail@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
                fontSize="lg"
                h="60px"
                bg="white"
                p={4}
                border="2px solid" 
                borderColor="gray.400" 
                borderRadius="md"
                _hover={{ borderColor: "gray.500" }}
                _focus={{ bg: "white", borderColor: "teal.500", borderWidth: "2px" }}
                flex="1"
              />
              <Button
                as={RouterLink}
                to={`/requestdemo?email=${encodeURIComponent(email)}`}
                colorScheme="teal"
                size="lg"
                shadow="md"
                _hover={{ bg: "teal.400" }}
                mt={{ base: 4, md: 0 }}
                ml={{ md: 4 }}
              >
                Request a Demo
              </Button>
            </Flex>
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
                title: 'Reduce manual work by 90%',
                description: 'Aiden pulls in product data, creates listings, contacts customers, collects bids, calculates the best sales for revenue, and generates transaction documents. Just upload your UPCs and wait to receive a purchase order.',
                image: 'https://source.unsplash.com/600x400/?dashboard,technology',
              },
              {
                title: 'Maximize sales volume, price, and speed',
                description: 'Marketplace solutions require manual work and force you to choose between sales volume, price and speed. Aiden maximizes sales volume, price and speed while reducing manual work by over 90%.',
                image: 'https://source.unsplash.com/600x400/?bidding,finance',
              },
              {
                title: 'Waste less and improve margines by up to 1%',
                description: 'By maximizing sales volume, price and speed, Aiden cuts your carrying costs, reduces waste and increases revenue - resulting in a margin improvement of up to 1%. Let Aiden automatically save you millions.',
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
          to="/requestdemo"
          colorScheme="blue"
          size="lg"
          shadow="lg"
          _hover={{ bg: 'blue.300' }}
        >
          Request Demo
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
