// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('ca_token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - show access denied message
      console.error('Access denied');
    } else if (error.response?.status >= 500) {
      // Server error - show generic error message
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  // Get current user
  getUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/change-password', passwordData);
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/password/email', { email });
    return response.data;
  },
};

// Documents API functions
export const documentsAPI = {
  // Get all documents
  getDocuments: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  // Upload document
  uploadDocument: async (formData, onProgress = null) => {
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      } : undefined,
    });
    return response.data;
  },

  // Download document
  downloadDocument: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },

  // Update document metadata
  updateDocument: async (documentId, updateData) => {
    const response = await api.put(`/documents/${documentId}`, updateData);
    return response.data;
  },

  // Search documents
  searchDocuments: async (query, filters = {}) => {
    const response = await api.get('/documents/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Get document categories
  getCategories: async () => {
    const response = await api.get('/documents/categories');
    return response.data;
  },
};

// Dashboard API functions
export const dashboardAPI = {
  // Get dashboard stats
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get recent documents
  getRecentDocuments: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-documents', {
      params: { limit }
    });
    return response.data;
  },

  // Get storage usage
  getStorageUsage: async () => {
    const response = await api.get('/dashboard/storage-usage');
    return response.data;
  },
};

// System API functions
export const systemAPI = {
  // Check system health
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Get system notifications
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
};

// Utility functions
export const utils = {
  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format date
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Download file helper
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Handle API errors
  handleApiError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.response?.data?.errors) {
      // Handle validation errors
      const errors = error.response.data.errors;
      return Object.values(errors).flat().join(', ');
    } else if (error.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred';
    }
  },
};

export default api;