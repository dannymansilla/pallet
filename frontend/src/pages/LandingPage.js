// src/pages/LandingPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
  Input,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import Lottie from 'lottie-react'; // Import the Lottie component
import globeAnimation from '../assets/aiden_globe.json'; // Update with your Lottie JSON file name
// import aidenlogo from "../images/aiden_logo.png";
import posthog from 'posthog-js';
import TimelineSection from '../components/TimelineSection';
import { CheckIcon } from '@chakra-ui/icons';
import BuiltForScaleSection from '../components/BuiltForScaleSection';
import BottomCTA from '../components/BottomCTA';
import BuiltForGrowthSection from '../components/BuiltForGrowthSection';

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


  const AnimatedLogoOverlay = () => {
    return (
      <Box position="relative" width="100%" maxW="650px" maxH="650px">
        {/* Lottie Animation */}
        <Box zIndex={1}
        maxW="550px" maxH="550px">
          <Lottie
            animationData={globeAnimation}
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </Box>
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
          direction={{ base: "column", md: "row" }}
          minH="95vh" // Full viewport height
          px={{ base: 6, md: 0 }}
          py={{ base: 10, md: 0 }}
          position="relative"
          overflow="hidden"
        >
          <VStack
            spacing={8}
            align={{ base: 'center', md: 'flex-start' }}
            maxW="850px"
            textAlign={{ base: 'left', md: 'left' }}
            p={{ base: 8, md: 10 }}
          >
            {/* Title */}
            <Heading
              fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
              fontWeight="extrabold"
              color="black"
              letterSpacing="-2px"
              lineHeight="1.2"
            >
              Automate your excess inventory sales
            </Heading>

            {/* Subtitle */}
            <Text maxW="650px" fontSize={{ base: 'md', md: 'lg' }} color="gray.700">
              Aiden is the only excess inventory solution that maximizes sales volume,
              price, and speed — while reducing manual work by 90%.
            </Text>

            {/* Desktop Form & Mobile Button */}
            <Box width="100%" px={{ base: 10, md: 0 }}>
              {/* Desktop-Only Form */}
              <Box display={{ base: 'none', md: 'block' }}>
                <Flex
                  as="form"
                  direction="row"
                  align="center"
                  justify="space-between"
                  maxW="600px"
                  border="1px solid"
                  borderColor="gray.400"
                  borderRadius="lg"
                  shadow="none"
                  bg="white"
                  p={1}
                  h="60px"
                >
                  <Input
                    placeholder="What's your work email?"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    fontSize="lg"
                    h="60px"
                    bg="transparent"
                    border="none"
                    borderRadius="none"
                    _hover={{ border: 'none' }}
                    _focus={{ outline: 'none', boxShadow: 'none' }}
                    flex="1"
                  />

                  <Button
                    as={RouterLink}
                    to={`/requestdemo?email=${encodeURIComponent(email)}`}
                    variant="logo_accent"
                    size="lg"
                    h="50px"
                    px={6}
                    borderRadius="lg"
                    shadow="sm"
                  >
                    Talk to Sales
                  </Button>
                </Flex>
              </Box>

              {/* Mobile-Only Button */}
              <Box display={{ base: 'block', md: 'none' }} mt={4}>
              <Flex
                  as="form"
                  direction="row"
                  align="center"
                  justify="space-between"
                  maxW="600px"
                  border="1px solid"
                  borderColor="gray.400"
                  borderRadius="lg"
                  shadow="none"
                  bg="white"
                  p={1}
                  h="60px"
                >
                  <Input
                    placeholder="What's your work email?"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    fontSize="lg"
                    h="60px"
                    bg="transparent"
                    border="none"
                    borderRadius="none"
                    _hover={{ border: 'none' }}
                    _focus={{ outline: 'none', boxShadow: 'none' }}
                    flex="1"
                  />
                  
                </Flex>
                <Button
                      textAlign={"left"}
                      mt={2}
                      as={RouterLink}
                      to="/requestdemo"
                      variant="logo_accent"
                      size="lg"
                      width="100%"
                      h="60px"
                      p={6}
                      borderRadius="lg"
                      shadow="sm"
                    >
                      Talk to Sales
                    </Button>
              </Box>

              {/* Check Marks */}
              <Box display={{ base: 'none', md: 'block' }} mt={6} textAlign={"center"}>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'center', md: 'flex-start' }}
                justify={{ base: 'center', md: 'flex-start' }}
                gap={{ base: 3, md: 6 }}
                mt={6}
              >
                {/* 1st check item */}
                <Flex align="center">
                  <Icon as={CheckIcon} color="green.500" boxSize={5} mr={2} />
                  <Text color="gray.600" fontSize="sm">Enterprise scale</Text>
                </Flex>
                {/* 2nd check item */}
                <Flex align="center">
                  <Icon as={CheckIcon} color="green.500" boxSize={5} mr={2} />
                  <Text color="gray.600" fontSize="sm">Fully automated</Text>
                </Flex>
                {/* 3rd check item */}
                <Flex align="center">
                  <Icon as={CheckIcon} color="green.500" boxSize={5} mr={2} />
                  <Text color="gray.600" fontSize="sm">Optimized sales</Text>
                </Flex>
              </Flex>
              </Box>

              
            </Box>
            {/* Mobile-Only Button */}
          <Box display={{ base: 'block', md: 'none' }} mt={6} textAlign={"center"}>
                <Lottie
                  animationData={globeAnimation}
                  loop
                  style={{ width: '200px', height: '100%'}}
                />
          </Box>
          </VStack>
          


          {/* Replace the Image with the Lottie Animation */}
          <Box
            flex="1"
            display={{ base: "none", md: "flex" }}
            justifyContent="center"
            alignItems="center"
            mt={{ base: 10, md: 0 }}
            minW="400px"
            maxW="650px"
            mr="30px"
            // mx={{ base: 0, md: 12 }}
          >
            <AnimatedLogoOverlay />
          </Box>
        </Flex>
      </Flex>
      <BuiltForScaleSection />
      <TimelineSection />
      <BuiltForGrowthSection />
      <BottomCTA />
    </Box>
  );
};

export default LandingPage;
