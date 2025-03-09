// src/theme.js
import { extendTheme } from '@chakra-ui/react';
import '@fontsource/dm-serif-display';
import '@fontsource/dm-sans/400.css'; // Regular (default)
import '@fontsource/dm-sans/700.css'; // Bold
import '@fontsource/dm-sans/800.css'; 

const theme = extendTheme({
  fonts: {
    heading: `'DM Sans', sans-serif`,
    body: `'DM Sans', sans-serif`,
    logo: 'DM Mono, monospace',
  },
  colors: {
    brand: {
      background_color: "gray.50",
      linen: '#FAF0E6', // background_color background color
      teal: '#008080', // Primary button color
      olive: '#556B2F', // Secondary button color
      gray: '#A9A9A9', // Neutral button color
      burntSienna: '#E97451', // Accent button color
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md', // Rounded corners
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold'
      },
      variants: {
        solid: {
          bg: 'black', // Teal background for primary button
          color: 'white', // White text
          _hover: {
            color: 'white', // White text
            bg: 'teal.400', // Olive hover effect
          },
        },
        outline: {
          borderColor: 'black', // Gray border for outline button
          color: 'black', // Olive text
          _hover: {
            borderColor: 'black',
            color: 'white',
            bg: 'black', // Subtle background change on hover
          },
        },
        ghost: {
          color: 'black', // Burnt Sienna for ghost button
          _hover: {
            borderColor: 'black',
            bg: 'white',
            color: 'black', // Black text on hover
          },
        },
        logo_accent: {
          color: 'white', // Burnt Sienna for ghost button
          // bg: 'rgb(244, 180, 87)', //orange
          // bg: 'rgb(58, 144, 247)', //blue
          // bg: 'rgb(104, 131, 247)', //purple
          // bg: 'rgb(85, 168, 65)', //green
          // bg: 'rgb(201, 245, 156)', //light green
          // bg: 'rgb(236, 129, 89)', //salmon
          bg: 'rgb(227, 97, 146)', //pink
          // bg: 'black', //black
          // _hover: {
          //   borderColor: 'black',
          //   bg: 'white',
          //   color: 'black', // Black text on hover
          // },
        },
      },
    },
  },
});

export default theme;
