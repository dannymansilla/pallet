import axios from "axios";
import endpoints from "./endpoints";

let logoutHandler = null;

// Set default configuration for axios
const API = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor for token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor for responses
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await API.post(endpoints.refresh, { refresh: refreshToken });
        localStorage.setItem("token", data.access);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return API.request(error.config);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        if (logoutHandler) logoutHandler(); // Call the linked logout handler
      }
    }
    return Promise.reject(error);
  }
);

// Set the logout handler globally
export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// Authentication Services
export const loginUser = (credentials) => API.post(endpoints.login, credentials);
export const logoutUser = () => API.post(endpoints.logout);

// Onboarding Services
export const acceptTerms = () => API.post("/companies/accept_terms/");
export const registerUser = (data) => API.post(endpoints.register, data);

// Register Company Service
export const registerCompany = async (data) => {
  const response = await API.post("/companies/register/", {
    company_name: data.companyName,
    address: data.address,
    contact_email: data.contactEmail,
    contact_phone: data.contactPhone,
    admin_email: data.adminEmail,
    admin_password: data.adminPassword,
    admin_username: data.adminUsername,
    admin_role: data.adminRole,
  });
  return response.data;
};

export {API};