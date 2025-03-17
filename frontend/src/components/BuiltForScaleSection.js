import React from 'react';
import {
  Box,
  Heading,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react'; 
import globeAnimation from '../assets/aiden_globe.json';

// We'll create a motion-enabled Box for easy hover scaling.
const MotionBox = motion(Box);

export default function BuiltForScaleSection() {
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box
      as="section"
      bg={bgColor}
      py={{ base: 10, md: 16, lg: 24 }}
      px={{ base: 4, md: 8 }}
      textAlign="center"
    >
      {/* 1) Section Heading & CTA */}
      <Box maxW="800px" mx="auto" mb={{ base: 8, md: 0 }}>
        <Text mb={2} fontWeight="semibold" color="gray.500">
          Enterprise Scale Sales Automation
        </Text>
        <Heading as="h2" size="lg" mb={3}>
          Aiden is the only solution capable of selling large volumes
          at high prices, fast.
        </Heading>
        <Text
          as="a"
          href="/requestdemo"
          color="blue.500"
          fontWeight="medium"
          _hover={{ textDecoration: 'underline' }}
        >
          Talk to sales &rarr;
        </Text>
      </Box>

      {/* 2) Outer container with max-width matching the heading */}
      <Box maxW="800px" mx="auto" mb="50px">
        {/* 3) Relative container for our circles so they overlap properly */}
        <Box
          position="relative"
          mx="auto"
          w="100%"      // Full width of the container
          h="500px"     // Increase/decrease as needed
        >
          {/* VOLUME Circle */}
          <Tooltip
            hasArrow
            placement="top"
            label="We handle massive volumes so you can move inventory effortlessly."
            bg="gray.700"
            color="white"
            fontSize="md"
            p={4}
            borderRadius="md"
            boxShadow="xl"
            textAlign="center"
          >
            <MotionBox
              position="absolute"
              top={{ base: "10%", md: "10%" }}
              left={{ base: "5%", md: "15%" }}
              w={{ base: "300px", md: "350px" }}
              h={{ base: "300px", md: "350px" }}
              borderRadius="50%"
              bg="rgba(253, 186, 116, 0.3)"
              mixBlendMode="multiply"
              cursor="pointer"
              display="flex"
              alignItems="center"
              justifyContent="center"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.2 }}
            >
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="rgb(255, 152, 0)"
              >
                Volume
              </Text>
            </MotionBox>
          </Tooltip>

          {/* PRICE Circle */}
          <Tooltip
            hasArrow
            placement="top"
            label="We sell your products at the highest possible price."
            bg="gray.700"
            color="white"
            fontSize="md"
            p={4}
            borderRadius="md"
            boxShadow="xl"
            textAlign="center"
          >
            <MotionBox
              position="absolute"
              top="10%"
              left={{ base: "35%", md: "41%" }}
              w={{ base: "300px", md: "350px" }}
              h={{ base: "300px", md: "350px" }}
              borderRadius="50%"
              bg="rgba(125, 179, 255, 0.3)"
              mixBlendMode="multiply"
              cursor="pointer"
              display="flex"
              alignItems="center"
              justifyContent="center"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.2 }}
            >
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="rgb(58, 144, 247)"
              >
                Price
              </Text>
            </MotionBox>
          </Tooltip>

          {/* SPEED Circle */}
          <Tooltip
            label="We sell your surplus fast, speeding up cash flow & clearing space."
            hasArrow
            placement="top"
            bg="gray.700"
            color="white"
            fontSize="md"
            p={4}
            borderRadius="md"
            boxShadow="xl"
            textAlign="center"
          >
            <MotionBox
              position="absolute"
              top="45%"
              left={{ base: "20%", md: "28%" }}
              w={{ base: "300px", md: "350px" }}
              h={{ base: "300px", md: "350px" }}
              borderRadius="50%"
              bg="rgba(119, 221, 119, 0.3)"
              mixBlendMode="multiply"
              cursor="pointer"
              display="flex"
              alignItems="center"
              justifyContent="center"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.2 }}
            >
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="rgb(85, 168, 65)"
              >
                Speed
              </Text>
            </MotionBox>
          </Tooltip>

          {/* 4) LOGO in the center */}
          <Box
            position="absolute"
            // top="56%"
            top={{ base: '55%', md: '56%' }}
            left={{ base: "48%", md: "50%" }}
            transform="translate(-50%, -50%)"
            zIndex={10}           // Ensure logo sits above circles
            w="100px"             // Adjust to control logo size
          >
            <Lottie
            animationData={globeAnimation}
            loop
            style={{ width: '100%', height: '100%' }}
          />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
