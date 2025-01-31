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
      await logoutUser();
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [navigate]); // Add 'navigate' as a dependency

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]); // Dependency array updated

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
        isSuperuser: user?.is_superuser || false, // Expose superuser role
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
