import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://hiaiden.com/api'
  // baseURL: 'http://localhost:8000'
});
// const axiosInstance = axios.create({
//   baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'
// });

// Axios interceptor to set Authorization header for every request, except for routes that do not require a token
axiosInstance.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('access_token');

    // Do not add the Authorization header for registration or login endpoints
    if (!config.url.includes('/api/register/') && !config.url.includes('/api/token/')) {
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
    if (config.url.includes('/api/companies/') && config.method === 'get') {
      // Skip adding the Authorization header for these routes
      delete config.headers['Authorization'];
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
