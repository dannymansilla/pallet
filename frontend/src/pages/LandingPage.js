// src/pages/LandingPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  Image,
  SimpleGrid,
  Circle,
  Input,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import uploadIcon from '../images/Upload_no_title.png';
import downloadIcon from '../images/Download_no_title.png';
import first_feature from '../images/first_feature.png';
import second_feature from '../images/second_feature.png';
import third_feature from '../images/third_feature.png';
import Lottie from 'lottie-react'; // Import the Lottie component
import globeAnimation from '../assets/aiden_globe.json'; // Update with your Lottie JSON file name
import aidenlogo from "../images/aiden_logo.png";
import upload_icon from "../images/upload_icon.png";
import download_icon from "../images/download_icon.png";
import posthog from 'posthog-js';
// import SubtleBackground from '../components/SubtleBackground';

const LandingPage = () => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get("utm_source");
    const utm_medium = urlParams.get("utm_medium");
    const utm_campaign = urlParams.get("utm_campaign");
    const utm_content = urlParams.get("utm_content");
    const utm_term = urlParams.get("utm_term");
    const utm_email = urlParams.get("utm_email"); // Custom UTM parameter

    // Track UTM parameters in PostHog
    posthog.capture("utm_tracking", {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      utm_email, // Custom parameter
    });

    // Identify user in PostHog if `utm_email` is present
    if (utm_email) {
      posthog.identify(utm_email, { email: utm_email });
    }

    // Remove UTM parameters from URL (Optional)
    const url = new URL(window.location.href);
    url.searchParams.delete("utm_source");
    url.searchParams.delete("utm_medium");
    url.searchParams.delete("utm_campaign");
    url.searchParams.delete("utm_content");
    url.searchParams.delete("utm_term");
    url.searchParams.delete("utm_email");
    window.history.replaceState({}, document.title, url.pathname);
  }, []);

  // Only show the subtle background on medium and larger screens.
  // const showLottie = useBreakpointValue({ base: false, md: true });

  const features = [
    {
      title: '1. You upload UPCs',
      icon: upload_icon,
    },
    {
      title: '2. Pulls in product info',
      icon: aidenlogo,
    },
    {
      title: '3. Creates listings',
      icon: aidenlogo,
    },
    {
      title: '4. Contacts customers',
      icon: aidenlogo,
    },
    {
      title: '5. Collects bids',
      icon: aidenlogo,
    },
    {
      title: '6. Builds trucks',
      icon: aidenlogo,
    },
    {
      title: '7. Generates POs',
      icon: aidenlogo,
    },
    {
      title: '8. You receive POs',
      icon: download_icon,
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
      <Circle size="60px" bg="transparent" color="white" display="flex" justifyContent="center" alignItems="center">
        <Image src={icon} alt={title} boxSize="60px" objectFit="contain" /> 
    </Circle>
      <Heading as="h3" size="md" color="gray.800">
        {title}
      </Heading>
    </VStack>
  );

  const AnimatedLogoOverlay = () => {
    return (
      <Box position="relative" width="100%" maxW="550px" maxH="550px">
        {/* Lottie Animation */}
        <Box zIndex={1}
        maxW="500px" maxH="500px">
          <Lottie
            animationData={globeAnimation}
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </Box>
  
        {/* SVG overlay for arrows/dotted lines */}
        <Box
          position="absolute"
          top="-5%"
          left="-5%"
          width="110%"
          height="110%"
          zIndex={2}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 500 500"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="black" />
              </marker>
            </defs>
            {/* Arrow path from top-left to bottom-right */}
            <path
            d="M 425,75 A 140,140 0 0 1 75,425"
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeDasharray="10"
            markerEnd="url(#arrowhead)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="100"
              to="0"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
            {/* Reverse arrow path */}
            <path
            d="M 75,425 A 140,140 0 0 1 425,75"
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeDasharray="10"
            markerEnd="url(#arrowhead)"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="100"
              to="0"
              dur="3s"
              repeatCount="indefinite"
              begin="1.5s"
            />
          </path>
          </svg>
        </Box>
  
        {/* Upload Icon (top left) */}
        <Image
          src={uploadIcon}
          alt="Upload Inventory"
          position="absolute"
          top="-15%"
          left="-15%"
          width={{ base: '350px', md: '350px' }} // Responsive sizes
          height="auto"
          zIndex={3} // Ensures this PNG is on top of the SVG
        />
  
        {/* Download Icon (bottom right) */}
        <Image
          src={downloadIcon}
          alt="Download Invoice"
          position="absolute"
          bottom="-15%"
          right="-15%"
          width={{ base: '350px', md: '350px' }} // Responsive sizes
          height="auto"
          zIndex={3} // Ensures this PNG is on top of the SVG
        />
      </Box>
    );
  };
  
  

  return (
    <Box bg="transparent" color="black" minW="100vw">
      {/* Background */}
      {/* {showLottie && <SubtleBackground />} */}
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
          py={{ base: 10, md: 0 }}
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
            Aiden is the only excess inventory solution that maximizes sales volume, price and speed — while reducing manual work by 90%.
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
                  Talk to Sales
                </Button>
              </Flex>
            </Box>
          </VStack>
          {/* Replace the Image with the Lottie Animation */}
          <Box
            flex="1"
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={{ base: 10, md: 0 }}
            ml={{ base: 0, md: 12 }}
          >
            <AnimatedLogoOverlay />
            {/* <Lottie
              animationData={globeAnimation}
              loop={true}
              style={{ width: '100%', maxWidth: '500px' }}
            /> */}
          </Box>
        </Flex>
      </Flex>

      {/* Key Features Section */}
      <Box bg="black" minH="80vh" color="white" display="flex" flexDirection="column" justifyContent="center">
        <Box maxW="1200px" mx="auto" width="100%" px={{ base: 10, md: 12 }} py={{ base: 10, md: 0 }}>
          <Box mb={12} alignSelf="flex-start">
            <Heading fontSize="3xl" textAlign="left">
              How It Works
            </Heading>
          </Box>
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
                image: first_feature,
              },
              {
                title: 'Maximize sales volume, price, and speed',
                description: 'Marketplace solutions require manual work and force you to choose between sales volume, price and speed. Aiden maximizes sales volume, price and speed while reducing manual work by over 90%.',
                image: second_feature,
              },
              {
                title: 'Improve margins by up to 1%',
                description: 'By maximizing sales volume, price and speed, Aiden cuts your carrying costs, reduces waste and increases revenue - resulting in a margin improvement of up to 1%. Let Aiden automatically save you millions.',
                image: third_feature,
              },
            ].map((feature, index) => (
              <Flex
                key={index}
                direction={{ base: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' }}
                align="center"
                spacing={8}
                p={{ base: 6, md: 5 }}
              >
                <Box
                  flex="1"
                  bg="white"
                  rounded="lg"
                  // shadow="lg"
                  overflow="hidden"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  mr={{ md: index % 2 === 0 ? 12 : 0 }}
                  ml={{ md: index % 2 !== 0 ? 12 : 0 }}
                  mb={{ base: 6, md: 0 }}
                  p={{ base: 6, md: 5 }}
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
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
      <Box bg="brand.background_color" textAlign="center" py={4} px={{ base: 6, md: 12 }}>
        <Heading fontSize="3xl" mb={4} color="black">
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
          Talk to Sales
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
