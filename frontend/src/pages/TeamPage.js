// src/pages/AboutUs.js
import React from 'react';
import { Box, Flex, Divider, Heading, Text, Image, Stack } from '@chakra-ui/react';
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
  
    <Box bg="brand.background_color" py={8} maxW="1000px">
      <Box py={{ base: 12, md: 20 }}>
          <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold" mb={4}>
          Turning Excess into Opportunity
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} mx="auto" color="gray.600">
            At Aiden, we are transforming the way businesses buy and sell excess consumer packaged goods. 
            Our goal is to create a more efficient, transparent, and accessible marketplace for bulk inventory transactions.
          </Text>
      </Box>

      <Divider borderBottom="1px solid #999" py={10} />

      <Flex direction="column" maxW="1000px" mx="auto" py={10} bg="white">
      <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold" mb={4} py={5}>
          Founders
        </Heading>
        <Stack spacing={8} w="100%">
          {founders.map((founder, index) => (
            <Flex
              key={index}
              direction={{ base: 'column', md: 'row' }}
              align="center"
              bg="brand.background_color"
              p={10}
              borderRadius="md"
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
                <Heading as="h2" size="md" color="black" mb={2}>
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
