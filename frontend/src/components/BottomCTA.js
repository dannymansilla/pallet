import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export default function BottomCTA() {
  return (
    <Box
  as="section"
  w="100%"
  mt={{ base: 16, md: 24 }}
  mb={{ base: 8, md: 12 }}
>
  {/* Outer Box with bigger base padding */}
  <Box px={{ base: 8, md: 24 }}> 
    <Flex
      w="full"
      maxW="1400px"
      mx="auto"
      bg="black"
      color="white"
      borderRadius="2xl"
      py={{ base: 12, md: 20 }}
      px={{ base: 6, md: 12 }}
      direction={{ base: 'column', md: 'row' }}
      align="center"
      justify={{ base: 'center', md: 'space-between' }}
      textAlign={{ base: 'center', md: 'left' }}
    >
      <Box mb={{ base: 6, md: 0 }}>
        <Heading
          as="h2"
          fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
          fontWeight="extrabold"
          lineHeight="1.2"
          mb={2}
        >
          It’s time to get started with Aiden
        </Heading>
        <Text fontSize={{ base: 'md', md: 'lg' }} color="whiteAlpha.800">
          Automate your excess inventory sales...
        </Text>
      </Box>

      <Box>
        <Button
          as={RouterLink}
          to="/requestdemo"
          bg="white"
          color="black"
          fontWeight="bold"
          borderRadius="full"
          size="lg"
          px={6}
          py={5}
          _hover={{ bg: 'whiteAlpha.800' }}
          _active={{ bg: 'whiteAlpha.900' }}
          shadow="md"
        >
          Talk to Sales
        </Button>
      </Box>
    </Flex>
  </Box>
</Box>

  );
}
