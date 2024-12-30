const BASE_URL = "http://localhost:8000/api";

const endpoints = {
  login: `${BASE_URL}/token/`,
  refresh: `${BASE_URL}/token/refresh/`,
  logout: `${BASE_URL}/logout/`,
  register: `${BASE_URL}/register/`,
  acceptTerms: (companyId) => `${BASE_URL}/companies/accept_terms/`,
};

export default endpoints;
