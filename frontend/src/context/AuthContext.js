import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => 
    localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
  );
  const [user, setUser] = useState(() => 
    authTokens ? JSON.parse(atob(authTokens.access.split('.')[1])) : null
  );

  const login = async (email, password) => {
    const response = await axios.post('/api/token/', { username: email, password });
    const data = response.data;
    setAuthTokens(data);
    setUser(JSON.parse(atob(data.access.split('.')[1])));
    localStorage.setItem('authTokens', JSON.stringify(data));
  };

  const logout = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
  };

  // Move refreshToken inside the useEffect to avoid the missing dependency warning
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const response = await axios.post('/api/token/refresh/', {
          refresh: authTokens?.refresh,
        });
        const data = response.data;
        setAuthTokens((prevTokens) => ({
          ...prevTokens,
          access: data.access,
        }));
        localStorage.setItem('authTokens', JSON.stringify({
          ...authTokens,
          access: data.access,
        }));
      } catch (error) {
        console.error('Failed to refresh token', error);
        logout(); // Optionally log out if the refresh fails
      }
    };

    if (authTokens) {
      const interval = setInterval(() => {
        refreshToken(); // Call refresh token every 4 minutes
      }, 4 * 60 * 1000); // Refresh token every 4 minutes
      return () => clearInterval(interval); // Cleanup the interval
    }
  }, [authTokens]); // authTokens is the dependency

  return (
    <AuthContext.Provider value={{ user, login, logout, authTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
