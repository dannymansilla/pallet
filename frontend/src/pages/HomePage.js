// src/pages/HomePage.js
import React from 'react';
import { Box, Flex, Heading, Text, Button, Stack, Image } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import cpg_photo from '../images/9397334.png';
import listing_dashboard from '../images/listing_dashboard.png';
import bidding_form from '../images/bidding_sample.png';
import profile_page from '../images/profile_sample.png';

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
      </Flex>
 
      <Flex direction="column" align="center" p={4} bg="brand.background_color" borderRadius="md" mt={8}>
      
        {/* Creat Account Section */}
        <Flex direction={{ base: 'column', md: 'row' }} borderRadius="md"
        boxShadow="md" bg="brand.background_color" align="center" justify="space-between" w="100%" maxW="1000px" mb={8}>
          <Box textAlign={{ base: 'center', md: 'left' }} p={4} flex="1">
            <Heading as="h3" size="md" color="black" mb={4}>
              Create Account
            </Heading>
            <Text fontSize="md" color="black" mb={4}>
              Create an accout linked to your CPG company.
            </Text>
            <Button as={RouterLink} borderRadius='small' to="/create-account" variant="outline" color="black">
            Create Account
            </Button>
          </Box>
          <Box flex="1" textAlign="center" p={4}>
            <Image
              src={profile_page} // Update this path with the actual path of the sell image
              alt="Profile Page"
              borderRadius="8px"
              width="100%"
              maxW="400px"
            />
          </Box>
        </Flex>

        {/* Sell Section */}
        <Flex direction={{ base: 'column', md: 'row' }} borderRadius="md"
        boxShadow="md" bg="brand.background_color" align="center" justify="space-between" w="100%" maxW="1000px" mb={8}>
          <Box textAlign={{ base: 'center', md: 'left' }} p={4} flex="1">
            <Heading as="h3" size="md" color="black" mb={4}>
              Sell
            </Heading>
            <Text fontSize="md" color="black" mb={4}>
              List your excess inventory in a blind auction to find the highest bidder and streamline your sales process.
            </Text>
          </Box>
          <Box flex="1" textAlign="center" p={4}>
            <Image
              src={listing_dashboard} // Update this path with the actual path of the sell image
              alt="Auctioning Inventory"
              borderRadius="8px"
              width="100%"
              maxW="400px"
            />
          </Box>
        </Flex>

        {/* Buy Section */}
        <Flex direction={{ base: 'column', md: 'row' }} borderRadius="md"
        boxShadow="md" bg="brand.background_color" align="center" justify="space-between" w="100%" maxW="1000px">
          <Box textAlign={{ base: 'center', md: 'left' }} p={4} flex="1">
            <Heading as="h3" size="md" color="black" mb={4}>
              Buy
            </Heading>
            <Text fontSize="md" color="black" mb={4}>
              Bid on bulk excess inventory from a variety of categories, and get access to products at competitive prices.
            </Text>
          </Box>
          <Box flex="1" textAlign="center" p={4}>
            <Image
              src={bidding_form} // Update this path with the actual path of the buy image
              alt="Bidding on Inventory"
              borderRadius="8px"
              width="100%"
              maxW="400px"
            />
          </Box>
        </Flex>
        
        <Button as={RouterLink} to="/details" margin={20} variant="solid" size="md">
          Learn More
        </Button>
      </Flex>
    </Box>
  );
};

export default HomePage;
