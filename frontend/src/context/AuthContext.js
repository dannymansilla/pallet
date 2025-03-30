import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, logoutUser, setLogoutHandler, API } from "../services/api";
import endpoints from "../services/endpoints";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      // First clear all auth-related state
      setToken(null);
      setUser(null);
      
      // Clear all localStorage items
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // Call API logout (but don't wait for it since we want UI to update immediately)
      logoutUser().catch(console.error);
      
      // Force navigation to home page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API call fails, ensure user is logged out locally
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      navigate("/");
    }
  }, [navigate]);

  setLogoutHandler(logout);

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  // Login Method
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      const { user, access, refresh } = response.data;
      setToken(access);
      setUser(user);
      localStorage.setItem("token", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh Method
  const refresh = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");

      const { data } = await API.post(endpoints.refresh, { refresh: refreshToken });
      setToken(data.access);
      localStorage.setItem("token", data.access);
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isSuperuser: user?.is_superuser || false,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
