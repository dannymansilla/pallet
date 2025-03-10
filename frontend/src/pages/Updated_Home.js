import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  Input,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Lottie from "lottie-react";
import globeAnimation from "../assets/aiden_globe.json";
import posthog from "posthog-js";

const Home = () => {
  const [email, setEmail] = useState("");
  const sectionRefs = useRef([]);
  // State to track which section is active (updated via Intersection Observer)
  // eslint-disable-next-line
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    // UTM parameter handling
    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get("utm_source");
    const utm_medium = urlParams.get("utm_medium");
    const utm_campaign = urlParams.get("utm_campaign");
    const utm_content = urlParams.get("utm_content");
    const utm_term = urlParams.get("utm_term");
    const utm_email = urlParams.get("utm_email");

    posthog.capture("utm_tracking", {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      utm_email,
    });

    if (utm_email) {
      posthog.identify(utm_email, { email: utm_email });
    }

    // Clean up the URL
    const url = new URL(window.location.href);
    url.searchParams.delete("utm_source");
    url.searchParams.delete("utm_medium");
    url.searchParams.delete("utm_campaign");
    url.searchParams.delete("utm_content");
    url.searchParams.delete("utm_term");
    url.searchParams.delete("utm_email");
    window.history.replaceState({}, document.title, url.pathname);
  }, []);

  // Layer Two Data
  const layerTwoData = [
    {
      heading: "AI-Powered Automation for Surplus Inventory Sales",
      text: "",
    },
    {
      heading: "Built for the Enterprise",
      text: "Aiden is the only solution capable of selling large volumes at high prices, fast.",
    },
    {
      heading: "Using Advanced Optimization",
      text: "Aiden’s AI is designed to optimize truckloads across hundreds of buyers and products.",
    },
    {
      heading: "Maximize Recovery Rates",
      text: "Aiden’s competitive, automated auction process maximizes recovery rates for large volumes.",
    },
    {
      heading: "Minimize Carrying Costs",
      text: "Aiden minimizes your carrying costs by selling as fast as possible while maintaining high volumes and prices.",
    },
    {
      heading: "Reduce Manual Work",
      text: "Aiden reduces manual work by over 90%. Just upload your customers and we’ll handle the rest.",
    },
    {
      heading: "Accelerate Innovation",
      text: "By taking care of long-tail portfolio sales, Aiden allows you to accelerate innovation without worrying about surplus liability.",
    },
    {
      heading: "Preserve Brand Equity",
      text: "Aiden’s private, confidential sales process preserves your brand’s equity through rapid innovation.",
    },
  ];

    // Layer Three Data
    const layerThreeData = [
        { heading: ` `, text: ` ` },
        { heading: ` `, text: ` ` },
        { heading: ` `, text: ` ` },
        { heading: ` `, text: ` ` },
        { heading: ` `, text: ` ` },
        { heading: ` `, text: ` ` },
        { heading: ` `, text: ` ` },
        { heading: ` `, text: ` ` },
      ];

  const AnimatedLogoOverlay = () => (
    <Box width="100%" maxW="500px">
      <Lottie
        animationData={globeAnimation}
        loop
        style={{ width: "100%", height: "100%" }}
      />
    </Box>
  );

  // Use Intersection Observer to update the active section index
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index"), 10);
            setCurrentSection(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => {
        // eslint-disable-next-line
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // PinnedHeader: First layer with email & Lottie (fixed, zIndex=10)
  const PinnedHeader = () => {
    return (
      <Flex
        position="fixed"
        top="0"
        left="50%"
        transform="translateX(-50%)"
        width="100%"
        maxW="1200px"
        align="center"
        justify="space-between"
        px={{ base: "10", md: "6" }}
        py={0}
        bg="transparent"
        zIndex="10"
        minH="100vh"
      >
        {/* Left Column: Divided into 2 equal rows */}
        <Box flex="1" display="flex" flexDirection="column" height="100%" minH="100vh">
          {/* Top row (empty) */}
          <Box flex="1" />
          {/* Bottom row - Email Box */}
          <Box flex="1" display="flex" alignItems="top" pt={20}>
            <VStack spacing={6} align="stretch" width="100%" maxW="500px" pt={20}>
              <Flex
                as="form"
                direction="row"
                align="center"
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
                  bg="white"
                  border="none"
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
            </VStack>
          </Box>
        </Box>
  
        {/* Right Column: Lottie Animation */}
        <Box display={{ base: "none", md: "block" }} >
            <Box flex="1" display="flex" justifyContent="flex-end">
            <AnimatedLogoOverlay />
            </Box>
        </Box>
        
      </Flex>
    );
  };

  // ThirdLayer: New layer that scrolls like the main content,
  // uses the same two column formatting as the other sections,
  // occupies the entire width of the main content area,
  // and has the highest zIndex.
  const ThirdLayer = () => {
    // Array of PNG image URLs
    const imageUrls = [
        "/assets/image1.png",
        "/assets/image2.png",
        "/assets/image3.png"
    ];

    return (
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex="20"
        pointerEvents="none"
        display={{ base: "none", md: "block" }}
      >
        <Flex justify="center" align="center" height="100%">
          {imageUrls.map((src, index) => (
            <Box key={index} mx={4}>
              <img src={src} alt={`Third layer image ${index + 1}`} style={{ maxWidth: "200px", height: "auto" }} />
            </Box>
          ))}
        </Flex>
      </Box>
    );
    return (
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex="20"
        pointerEvents="none" // so it doesn't block interactions
        display={{ base: "none", md: "block" }} 
      >
        <Box px={6} maxW="1200px" mx="auto">
          {layerThreeData.map((section, index) => (
            <Flex
              key={index}
              data-index={index}
              ref={(el) => (sectionRefs.current[index] = el)}
              height="85vh"
              pt={index === layerThreeData.length - 1 ? "100px" : "0"}
              pl="150px"
              align="center"
              justify="space-between"
              flexDirection="row"
            >
              {/* Left Column: Empty */}
              <Box flex="1" />
              {/* Right Column: Content */}
              <Box
                flex="1"
                display="flex"
                flexDirection="column"
                height="100%"
              >
                {/* Top half with header and text aligned to the bottom */}
                <Box
                  flex="1"
                  display="flex"
                  flexDirection="column"
                  justifyContent="flex-end"
                  textAlign="Center"
                >
                  <Heading
                    fontSize={{ base: "3xl", md: "5xl" }}
                    fontWeight="extrabold"
                    color="black"
                    letterSpacing="-1px"
                  >
                    {section.heading}
                  </Heading>
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    color="gray.700"
                    mt={4}
                  >
                    {section.text}
                  </Text>
                </Box>
                {/* Bottom half (empty or for additional content) */}
                <Box flex="1" />
              </Box>
            </Flex>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box bg="transparent" color="black" minW="100vw">
      {/* Fixed Pinned Header layer */}
      <PinnedHeader />
      {/* Main Content & ThirdLayer are wrapped in a relative container so that the ThirdLayer scrolls normally */}
      <Box position="relative">
        {/* Main Content (Layer 2) */}
        <Box maxW="1200px" mx="auto" px={{ base: "10", md: "6" }}>
          {layerTwoData.map((section, index) => (
            <Flex
              key={index}
              data-index={index}
              ref={(el) => (sectionRefs.current[index] = el)}
              height="85vh"
              pt={index === layerTwoData.length - 1 ? "100px" : "0"}
              align="center"
              justify="space-between"
              flexDirection="row"
            >
              {/* Left Column: Heading & Text split into 2 equal rows */}
              <Box
                flex="1"
                display="flex"
                flexDirection="column"
                height="100%"
              >
                {/* Top half with header and text aligned to the bottom */}
                <Box
                  flex="1"
                  display="flex"
                  flexDirection="column"
                  justifyContent="flex-end"
                  
                >
                  <Heading
                    fontSize={{ base: "3xl", md: "5xl" }}
                    fontWeight="extrabold"
                    color="black"
                    letterSpacing="-1px"
                  >
                    {section.heading}
                  </Heading>
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    color="gray.700"
                    mt={4}
                  >
                    {section.text}
                  </Text>
                </Box>
                {/* Bottom half (empty or for additional content) */}
                <Box flex="1" />
              </Box>
              {/* Right Column: Empty for visual alignment with Lottie */}
              <Box flex="1" display={{ base: "none", md: "block" }}  />
            </Flex>
          ))}
        </Box>
        {/* ThirdLayer overlays the main content and scrolls with it */}
        <ThirdLayer />
      </Box>
    </Box>
  );
};

export default Home;
