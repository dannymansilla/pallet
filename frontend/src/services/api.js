import axios from "axios";
import endpoints from "./endpoints";

let logoutHandler = null;
let isLoggingOut = false; 

// Set default configuration for axios
const API = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const handleUnauthorized = async () => {
  if (isLoggingOut) return; // If already logging out, do nothing
  isLoggingOut = true; // Lock to prevent multiple calls

  console.warn("Unauthorized detected. Logging out...");
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  if (logoutHandler) {
    logoutHandler();
  } else {
    window.location.href = "/login";
  }

  setTimeout(() => {
    isLoggingOut = false; // Reset after some time
  }, 2000);
};

// Set the logout handler from AuthContext
export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// Verify Token Before Using It
export const checkTokenValidity = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await axios.post(endpoints.verifyToken, { token });
  } catch (error) {
    console.error("Token verification failed:", error);

    if (error.response?.status === 401) {
      handleUnauthorized();
    }
  }
};


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

// Add interceptor for handling token expiration
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;

      // Prevent infinite loops if logout API itself returns 401
      if (originalRequest.url.includes("/logout")) {
        console.warn("Logout API returned 401, stopping logout loop.");
        // localStorage.removeItem("token");
        // localStorage.removeItem("refresh_token");
        return Promise.reject(error);
      }

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        const { data } = await API.post(endpoints.refresh, { refresh: refreshToken });
        localStorage.setItem("token", data.access);

        // Retry the failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return API.request(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        handleUnauthorized(); // Trigger logout once
      }
    }

    return Promise.reject(error);
  }
);

// Fetch the current network
export const fetchNetwork = () => API.get("/companies/fetch_network/");
export const requestToJoinNetwork = async (sellerCompanyId) => {
  try {
    await API.post("/companies/request_network_access/", { seller_company: sellerCompanyId });
    alert("Request sent to join seller's network.");
  } catch (error) {
    alert("Failed to send request. Please try again.");
  }
};

export const bulkUploadBuyers = async () => {
  try {
    const response = await API.post("/companies/bulk_upload_buyers/", {
      buyers: [
        { company_name: "Discount Mart", contact_email: "admin@discountmart.com" },
        { company_name: "McLennan Distributors", contact_email: "admin@mclennan.com" },
        { company_name: "SuperBargain Supply", contact_email: "admin@superbargain.com" },
        { company_name: "Daniel Market", contact_email: "drmansilla2@gmail.com" },
        { company_name: "Jake's Bodega", contact_email: "jake@hiaiden.com" }
      ]
    });

    return response.data;
  } catch (error) {
    console.error("Error in bulk buyer upload:", error);
    throw error;
  }
};


export const bulkUploadListings = async () => {
  try {
    const response = await API.post("/listings/batch_upload/", {
      auction_cycle_id: 2,
      listings: [
        { gtin: "1000000000001", quantity_available: 500, minimum_selling_price: 15.75, warehouse_location: "789 Industrial Road, Chicago, IL, 60601", shipping_instructions: "Ships in standard 40-foot containers." },
        { gtin: "1000000000002", quantity_available: 300, minimum_selling_price: 25.00, warehouse_location: "789 Industrial Road, Chicago, IL, 60601", shipping_instructions: "Ships in standard 40-foot containers." },
        { gtin: "1000000000003", quantity_available: 450, minimum_selling_price: 10.50, warehouse_location: "789 Industrial Road, Chicago, IL, 60601", shipping_instructions: "Ships in standard 40-foot containers." },
        { gtin: "1000000000004", quantity_available: 600, minimum_selling_price: 8.99, warehouse_location: "789 Industrial Road, Chicago, IL, 60601", shipping_instructions: "Ships in eco-friendly packaging." },
        { gtin: "1000000000005", quantity_available: 700, minimum_selling_price: 12.50, warehouse_location: "789 Industrial Road, Chicago, IL, 60601", shipping_instructions: "Palletized for large-scale distribution." },
        { gtin: "1000000000006", quantity_available: 250, minimum_selling_price: 18.00, warehouse_location: "789 Industrial Road, Chicago, IL, 60601", shipping_instructions: "Ships with weather-protected wrapping." }
      ]
    });

    return response.data;
  } catch (error) {
    console.error("Error in bulk upload:", error);
    throw error;
  }
};

// Fetch pending requests for the seller
export const fetchPendingRequests = async () => {
  const response = await API.get("/companies/pending_requests/");
  return response.data; // Ensure only data is returned
};


// Handle network request (approve/reject)
export const handleNetworkRequest = async (requestId, action) => {
  const response = await API.post("/companies/handle_network_request/", {
    request_id: requestId,
    action: action,
  });
  return response.data;
};

export const fetchPendingInvites = async () => {
  try {
    const response = await API.get("/companies/pending_invites/");
    return response.data;
  } catch (error) {
    console.error("Error fetching pending invites:", error);
    return [];
  }
};


// Add a company to the network
export const addToNetwork = (companyId) =>
  API.post("/companies/add_to_network/", { company_id: companyId });

// Remove a company from the network
export const removeFromNetwork = (companyId) =>
  API.post("/companies/remove_from_network/", { company_id: companyId });

// Search for companies (assuming the endpoint exists or can be added in the backend)
export const searchCompanies = (query) =>
  API.get(`/companies/search/?q=${query}`);

export const fetchBuyerTrucks = async () => {
  try {
    const response = await API.get('/orders/buyer/trucks/');
    return response;
  } catch (error) {
    console.error('Error fetching buyer trucks:', error);
    throw error;
  }
};


export const fetchAuctionTrucks = async (auctionId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          auction_summary: {
            auction_name: "Hankel Goods Bulk Auction",
            auction_closed: "2025-01-30",
            total_trucks: 3,
            total_buyers_awarded: 3,
            total_auction_revenue: 212500.00
          },
          trucks: [
            {
              truck_id: "T-1001",
              destination: "Dallas, TX",
              buyer: "Discount Mart",
              truck_weight: 41300,
              truck_revenue: 78500.00,
              items: [
                { 
                  name: "PowerWash Max Laundry Detergent", 
                  quantity: 4800, 
                  pallets: 120, 
                  weight: 24000, 
                  sku: "1000000000002", 
                  awarded_price_per_unit: 10.50, 
                  total_price: 50400.00 
                },
                { 
                  name: "FixoBond Ultra-Strong Adhesive", 
                  quantity: 2160, 
                  pallets: 90, 
                  weight: 2376, 
                  sku: "1000000000001", 
                  awarded_price_per_unit: 15.00, 
                  total_price: 32400.00 
                }
              ]
            },
            {
              truck_id: "T-1002",
              destination: "Chicago, IL",
              buyer: "Smart Deals Wholesale",
              truck_weight: 39900,
              truck_revenue: 67800.00,
              items: [
                { 
                  name: "EverFresh Fabric Softener", 
                  quantity: 3500, 
                  pallets: 100, 
                  weight: 15750, 
                  sku: "1000000000007", 
                  awarded_price_per_unit: 12.00, 
                  total_price: 42000.00 
                },
                { 
                  name: "ShinePro Auto Glass Cleaner", 
                  quantity: 2640, 
                  pallets: 48, 
                  weight: 5808, 
                  sku: "1000000000003", 
                  awarded_price_per_unit: 9.00, 
                  total_price: 23760.00 
                }
              ]
            },
            {
              truck_id: "T-1003",
              destination: "Newark, NJ",
              buyer: "McLennan Distributors",
              truck_weight: 40800,
              truck_revenue: 66200.00,
              items: [
                { 
                  name: "FlexSeal Silicone Caulk", 
                  quantity: 3000, 
                  pallets: 55, 
                  weight: 3900, 
                  sku: "1000000000006", 
                  awarded_price_per_unit: 14.00, 
                  total_price: 42000.00 
                },
                { 
                  name: "MegaFix Super Glue", 
                  quantity: 6000, 
                  pallets: 80, 
                  weight: 1800, 
                  sku: "1000000000008", 
                  awarded_price_per_unit: 5.00, 
                  total_price: 30000.00 
                }
              ]
            }
          ]
        }
      });
    }, 1000); // Simulate network delay
  });
};




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
  return API.get(`/auctions/listings/${listingId}/`);
};

// Fetch product details by ID
export const getProductDetails = (productId) => {
  return API.get(`/inventory/products/${productId}/`);
};

// Place a bid
export const placeBid = (bidData) => {
  return API.post("/auctions/bids/", {
    listing: bidData.listingId,
    sale_event: bidData.saleEventId,
    bid_price: parseFloat(bidData.bidPrice),
    bid_quantity: parseInt(bidData.bidQuantity, 10),
    status: 'active'  // This will be ignored by the backend as it's read-only
  });
};

export const getListingBids = (listingId) => {
  return API.get(`/listings/${listingId}/bids/`);
};

export const fetchMyBids = async () => {
  try {
    const response = await API.get("/auctions/my-bids/");
    return response.data;
  } catch (error) {
    console.error("Error fetching bids:", error);
    return { active: [], won: [], lost: [] };
  }
};

// Onboarding Services
export const acceptTerms = () => API.post("/companies/accept_terms/");
export const registerUser = (data) => API.post(endpoints.register, data);

// Register Company Service
export const registerCompany = async (data) => {
  const response = await API.post(endpoints.companyRegister, {
    email: data.adminEmail,
    password: data.adminPassword,
    company_name: data.companyName,
    role: data.companyRole,
    tos_accepted: data.termsAccepted
  });
  return response.data;
};



// Admin Organization Management
export const getAllCompanies = () => API.get(endpoints.adminListOrganizations);

export const getPendingCompanies = () => API.get(endpoints.adminPendingOrganizations);

export const approveCompany = async (orgId) => {
  return API.post(endpoints.adminApproveOrganization(orgId), {
    action: 'approve',
    notes: 'Organization approved by admin'
  });
};

export const rejectCompany = async (orgId) => {
  return API.post(endpoints.adminApproveOrganization(orgId), {
    action: 'reject',
    notes: 'Organization rejected by admin'
  });
};

export const searchProducts = (query) => {
  return API.get(`/products/search/?q=${query}`);
};

export const createListing = (listingData) => {
  return API.post("/listings/", listingData);
};

// Seller Dashboard Metrics
export const getSellerMetrics = () => API.get("/auctions/seller/metrics/");
export const getMonthlyStats = () => API.get("/auctions/monthly-stats/");
export const getSellerDashboardTables = () => API.get("/auctions/dashboard-tables/");

// Buyer Dashboard
export const getBuyerDashboard = () => API.get("/auctions/buyer/dashboard/");
export const requestNetworkJoin = (sellerId) => API.post("/auctions/buyer/request-network-join/", { seller_id: sellerId });

// Seller Listings
export const getSellerListings = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.month) {
    params.append('month', filters.month);
  }
  
  if (filters.brand) {
    params.append('brand', filters.brand);
  }
  
  const queryString = params.toString();
  const url = queryString ? `/auctions/seller/listings/?${queryString}` : '/auctions/seller/listings/';
  
  return API.get(url);
};

// Seller Network API
export const getSellerNetwork = async () => {
  try {
    const response = await API.get('/auctions/seller/network/');
    return response.data;
  } catch (error) {
    console.error('Error fetching seller network:', error);
    throw error;
  }
};

export const addBuyerToNetwork = async (buyerId) => {
  try {
    const response = await API.post('/auctions/seller/network/', { buyer_id: buyerId });
    return response.data;
  } catch (error) {
    console.error('Error adding buyer to network:', error);
    throw error;
  }
};

export const removeBuyerFromNetwork = async (relationshipId) => {
  try {
    const response = await API.delete(`/auctions/seller/network/${relationshipId}/`);
    return response.data;
  } catch (error) {
    console.error('Error removing buyer from network:', error);
    throw error;
  }
};

export const updateNetworkRequest = async (relationshipId, action) => {
  try {
    const response = await API.patch(`/auctions/seller/network/${relationshipId}/`, { action });
    return response.data;
  } catch (error) {
    console.error('Error handling network request:', error);
    throw error;
  }
};

export const searchBuyers = async (query) => {
  try {
    const response = await API.get(`/auctions/buyers/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching buyers:', error);
    throw error;
  }
};

export const uploadBuyersBulk = async (buyersData) => {
  try {
    const response = await API.post('/auctions/buyers/bulk-upload/', { buyers: buyersData });
    return response.data;
  } catch (error) {
    console.error('Error bulk uploading buyers:', error);
    throw error;
  }
};

export const getAuctionTrucks = async () => {
  try {
    const response = await API.get('/orders/seller/trucks/');
    return response.data;
  } catch (error) {
    console.error('Error fetching seller trucks:', error);
    throw error;
  }
};

// Seller Page API
export const getSellerProducts = async (sellerId) => {
  try {
    const response = await API.get(`/auctions/seller/${sellerId}/products/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

export const getSellerOpenBids = async (sellerId) => {
  try {
    const response = await API.get(`/auctions/seller/${sellerId}/bids/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller open bids:', error);
    throw error;
  }
};

export const getSellerOrderHistory = async (sellerId) => {
  try {
    const response = await API.get(`/auctions/seller/${sellerId}/orders/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller order history:', error);
    throw error;
  }
};

export const sendChatMessage = async (message) => {
  try {
    const response = await API.post(endpoints.chat, { message });
    return response.data;
  } catch (error) {
    console.error("[Chat API] Error sending message:", error);
    return "Sorry, I couldn't reach the assistant. Please try again later.";
  }
};

// Fetch warehouse details by ID
export const getWarehouseDetails = (warehouseId) => {
  return API.get(`/inventory/warehouses/${warehouseId}/`);
};

export {API};