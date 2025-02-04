import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme'; 
import App from './App';
import './axiosConfig';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

// Determine environment
const isProduction = !window.location.host.includes('127.0.0.1') && !window.location.host.includes('localhost');

// Use environment variables correctly
const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST;

if (isProduction && typeof window !== "undefined" && !window.__POSTHOG_INITIALIZED__) {
  posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      custom_campaign_params: ["utm_email"], // Capture custom UTM parameter
  });

  window.__POSTHOG_INITIALIZED__ = true;
}

console.log('PostHog Host:', POSTHOG_HOST);
console.log('isProduction:', isProduction);

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
