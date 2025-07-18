// src/services/api.js
import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ca_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('ca_token');
      window.location.href = '/login';
    } else if (error.response?.status === 419) {
      // CSRF token mismatch - should not happen with API routes
      console.error('CSRF token mismatch');
    } else if (error.response?.status >= 500) {
      // Server errors
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/api/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/api/auth/login', credentials),
  
  // Get current user
  getUser: () => api.get('/api/auth/user'),
  
  // Logout current session
  logout: () => api.post('/api/auth/logout'),
  
  // Logout from all devices
  logoutAll: () => api.post('/api/auth/logout-all'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
  
  // Change password
  changePassword: (passwordData) => api.post('/api/auth/change-password', passwordData),
  
  // Request password reset
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (resetData) => api.post('/api/auth/reset-password', resetData),
};

// Documents API methods (for future use)
export const documentsAPI = {
  // Get all documents
  getDocuments: () => api.get('/api/documents'),
  
  // Upload document
  uploadDocument: (formData) => api.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Get document by ID
  getDocument: (id) => api.get(`/api/documents/${id}`),
  
  // Update document
  updateDocument: (id, data) => api.put(`/api/documents/${id}`, data),
  
  // Delete document
  deleteDocument: (id) => api.delete(`/api/documents/${id}`),
  
  // Download document
  downloadDocument: (id) => api.get(`/api/documents/${id}/download`, {
    responseType: 'blob',
  }),
};

// Dashboard API methods (for future use)
export const dashboardAPI = {
  // Get dashboard stats
  getStats: () => api.get('/api/dashboard/stats'),
  
  // Get recent documents
  getRecentDocuments: () => api.get('/api/dashboard/recent-documents'),
  
  // Get notifications
  getNotifications: () => api.get('/api/dashboard/notifications'),
};

export default api;