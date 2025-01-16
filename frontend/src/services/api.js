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

        // Update AuthContext token directly if available
        if (logoutHandler) logoutHandler.setToken(data.access);

        // Retry the failed request
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return API.request(error.config);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Logout the user if token refresh fails
        if (logoutHandler) logoutHandler.logout();
      }
    }
    return Promise.reject(error);
  }
);


// Set the logout handler globally
export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// Fetch the current network
export const fetchNetwork = () => API.get("/companies/fetch_network/");

// Add a company to the network
export const addToNetwork = (companyId) =>
  API.post("/companies/add_to_network/", { company_id: companyId });

// Remove a company from the network
export const removeFromNetwork = (companyId) =>
  API.post("/companies/remove_from_network/", { company_id: companyId });

// Search for companies (assuming the endpoint exists or can be added in the backend)
export const searchCompanies = (query) =>
  API.get(`/companies/search/?q=${query}`);


// Authentication Services
export const loginUser = async (credentials) => {
  const response = await API.post(endpoints.login, credentials);
  const { user, access, refresh } = response.data;
  localStorage.setItem("token", access);
  localStorage.setItem("refreshToken", refresh);
  localStorage.setItem("user", JSON.stringify(user));
  return response;
};

export const getProfile = () => API.get(endpoints.profile);

export const logoutUser = () => {
  const refreshToken = localStorage.getItem("refreshToken");
  return API.post(endpoints.logout, { refresh: refreshToken });
};

// Dashboards
export const getActiveAuctions = () => API.get("/auction/active/");
export const getCurrentBids = () => API.get("/bids/current/");
export const getActiveListings = () => API.get("/listings/active/");
export const getAuctionPerformance = () => API.get("/auction/performance/");
// listings
export const getCurrentListings = () => API.get("/listings/active/");
export const getQueuedListings = () => API.get("/listings/queued/");
export const deleteListing = (listingId) =>
  API.delete(`/listings/${listingId}/`);
export const updateListing = (listingId, updatedData) =>
  API.patch(`/listings/${listingId}/`, updatedData);

export const getAvailableListings = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return API.get(`/listings/available_for_bidding/?${params}`);
};

// Fetch details of a specific listing by its ID
export const getListingDetails = (listingId) => {
  return API.get(`/listings/${listingId}/`);
};


// Place a bid
export const placeBid = (bidData) => {
  return API.post("/bids/", bidData);
};

export const getListingBids = (listingId) => {
  return API.get(`/listings/${listingId}/bids/`);
};


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
    roles: data.companyRole,
  });
  return response.data;
};

// Approve a company
export const approveCompany = (companyId) =>
  API.post(`/companies/${companyId}/approve_company/`);

// Reject a company
export const rejectCompany = (companyId) =>
  API.post(`/companies/${companyId}/reject_company/`);

// Fetch pending companies
export const getPendingCompanies = () =>
  API.get("/companies/", {
    params: { is_approved: false }, // Assuming backend supports filtering by this parameter
  });

// Fetch all companies
export const getAllCompanies = () => API.get("/companies/");

export const searchProducts = (query) => {
  return API.get(`/products/search/?q=${query}`);
};

export const createListing = (listingData) => {
  return API.post("/listings/", listingData);
};



export {API};