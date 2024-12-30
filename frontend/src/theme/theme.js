// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: `'Sora', sans-serif`,
    body: `'Sora', sans-serif`,
  },
  colors: {
    brand: {
      background_color: "white",
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
        fontFamily: `'Sora', sans-serif`,
        fontWeight: 'bold'
      },
      variants: {
        solid: {
          bg: 'black', // Teal background for primary button
          color: 'white', // White text
          _hover: {
            color: 'white', // White text
            bg: 'brand.burntSienna', // Olive hover effect
          },
        },
        outline: {
          borderColor: 'black', // Gray border for outline button
          color: 'black', // Olive text
          _hover: {
            borderColor: 'white',
            color: 'white',
            bg: 'brand.burntSienna', // Subtle background change on hover
          },
        },
        ghost: {
          color: 'black', // Burnt Sienna for ghost button
          _hover: {
            borderColor: 'black',
            bg: 'white',
            color: 'brand.burntSienna', // Black text on hover
          },
        },
      },
    },
  },
});

export default theme;
