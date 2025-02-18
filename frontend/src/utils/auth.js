// src/utils/auth.js
import axios from 'axios';

// Function to refresh the access token
export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
      const response = await axios.post('/api/auth/token/refresh/', { refresh });
      localStorage.setItem('access_token', response.data.access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      return true;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem("user");
  window.location.href = '/login';
};
