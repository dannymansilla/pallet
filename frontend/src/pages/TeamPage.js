// src/pages/AboutUs.js
import React from 'react';
import { Box, Flex, Heading, VStack, Text, Image, Stack } from '@chakra-ui/react';
import founder1 from '../images/jake_profile.jpg';
import founder2 from '../images/danny_profile.jpg';

const founders = [
  {
    name: 'Jake Esse',
    title: 'Co-Founder & CEO',
    image: founder1, 
    description:
      'Jake Esse works in Corporate Development for Henkel, a global consumer packaged goods company. Jake graduated from Dartmouth College in 2016 and began his career in derivatives trading at Morgan Stanley before spending time in growth equity, starting a tech company (non-exit) and working in management consulting.'
  },
  {
    name: 'Daniel Mansilla',
    title: 'Co-Founder & CTO',
    image: founder2, 
    description:
      'Daniel Mansilla is a technology expert with deep experience building large-scale software applications for industry leaders in manufacturing, aerospace, and defense. His technical proficiency as a full-stack software engineering leader additionally spans IT operations, infrastructure management, and systems design. Altogether, Daniel provides a comprehensive point of view toward building new products that meet critical business needs.'
  }
];

const AboutUs = () => {
  return (
    <Box>
      {/* Mission Section */}
      <Box
        minH="95vh"
        bg="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        px={4}
      >
        <Box maxW="1000px" textAlign={"left"}>
          <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold" mb={10} color="black">
            Turning Excess into Opportunity
          </Heading>
          <VStack spacing={6} align="start">
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="black">
              <strong>At Aiden, we believe</strong> that selling excess inventory shouldn't be a time-consuming, manual process. 
              Our goal is to help businesses maximize sales volume, price, and speed—while eliminating over 90% of the manual work involved.
            </Text>

            <Text fontSize={{ base: 'lg', md: 'xl' }} color="black">
              With Aiden, simply upload your UPCs, and our automated system takes care of everything—pulling product data, 
              contacting customers, collecting bids, optimizing sales for revenue, and generating transaction documents.
            </Text>

            <Text fontSize={{ base: 'lg', md: 'xl' }} color="black" fontWeight="bold">
              Save time. Save money. Waste less.
            </Text>
          </VStack>
        </Box>
      </Box>

      {/* Our Story Section */}
      <Box
        minH="95vh"
        minW="100vw"
        bg="black"
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        px={4}
      >
        <Box maxW="1000px" textAlign={"left"}>
          <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight="bold" mb={4} color="white" py={5}>
            Our Story
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color="white">
            Founded with a vision to revolutionize the excess inventory market, Aiden was born from the frustration of waste and inefficiency.
            With deep roots in consumer packaged goods and technology innovation, our journey is one of resilience, collaboration, and a relentless pursuit
            of a smarter marketplace.
          </Text>
        </Box>
      </Box>

      {/* Our Founders Section */}
      <Box
        minH="95vh"
        bg="white"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        px={4}
        py={10}
      >
        {/* Container for Founders Section */}
        <Box maxW="1000px" mx="auto">
          {/* Left-aligned Heading */}
          <Heading
            fontSize={{ base: '3xl', md: '5xl' }}
            fontWeight="bold"
            color="black"
            textAlign="left"
            mb={4} // Closer to first founder
          >
            Founders
          </Heading>

          {/* Stack for Founders */}
          <Stack spacing={8}>
            {founders.map((founder, index) => (
              <Flex
                key={index}
                direction={{ base: 'column', md: 'row' }}
                align="center"
                bg="white"
                p={10}
                borderRadius="md"
              >
                {/* Fixed Image Container */}
                <Box flexShrink={0}>
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    borderRadius="full"
                    boxSize="150px"
                    objectFit="cover"
                    mr={{ base: 0, md: 6 }}
                    mb={{ base: 4, md: 0 }}
                  />
                </Box>
                {/* Text Container */}
                <Box
                  textAlign={{ base: 'center', md: 'left' }}
                  w={{ base: '100%', md: 'calc(100% - 150px - 24px)' }}
                >
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
        </Box>
      </Box>

    </Box>
  );
};

export default AboutUs;
