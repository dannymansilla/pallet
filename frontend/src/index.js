import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme'; 
import App from './App';
import './axiosConfig';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

// Initialize PostHog only in production
const isProduction = !window.location.host.includes('127.0.0.1') && !window.location.host.includes('localhost');

if (isProduction) {
  posthog.init(process.env.REACT_APP_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
  });
}

console.log('PostHog API Key:', process.env.REACT_APP_PUBLIC_POSTHOG_KEY);
console.log('PostHog Host:', process.env.REACT_APP_PUBLIC_POSTHOG_HOST);
console.log('is prod', isProduction)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {isProduction ? (
      <PostHogProvider client={posthog}>
        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </PostHogProvider>
    ) : (
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    )}
  </React.StrictMode>
);
