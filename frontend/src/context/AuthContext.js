import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser, setLogoutHandler, API } from "../services/api"; // Fixed import
import endpoints from "../services/endpoints"; // Import the endpoints for token refresh

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Link the logout function to the API's global logout handler
    setLogoutHandler(logout);
  }, []);

  // Login Method
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await loginUser(credentials);
      const { access, refresh } = response.data;
      setToken(access);
      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
      setUser(response.data.user); // Assuming user details are included in the response
      setError(null);
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Method
  const logout = async () => {
    try {
      await logoutUser();
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Refresh Method
  const refresh = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const { data } = await API.post(endpoints.refresh, { refresh: refreshToken });
      setToken(data.access);
      localStorage.setItem("token", data.access);
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout(); // Ensure user is logged out on refresh failure
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
