import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Container,
  Image,
  useColorModeValue
} from '@chakra-ui/react';
import minimize_costs from '../images/minimize_costs.png';
import maximize_recovery from '../images/maximize_recovery.png';
import accelerate_innovation from '../images/accelerate_innovations.png';
import eliminate_waste from '../images/eliminate_waste.png';

export default function BuiltForGrowthSection() {
  const bg = useColorModeValue('gray.50', 'gray.800');
  const boxBg = useColorModeValue('white', 'gray.700');

  // Helper card component for consistency
  // Receives props for: image, heading, text
  const FeatureCard = ({ imageSrc, heading, description, hoverGradient }) => {
    return (
        <Box
        bg={boxBg}
        boxShadow="xl"
        rounded="md"
        p={6}
        mb={6}
        position="relative"
        transition="all 0.2s ease"
        _hover={{
          transform: "translateY(-5px)", // Move up slightly
          boxShadow: "2xl",              // Increase shadow depth
        }}
        role="group" // Enables _groupHover functionality
      >
        {/* Image Container with Dynamic Hover Effect */}
        <Box
          width="100%"
          height="500px"
          mx="auto"
          bg={bg}
          transition="background 0.5s ease" // Smooth gradient transition
          _groupHover={{
            bg: hoverGradient, // Gradient on hover
          }}
          rounded="md"
        >
          <Image
            bg="transparent"
            src={imageSrc}
            alt={heading}
            borderRadius="lg"
            objectFit="cover"
            width="auto"
            height={{ base: "200px", sm: "400px", md: "400px", lg: "500px" }}
            mx="auto"
          />
        </Box>
      
        {/* Text Content */}
        <Heading as="h3" size="md" mt={6} mb={4}>
          {heading}
        </Heading>
        <Text color="gray.600">{description}</Text>
      </Box>
      
    );
  };

  return (
    <Box as="section" py={{ base: 10, md: 16 }} px={{ base: 8, md: 12 }} bg={bg}>
      <Container maxW="8xl">
        {/* Section Heading */}
        <Box textAlign="left" mb={{ base: 8, md: 24 }} pb={10}>
          <Text
            fontWeight="bold"
            textTransform="uppercase"
            color="blue.400"
            letterSpacing={1}
            mb={2}
          >
            Built for growth
          </Text>
          <Heading as="h2" size="xl" fontWeight="extrabold" mb={4}>
            Transform Your Surplus into Opportunity
          </Heading>
          <Text textAlign="left" fontSize="lg" color="gray.500" maxW="3xl">
            Aiden empowers you to maximize recovery rates, eliminate product waste,
            minimize carrying costs, and accelerate innovation cycles—all from one
            seamless platform. Our data-driven approach helps your enterprise turn
            unsold inventory into new revenue streams, freeing up resources to focus
            on what you do best: making products people love.
          </Text>
        </Box>

        <Box pt={10}>
          {/* 2-column layout. Each column is its own Box/stack. */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} alignItems="start">
            {/* LEFT COLUMN: no upward offset */}
            <Box>
              <FeatureCard
                imageSrc={maximize_recovery}
                heading="Maximize Recovery Rates"
                description="Aiden’s auction process and truck optimization algorithm maximize
                recovery rates by selling at the highest market value."
                hoverGradient="linear-gradient(135deg, rgba(255,165,0,0.3) 0%, rgba(255,69,0,0.3) 100%)" 
                // Orange gradient
              />
              <FeatureCard
                imageSrc={eliminate_waste}
                heading="Eliminate Product Waste"
                description="Aiden helps you achieve your sustainability goals by eliminating
                unnecessary product disposals. Goodbye write-offs."
                hoverGradient="linear-gradient(135deg, rgba(102,126,234,0.3) 0%, rgba(118,75,162,0.3) 100%)"
                // Blue/Purple gradient
              />
            </Box>

            {/* RIGHT COLUMN: offset upwards */}
            <Box position="relative" top={{ base: 0, md: -24 }}>
              <FeatureCard
                imageSrc={minimize_costs}
                heading="Minimize Carrying Costs"
                description="Aiden’s ability to sell large volumes fast allows you to
                minimize carrying costs and make space for higher-value inventory."
                hoverGradient="linear-gradient(135deg, rgba(30,144,255,0.3) 0%, rgba(0,102,204,0.3) 100%)" 
                // Purple gradient
              />
              <FeatureCard
                imageSrc={accelerate_innovation}
                heading="Accelerate Innovation"
                description="Aiden allows you to accelerate innovation cycles without worrying
                about long-tail portfolio liabilities by selling whatever you got."
                hoverGradient="linear-gradient(135deg, rgba(34,139,34,0.3) 0%, rgba(50,205,50,0.3) 100%)"
                // Green gradient
              />
            </Box>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}
