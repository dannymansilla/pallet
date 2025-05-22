const BASE_URL = "https://hiaiden.com";

const endpoints = {
  login: `${BASE_URL}/accounts/login/`,
  refresh: `${BASE_URL}/accounts/login/refresh/`,
  logout: `${BASE_URL}/accounts/logout/`,
  register: `${BASE_URL}/accounts/register/`,
  profile: `${BASE_URL}/accounts/profile/`,
  acceptTerms: (companyId) => `${BASE_URL}/accounts/accept-terms/`,
  
  // Admin endpoints
  adminListOrganizations: `${BASE_URL}/accounts/admin/organizations/`,
  adminPendingOrganizations: `${BASE_URL}/accounts/admin/organizations/pending/`,
  adminApproveOrganization: (orgId) => `${BASE_URL}/accounts/admin/organizations/${orgId}/approve/`,
  
  // Registration endpoint
  companyRegister: `${BASE_URL}/accounts/register/`,
  chat: `${BASE_URL}/chat/chat/`,
};

export default endpoints;
