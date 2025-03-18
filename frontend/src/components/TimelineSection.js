import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

export default function TimelineSection() {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('md', 'dark-lg');

  // State to track which card is hovered (0, 1, or 2); null if none
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <Box
      as="section"
      py={{ base: 10, md: 16, lg: 24, xl: 32 }}
      px={{ base: 8, md: 24 }}
    >
      {/* 1) Intro Text */}
      <Box textAlign="center" maxW="800px" mx="auto" mb={{ base: 8, md: 12 }}>
        <Text mb={2} fontWeight="semibold" color="gray.500">
          Tiny investment with a huge return.
        </Text>
        <Heading as="h2" size="lg" mb={3}>
          Here’s what you can get done with Aiden in just 30 days.
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

      {/* 2) Timeline Container */}
      <Box maxW="1400px" mx="auto" position="relative">
        {/* A) Short horizontal line + dots + labels */}
        <Box position="relative" height="60px" mb={{ base: 4, md: 6 }}>
          {/* The horizontal line is 66% wide, centered */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width={{ base: '70%', md: '66%' }}
            height="2px"
            bg="gray.200"
          />

          {/* 3 dots, evenly spaced */}
          <Box
            position="absolute"
            top="50%"
            left="16.7%"
            w={5}
            h={5}
            borderRadius="50%"
            transition="all 0.3s ease"
            // Highlight if hoveredCard === 0
            bg={hoveredCard === 0 ? 'rgb(58, 144, 247)' : 'gray.400'}
            transform={
              hoveredCard === 0
                ? 'translate(-50%, -50%) scale(1.3)'
                : 'translate(-50%, -50%)'
            }
          />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            w={5}
            h={5}
            borderRadius="50%"
            transition="all 0.3s ease"
            bg={hoveredCard === 1 ? 'rgb(58, 144, 247)' : 'gray.400'}
            transform={
              hoveredCard === 1
                ? 'translate(-50%, -50%) scale(1.3)'
                : 'translate(-50%, -50%)'
            }
          />
          <Box
            position="absolute"
            top="50%"
            left="83.3%"
            w={5}
            h={5}
            borderRadius="50%"
            transition="all 0.3s ease"
            bg={hoveredCard === 2 ? 'rgb(58, 144, 247)' : 'gray.400'}
            transform={
              hoveredCard === 2
                ? 'translate(-50%, -50%) scale(1.3)'
                : 'translate(-50%, -50%)'
            }
          />

          {/* Text labels */}
          <Text
            position="absolute"
            top="calc(50% + 1.5rem)"
            left="16.7%"
            transform="translateX(-50%)"
            fontSize="sm"
            fontWeight="bold"
          >
            Day 1
          </Text>
          <Text
            position="absolute"
            top="calc(50% + 1.5rem)"
            left="50%"
            transform="translateX(-50%)"
            fontSize="sm"
            fontWeight="bold"
          >
            Day 15
          </Text>
          <Text
            position="absolute"
            top="calc(50% + 1.5rem)"
            left="83.3%"
            transform="translateX(-50%)"
            fontSize="sm"
            fontWeight="bold"
          >
            Day 30
          </Text>
        </Box>

        {/* B) Cards Grid */}
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={{ base: 6, md: 8 }}
          mt={{ base: 8, md: 12 }}
        >
          {/* Card 1 - Day 1 */}
          <VStack
            spacing={4}
            align="start"
            bg={cardBg}
            boxShadow={cardShadow}
            p={6}
            borderRadius="md"
            transition="all 0.3s ease"
            // "Pop" effect on hover
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: 'lg',
            }}
            // Update state to highlight this card (index 0)
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Heading as="h4" size="md">
              Seamless Integration
            </Heading>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={CheckIcon} color="green.500" />
                ERP Integration Completed
              </ListItem>
              <ListItem>
                <ListIcon as={CheckIcon} color="green.500" />
                Product Listings Generated
              </ListItem>
              <ListItem>
                <ListIcon as={CheckIcon} color="green.500" />
                Customer Contacts Uploaded
              </ListItem>
            </List>
          </VStack>

          {/* Card 2 - Day 15 */}
          <VStack
            spacing={4}
            align="start"
            bg={cardBg}
            boxShadow={cardShadow}
            p={6}
            borderRadius="md"
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: 'lg',
            }}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Heading as="h4" size="md">
              Happy Customers
            </Heading>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={CheckIcon} color="green.500" />
                Customers Fully Onboarded
              </ListItem>
              <ListItem>
                <ListIcon as={CheckIcon} color="green.500" />
                Sales Agreements Signed
              </ListItem>
              <ListItem>
                <ListIcon as={CheckIcon} color="green.500" />
                Digital Payments Configured
              </ListItem>
            </List>
          </VStack>

          {/* Card 3 - Day 30 */}
          <VStack
            spacing={4}
            align="start"
            bg={cardBg}
            boxShadow={cardShadow}
            p={6}
            borderRadius="md"
            transition="all 0.3s ease"
            _hover={{
              transform: 'translateY(-5px)',
              boxShadow: 'lg',
            }}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Heading as="h4" size="md">
              Goodbye Excess
            </Heading>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={CheckIcon} color="green.500" />
                First Auction Cycle Begins
              </ListItem>
              <ListItem>
                <ListIcon as={CheckIcon} color="green.500" />
                Sales Permanently Optimized
              </ListItem>
              <ListItem>
                <ListIcon as={CheckIcon} color="green.500" />
                Never Worry About Excess Again
              </ListItem>
            </List>
          </VStack>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
