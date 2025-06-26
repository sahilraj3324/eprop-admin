import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with admin authentication
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include admin authentication
adminApi.interceptors.request.use(
  (config) => {
    // The adminToken cookie will be automatically sent with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle admin authentication errors
adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Admin token is invalid or expired, redirect to admin login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const API_URLS = {
  // Admin endpoints
  ADMIN_SIGNUP: `${API_BASE_URL}/admin/signup`,
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_LOGOUT: `${API_BASE_URL}/admin/logout`,
  ADMIN_ME: `${API_BASE_URL}/admin/me`,
  ADMIN_LIST: `${API_BASE_URL}/admin`,
  ADMIN_BY_ID: (id) => `${API_BASE_URL}/admin/${id}`,
  ADMIN_UPDATE: (id) => `${API_BASE_URL}/admin/${id}`,
  ADMIN_DELETE: (id) => `${API_BASE_URL}/admin/${id}`,
  ADMIN_DELETE_ALL: `${API_BASE_URL}/admin`,

  // User management endpoints
  USER_LIST: `${API_BASE_URL}/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  USER_DELETE: (id) => `${API_BASE_URL}/users/${id}`,
  USER_DELETE_ALL: `${API_BASE_URL}/users`,

  // Property management endpoints
  PROPERTY_LIST: `${API_BASE_URL}/properties`,
  PROPERTY_BY_ID: (id) => `${API_BASE_URL}/properties/${id}`,
  PROPERTY_DELETE: (id) => `${API_BASE_URL}/properties/${id}`,
  PROPERTY_DELETE_ALL: `${API_BASE_URL}/properties`,

  // Item management endpoints
  ITEM_LIST: `${API_BASE_URL}/items`,
  ITEM_BY_ID: (id) => `${API_BASE_URL}/items/${id}`,
  ITEM_DELETE: (id) => `${API_BASE_URL}/items/${id}`,
  ITEM_DELETE_ALL: `${API_BASE_URL}/items`,
};

export default API_URLS; 