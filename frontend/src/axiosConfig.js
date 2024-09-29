// src/axiosConfig.js
import axios from 'axios';
import { refreshToken } from './utils/auth';

// Set up Axios default base URL
axios.defaults.baseURL = 'http://localhost:8000'; // Update to your backend URL

// Axios interceptor to set Authorization header for every request, except for routes that do not require a token
axios.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('access_token');

    // Do not add the Authorization header for registration or login endpoints
    if (!config.url.includes('/api/register/') && !config.url.includes('/api/token/')) {
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Axios interceptor for handling token expiration
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Check if the error is a 401 Unauthorized response and if it's not a retry
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Attempt to refresh the token
      const success = await refreshToken();

      if (success) {
        // Retry the original request with the new token
        const newAccessToken = localStorage.getItem('access_token');
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } else {
        // If token refresh fails, log the user out and redirect to the login page
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Redirect to login page if necessary
        // window.location.href = '/login'; // Uncomment if you want automatic redirection
      }
    }

    return Promise.reject(error);
  }
);
