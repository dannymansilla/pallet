// src/pages/LandingPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  Container,
  Image,
  SimpleGrid,
  Input,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import uploadIcon from '../images/upload_customers.png';
import downloadIcon from '../images/Download_no_title.png';
import first_feature from '../images/first_feature.png';
import second_feature from '../images/second_feature.png';
import third_feature from '../images/third_feature.png';
import Lottie from 'lottie-react'; // Import the Lottie component
import globeAnimation from '../assets/aiden_globe.json'; // Update with your Lottie JSON file name
// import aidenlogo from "../images/aiden_logo.png";
import upload_icon from "../images/upload_icon.png";
import pulls_product_data from "../images/pallet.png";
import download_icon from "../images/download_icon.png";
import barcode_listings from "../images/barcode_listings.png";
import collects_bids from "../images/collects_bids.png";
import build_trucks from "../images/build_trucks.png";
import posthog from 'posthog-js';

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
      title: 'Upload Customers',
      description: 'Quickly import your customer data.',
      icon: upload_icon,
    },
    {
      title: 'Pull Product Data',
      description: 'Automatically fetch inventory.',
      icon: pulls_product_data,
    },
    {
      title: 'Generate Listings',
      description: 'Listings automatically created.',
      icon: barcode_listings,
    },
    {
      title: 'Collect Bids',
      description: 'Seamlessly gather bids from interested buyers.',
      icon: collects_bids,
    },
    {
      title: 'Build Trucks',
      description: 'Efficiently organize orders to optimize revenue.',
      icon: build_trucks,
    },
    {
      title: 'Download Purchase Orders',
      description: 'Generate and manage POs directly within Aiden.',
      icon: download_icon,
    },
  ];

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
          zIndex={10} // Ensures this PNG is on top of the SVG
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
          zIndex={10} // Ensures this PNG is on top of the SVG
        />
      </Box>
    );
  };
  
  

  return (
    <Box bg="transparent" color="black" minW="100vw">
      {/* Background */}
      <Flex
        position="relative"  // This container will serve as the positioning reference
        minH="95vh"
        align="center"
        justify="center"
        overflow="hidden"
      >
        {/* <SubtleBackground /> */}
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
              fontWeight="extrabold"
              color="black"
              letterSpacing="-2px"
              lineHeight="1.2"
            >
              Automate excess inventory sales
            </Heading>

            <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.700">
              Aiden is the only excess inventory solution that maximizes sales volume, price, and speed — while reducing manual work by 90%.
            </Text>

            <Box width="100%" px={{ base: "10", md: "0" }}> 
              <Flex
                as="form"
                direction="row"
                align="center"
                justify="space-between"
                maxW="500px"
                border="2px solid"
                borderColor="gray.400"
                borderRadius="md"
                shadow="xl"
                bg="white"
                p={1}
              >
                <Input
                  placeholder="youremail@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  fontSize="lg"
                  h="60px"
                  bg="transparent"
                  border="none"
                  borderRadius="none"
                  _hover={{ border: "none" }}
                  _focus={{ outline: "none", boxShadow: "none" }}
                  flex="1"
                />

                <Button
                  as={RouterLink}
                  to={`/requestdemo?email=${encodeURIComponent(email)}`}
                  colorScheme="teal"
                  size="lg"
                  h="54px"
                  px={6}
                  borderRadius="md"
                  variant="logo_accent"
                  shadow="sm"
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
      <Box py={20} bg="gray.50">
      <Flex direction="column" align="center">
        <Box mb={12}>
          <Heading size="2xl" textAlign="center" mb={2}>
            How Aiden Works
          </Heading>
          <Text color="gray.600" textAlign="center">Your workflow simplified into a seamless process.</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {features.map((step, index) => (
            <Flex key={index} direction="column" align="center" textAlign="center">
              <Box
                bg="white"
                color="white"
                w={16}
                h={16}
                m={4}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="md"
              >
                <Image src={step.icon} boxSize={8} />
              </Box>
              <Heading size="md" my={2}>
                {step.title}
              </Heading>
              <Text color="gray.600">{step.description}</Text>
            </Flex>
          ))}
        </SimpleGrid>
        </Flex>
    </Box>

    {/* <Box>
      <TruckAnimation />
    </Box> */}

      {/* Features Showcase Section */}
      <Box bg="brand.background" py={20} px={{ base: 6, md: 12 }}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            {[
              {
                title: 'Reduce Manual Work by 90%',
                description: 'Aiden handles everything from product data and listings to customer interactions, bids, and purchase orders. Simply upload UPCs, and Aiden does the rest.',
                image: first_feature,
              },
              {
                title: 'Maximize Sales Volume, Price & Speed',
                description: 'Forget the trade-offs. Aiden uses smart automation to maximize your sales metrics, achieving better outcomes with minimal manual effort.',
                image: second_feature,
              },
              {
                title: 'Improve Margins by up to 1%',
                description: 'Lower carrying costs and reduced waste translate into higher revenue and margins. Let Aiden drive efficiency and profitability automatically.',
                image: third_feature,
              },
            ].map((feature, index) => (
              <Flex
                key={index}
                direction={{ base: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' }}
                align="center"
                bg="white"
                boxShadow="md"
                borderRadius="xl"
                overflow="hidden"
                p={8}
                w="100%"
              >
                <Box flex="1" p={4}>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    borderRadius="lg"
                    objectFit="cover"
                    boxShadow="none"
                  />
                </Box>
                <Box flex="1" p={4} textAlign={{ base: 'center', md: 'left' }}>
                  <Heading fontSize={{ base: '2xl', md: '3xl' }} mb={4}>
                    {feature.title}
                  </Heading>
                  <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
                    {feature.description}
                  </Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </Container>
      </Box>

      {/* Call-to-Action Section */}
      <Box bg="white" py={20} textAlign="center" px={{ base: 6, md: 12 }}>
        <Heading fontSize="3xl" m={4} color="black">
          Ready to Join?
        </Heading>
        <Button
          as={RouterLink}
          to="/requestdemo"
          colorScheme="blue"
          size="lg"
          shadow="lg"
          // _hover={{ bg: 'blue.300' }}
          variant={'logo_accent'}
        >
          Talk to Sales
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
