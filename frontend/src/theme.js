// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e4f1f6',   // Lightest teal
      100: '#c3d9e6',  // Light teal
      200: '#a1c2d6',  // Light-medium teal
      300: '#80aac5',  // Medium teal
      400: '#5e92b5',  // Dark-medium teal
      500: '#467a9b',  // Dark teal (Used for primary buttons and headers)
      600: '#294C60',  // Deep teal (Primary color)
      700: '#223D4D',  // Darker teal
      800: '#1a2d3a',  // Very dark teal
      900: '#121e26',  // Darkest teal
    },
    accent: {
      50: '#ffeae1',   // Lightest peach
      100: '#ffd1b8',  // Light peach
      200: '#ffb88e',  // Light-medium peach
      300: '#ff9f65',  // Medium peach
      400: '#ff8641',  // Dark-medium peach
      500: '#FF6F61',  // Coral (Accent color)
      600: '#cc5731',  // Darker coral
      700: '#993f22',  // Darkest coral
    },
    neutral: {
      50: '#f7f7f7',   // Lightest gray
      100: '#f4f4f4',  // Light gray (Light Background)
      200: '#e0e0e0',  // Light-medium gray
      300: '#cccccc',  // Medium gray
      400: '#b8b8b8',  // Dark-medium gray
      500: '#a4a4a4',  // Dark gray
      600: '#909090',  // Darker gray
      700: '#7c7c7c',  // Darkest gray
      800: '#686868',  // Almost black gray
      900: '#333333',  // Charcoal (Dark Text)
    },
  },
  fonts: {
    heading: 'Poppins, sans-serif',  // Use 'Poppins' for headers
    body: 'Open Sans, sans-serif',   // Use 'Open Sans' for body text
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '8px', // Rounded corners
        fontWeight: 'bold',
      },
      sizes: {
        md: {
          px: 4,
          py: 2,
        },
      },
      variants: {
        solid: {
          bg: 'brand.600',
          color: 'white',
          _hover: {
            bg: 'brand.700',
          },
        },
        outline: {
          borderColor: 'brand.600',
          color: 'brand.600',
          _hover: {
            bg: 'brand.50',
          },
        },
      },
    },
  },
});

export default theme;
