// src/pages/AboutUs.js
import React from 'react';
import { Box, Flex, Heading, Text, Image, Stack } from '@chakra-ui/react';
import founder1 from '../images/jake_profile.jpg';
import founder2 from '../images/danny_profile.jpg';

const founders = [
  {
    name: 'Jake Esse',
    title: 'Co-Founder & CEO',
    image: founder1, 
    description: 'Jake Esse works in Corporate Development for Henkel, a global consumer packaged goods company. Jake graduated from Dartmouth College in 2016 and began his career in derivatives trading at Morgan Stanley before spending time in growth equity, starting a tech company (non-exit) and working in management consulting.'
  },
  {
    name: 'Daniel Mansilla',
    title: 'Co-Founder & CTO',
    image: founder2, 
    description: 'Daniel Mansilla is a technology expert with deep experience building large-scale software applications for industry leaders in manufacturing, aerospace, and defense. His technical proficiency as a full-stack software engineering leader additionally spans IT operations, infrastructure management, and systems design. Altogether, Daniel provides a comprehensive point of view toward building new products that meet critical business needs.'
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
