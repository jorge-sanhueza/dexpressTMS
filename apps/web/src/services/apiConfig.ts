export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://dexpressapi-production.up.railway.app");

export const API_ENDPOINTS = {
  AUTH: {
    TEST_LOGIN: `${API_BASE}/api/auth/test-login`,
    LOGIN: `${API_BASE}/api/auth/login`,
    PROFILE: `${API_BASE}/api/auth/profile`,
    REFRESH: `${API_BASE}/api/auth/refresh`,
  },
  USERS: `${API_BASE}/api/users`,
  ROLES: `${API_BASE}/api/roles`,
  PROFILES: `${API_BASE}/api/perfiles`,
  TENANTS: `${API_BASE}/api/tenants`,
};
