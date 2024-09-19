// src/pages/AboutUs.js
import React from 'react';
import { Box, Flex, Heading, Text, Image, Stack } from '@chakra-ui/react';
import founder1 from '../jake_profile.jpg';
import founder2 from '../danny_profile.jpg';

const founders = [
  {
    name: 'Jake Esse',
    title: 'Co-Founder & CEO',
    image: founder1, // Replace with actual image URL
    description: 'Founder 1 is a seasoned entrepreneur with a passion for innovation in the marketplace industry. With over 10 years of experience, they have led multiple successful startups.'
  },
  {
    name: 'Daniel Mansilla',
    title: 'Co-Founder & CTO',
    image: founder2, // Replace with actual image URL
    description: 'Founder 2 is a tech visionary with a background in software development and AI. They have built and scaled numerous technology platforms, leading the tech strategy at Pallet Marketplace.'
  }
];

const AboutPage = () => {
  return (
    
    <Box bg="gray.50" p={8} minH="80vh">
      <Flex direction="column" align="center" maxW="1000px" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading as="h1" size="xl" color="brand.600" mb={8}>
          Meet the Team
        </Heading>
        <Stack spacing={8} w="100%">
          {founders.map((founder, index) => (
            <Flex
              key={index}
              direction={{ base: 'column', md: 'row' }}
              align="center"
              bg="gray.100"
              p={6}
              borderRadius="md"
              boxShadow="sm"
              w="100%"
            >
              <Image
                src={founder.image}
                alt={founder.name}
                borderRadius="full"
                boxSize="150px"
                objectFit="cover"
                mr={{ base: 0, md: 6 }}
                mb={{ base: 4, md: 0 }}
              />
              <Box>
                <Heading as="h2" size="md" color="brand.600" mb={2}>
                  {founder.name}
                </Heading>
                <Text fontSize="lg" color="gray.700" mb={2}>
                  {founder.title}
                </Text>
                <Text fontSize="md" color="gray.600">
                  {founder.description}
                </Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      </Flex>
    </Box>
  );
};

export default AboutPage;
