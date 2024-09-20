// src/pages/HomePage.js
import React from 'react';
import { Box, Flex, Heading, Text, Button, Stack, Image } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import cpg_photo from '../images/9397334.png';

const HomePage = () => {
  return (
    <Box bg="brand.background_color" p={8} minH="80vh"> {/* Updated to ensure consistent background color */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
        maxW="1200px"
        mx="auto"
        p={6}
        bg="brand.background_color"
        borderRadius="md"
        // boxShadow="md"
        mb={8}
      >
        <Box maxW="600px">
          <Heading as="h1" size="xl" color="black" mb={4}>
            Buy and sell excess CPG inventory
          </Heading>
          <Text fontSize="lg" color="black" mb={4} fontFamily="'Sofadi One', sans-serif">
          Our B2B auction platform allows sellers to automate the sale of excess consumer packaged goods inventory and buyers to bid on a variety of products from well-known brands across categories.
          </Text>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={4}>
            <Button as={RouterLink} to="/contact" variant="solid" size="lg">
              Contact Us
            </Button>
          </Stack>
        </Box>
        <Box>
          <Image
            src={cpg_photo} // Relative path to the image in the public folder
            alt="Pallet of CPG Goods"
            borderRadius="8px"
            width="100%"
            maxW="400px"
          />
        </Box>
      </Flex>
      
      <Flex direction="column" align="center" p={4} bg="brand.background_color" borderRadius="md">
        <Heading as="h2" size="lg" color="black" mb={4}>
          How It Works
        </Heading>
        <Text fontSize="md" color="black" mb={4} maxW="800px" textAlign="center">
          Browse available pallets, place your bids, and win items in bulk. Once you win, connect directly with the supplier to arrange shipping.
        </Text>
        <Button as={RouterLink} to="/details" variant="solid" size="md">
          Learn More
        </Button>
      </Flex>
    </Box>
  );
};

export default HomePage;
