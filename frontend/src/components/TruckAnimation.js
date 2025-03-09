import React from 'react';
import { Box, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import truckImage from '../images/truck.png'; // Replace with your truck image path

const MotionBox = motion(Box);

const TruckAnimation = () => (
  <Box position="relative" overflow="hidden" width="100%" height="120px">
    <MotionBox
      position="absolute"
      bottom="0"
      initial={{ x: '-20%' }}
      animate={{ x: '120%' }}
      transition={{
        duration: 3,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      }}
    >
      <Image src={truckImage} alt="Moving Truck" boxSize={{ base: '80px', md: '120px' }} />
    </MotionBox>
  </Box>
);

export default TruckAnimation;
