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
  Avatar,
  useColorModeValue,
  chakra,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

import { Link as RouterLink } from 'react-router-dom';
import posthog from 'posthog-js';
import TimelineSection from '../components/TimelineSection';
import BuiltForScaleSection from '../components/BuiltForScaleSection';
import BottomCTA from '../components/BottomCTA';
import BuiltForGrowthSection from '../components/BuiltForGrowthSection';
import { CheckIcon } from '@chakra-ui/icons';

const AidenAvatar = '/images/aiden_icon.png';
const UserAvatar = '/images/user_icon.png';

// ───────────────────────────────────────────────────────────
// Dynamic Chat Demo Component
// ───────────────────────────────────────────────────────────
const DynamicChatDemo = () => {
  const conversation = [
    {
      sender: 'Aiden',
      text: "Hi there — I’m Aiden, your AI buying assistant. Ready to find great deals?",
      timestamp: '03:24 PM',
    },
    {
      sender: 'User',
      text: "Yes, I’m restocking and need high-margin inventory.",
      timestamp: '03:25 PM',
    },
    {
      sender: 'Aiden',
      text: "Here are 2 trending products based on sales velocity and margin potential:\n\n• **MaxClean Detergent** — Moving fast in Midwest; 22% MoM growth  \n• **ProNourish Shampoo** — 18% below retail, strong POS in Northeast",
      timestamp: '03:26 PM',
    },
    {
      sender: 'User',
      text: "Perfect. Let’s place a bid.",
      timestamp: '03:26 PM',
    },
  ];
  

  const typingSpeed = 50;
  const pauseBetweenMessages = 800;

  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const aidenBubbleBg = useColorModeValue('blue.50', 'blue.900');
  const userBubbleBg = useColorModeValue('gray.100', 'gray.700');
  const containerBg = useColorModeValue('white', 'gray.800');
  const aidenTextColor = useColorModeValue('black', 'white');
  const userTextColor = useColorModeValue('black', 'white');

  useEffect(() => {
    let timer;
    if (isTyping) {
      const currentMsg = conversation[currentMsgIndex].text;
      if (typedText.length < currentMsg.length) {
        timer = setTimeout(() => {
          setTypedText((prev) => prev + currentMsg.charAt(prev.length));
        }, typingSpeed);
      } else {
        setIsTyping(false);
        setTimeout(() => {
          if (currentMsgIndex < conversation.length - 1) {
            setCurrentMsgIndex((prev) => prev + 1);
            setTypedText('');
            setIsTyping(true);
          }
        }, pauseBetweenMessages);
      }
    }
    return () => clearTimeout(timer);
  }, [typedText, isTyping, currentMsgIndex]);

  const messagesToShow = conversation.slice(0, currentMsgIndex);
  if (typedText && currentMsgIndex < conversation.length) {
    messagesToShow.push({
      ...conversation[currentMsgIndex],
      text: typedText,
    });
  }

  return (
    <Box
      w="100%"
      maxW="550px"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      p={4}
      bg={containerBg}
      boxShadow="lg"
    >
      {messagesToShow.map((msg, i) => {
        const isAiden = msg.sender === 'Aiden';
        const bubbleBg = isAiden ? aidenBubbleBg : userBubbleBg;
        const textColor = isAiden ? aidenTextColor : userTextColor;
        const avatarSrc = isAiden ? AidenAvatar : UserAvatar;

        return (
          <Flex key={i} justifyContent={isAiden ? 'flex-start' : 'flex-end'} mb={4}>
            {isAiden && <Avatar src={avatarSrc} name="Aiden" size="sm" mr={2} />}
            <Box
              bg={bubbleBg}
              color={textColor}
              borderRadius="xl"
              p={3}
              maxW="75%"
              position="relative"
            >
              <Text fontWeight="bold" fontSize="sm" mb={1}>
                {msg.sender}
              </Text>
              <Box mb="20px" className="markdown">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </Box>
              <chakra.span
                position="absolute"
                bottom="4px"
                right="8px"
                fontSize="xs"
                color="gray.500"
              >
                {msg.timestamp}
              </chakra.span>
            </Box>
            {!isAiden && <Avatar src={avatarSrc} name="User" size="sm" ml={2} />}
          </Flex>
        );
      })}
    </Box>
  );
};

// ───────────────────────────────────────────────────────────
// Landing Page Component
// ───────────────────────────────────────────────────────────
const LandingPage = () => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get('utm_source');
    const utm_medium = urlParams.get('utm_medium');
    const utm_campaign = urlParams.get('utm_campaign');
    const utm_content = urlParams.get('utm_content');
    const utm_term = urlParams.get('utm_term');
    const utm_email = urlParams.get('utm_email');

    posthog.capture('utm_tracking', {
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

    const url = new URL(window.location.href);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_email'].forEach((param) =>
      url.searchParams.delete(param)
    );
    window.history.replaceState({}, document.title, url.pathname);
  }, []);

  useEffect(() => {
    const chatWidget = document.querySelector('[data-chat-widget]');
    if (chatWidget) {
      chatWidget.style.display = 'none';
    }
  }, []);

  return (
    <Box bg="transparent" color="black" minW="100vw">
      {/* Hero Section */}
      <Box
        width="100%"
        px={{ base: 8, md: 24 }}
        py={{ base: 8, md: 12 }}
        background="repeating-linear-gradient(
          -45deg,
          #f2f2f2,
          #f2f2f2 1px,
          #ffffff 1px,
          #ffffff 100px
        )"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="center"
          maxW="1200px"
          mx="auto"
          minH="90vh"
          gap={10}
        >
          {/* Left Side */}
          <Box
            flex="1"
            pr={{ md: 0 }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            minH="600px"
            position="relative"  // Make this position relative
          >
            {/* 
              Overlay behind the heading area.
              White with some transparency & subtle blur 
              so lines under the text get "softened." 
            */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="whiteAlpha.8"  // Adjust the alpha value if you want it lighter/darker
              backdropFilter="blur(5px)"
              zIndex={0}
            />

            {/* Actual heading + text (above the overlay) */}
            <VStack spacing={8} align="flex-start" maxW="650px" position="relative" zIndex={1}>
              <Heading
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="extrabold"
                color="black"
                letterSpacing="-2px"
                lineHeight="1.2"
              >
                Automate your excess inventory sales
              </Heading>

              <Text maxW="600px" fontSize={{ base: 'md', md: 'lg' }} color="gray.700">
                Aiden is the only excess inventory solution that maximizes sales volume, price,
                and speed — while reducing manual work by 90%.
              </Text>

              {/* Form */}
              <Box width="100%">
                {/* Desktop Form */}
                <Box display={{ base: 'none', md: 'block' }}>
                  <Flex
                    as="form"
                    align="center"
                    maxW="600px"
                    border="1px solid"
                    borderColor="gray.400"
                    borderRadius="lg"
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
                      flex="1"
                      _hover={{ border: 'none' }}
                      _focus={{ outline: 'none', boxShadow: 'none' }}
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

                {/* Mobile Form */}
                <Box display={{ base: 'block', md: 'none' }} mt={4}>
                  <Flex
                    as="form"
                    align="center"
                    border="1px solid"
                    borderColor="gray.400"
                    borderRadius="lg"
                    bg="white"
                    p={1}
                    h="60px"
                    width="100%"
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
                      flex="1"
                      _hover={{ border: 'none' }}
                      _focus={{ outline: 'none', boxShadow: 'none' }}
                    />
                  </Flex>
                  <Button
                    as={RouterLink}
                    to="/requestdemo"
                    variant="logo_accent"
                    size="lg"
                    width="100%"
                    h="60px"
                    p={6}
                    mt={2}
                    borderRadius="lg"
                    shadow="sm"
                  >
                    Talk to Sales
                  </Button>
                </Box>
              </Box>

              {/* Checkmarks */}
              <Box display={{ base: 'none', md: 'block' }}>
                <Flex gap={6} mt={6}>
                  <Flex align="center">
                    <Icon as={CheckIcon} color="green.500" boxSize={5} mr={2} />
                    <Text color="gray.600" fontSize="sm">Enterprise scale</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={CheckIcon} color="green.500" boxSize={5} mr={2} />
                    <Text color="gray.600" fontSize="sm">Fully automated</Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={CheckIcon} color="green.500" boxSize={5} mr={2} />
                    <Text color="gray.600" fontSize="sm">Optimized sales</Text>
                  </Flex>
                </Flex>
              </Box>
            </VStack>
          </Box>

          {/* Right Side */}
          <Box
            flex="1"
            minH="600px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <DynamicChatDemo />
          </Box>
        </Flex>
      </Box>

      <BuiltForScaleSection />
      <TimelineSection />
      <BuiltForGrowthSection />
      <BottomCTA />
    </Box>
  );
};

export default LandingPage;
