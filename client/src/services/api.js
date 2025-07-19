// src/services/api.js
import axios from 'axios';

// Configure base URL - centralized configuration
const API_BASE_URL =  'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
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
      // CSRF token mismatch
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
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user
  getUser: () => api.get('/auth/user'),
  
  // Logout current session
  logout: () => api.post('/auth/logout'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Change password
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Documents API methods
export const documentsAPI = {
  // Get all documents with optional filters
  getDocuments: (params = {}) => api.get('/documents', { params }),
  
  // Upload document
  uploadDocument: (formData) => api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Get document by ID
  getDocument: (id) => api.get(`/documents/${id}`),
  
  // Update document
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  
  // Delete document
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  
  // Download document
  downloadDocument: (id) => api.get(`/documents/${id}/download`),
  
  // Search documents
  searchDocuments: (params = {}) => api.get('/documents/search', { params }),
  
  // Get document statistics
  getStats: () => api.get('/documents/stats'),
  
  // Get recent documents
  getRecentDocuments: (params = {}) => api.get('/documents/recent', { params }),
  
  // Get document categories
  getCategories: () => api.get('/documents/categories'),
};

// Dashboard API methods
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: () => api.get('/documents/stats'),
  
  // Get recent documents
  getRecentDocuments: (limit = 4) => api.get('/documents/recent', { 
    params: { limit } 
  }),
  
  // Get recent activity
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  
  // Get storage statistics
  getStorageStats: () => api.get('/storage/stats'),
};

// Storage API methods
export const storageAPI = {
  // Get storage statistics
  getStats: () => api.get('/storage/stats'),
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  console.error('API error:', error);
  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      message: error.response.data?.message || 'An error occurred',
      errors: error.response.data?.errors || null,
      status: error.response.status,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      errors: null,
      status: null,
    };
  } else {
    // Something else happened
    return {
      success: false,
      message: 'An unexpected error occurred',
      errors: null,
      status: null,
    };
  }
};

// Export the configured axios instance as default
export default api;