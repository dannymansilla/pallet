// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for authentication
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check if user is logged in by verifying the access token in localStorage
  const checkLoginStatus = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      console.log("user authenticated");
    } else {
      setIsAuthenticated(false);
      console.log("user NOT authenticated");
    }
  };

  // Run the login check on initial load
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Function to log out the user
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkLoginStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
