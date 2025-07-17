// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: localStorage.getItem('ca_token'),
    loading: true,
    isAuthenticated: false,
  });

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('ca_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      verifyToken();
    } else {
      setAuth(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Verify token and get user information
  const verifyToken = async () => {
    try {
      const response = await axios.get('/api/user');
      setAuth(prev => ({
        ...prev,
        user: response.data,
        loading: false,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setAuth(prev => ({ ...prev, loading: true }));
      
      const response = await axios.post('/api/login', { 
        email, 
        password 
      });
      
      const { user, token } = response.data;
      
      // Store token
      localStorage.setItem('ca_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAuth({
        user,
        token,
        loading: false,
        isAuthenticated: true,
      });
      
      return { success: true, user };
    } catch (error) {
      setAuth(prev => ({ ...prev, loading: false }));
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Login failed. Please try again.';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setAuth(prev => ({ ...prev, loading: true }));
      
      const response = await axios.post('/api/register', userData);
      const { user, token } = response.data;
      
      // Store token
      localStorage.setItem('ca_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAuth({
        user,
        token,
        loading: false,
        isAuthenticated: true,
      });
      
      return { success: true, user };
    } catch (error) {
      setAuth(prev => ({ ...prev, loading: false }));
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors ||
                          'Registration failed. Please try again.';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call backend logout endpoint
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clean up regardless of backend response
      localStorage.removeItem('ca_token');
      delete axios.defaults.headers.common['Authorization'];
      
      setAuth({
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/profile', profileData);
      
      setAuth(prev => ({
        ...prev,
        user: { ...prev.user, ...response.data }
      }));
      
      return { success: true, user: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/api/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  // Reset password request
  const requestPasswordReset = async (email) => {
    try {
      await axios.post('/api/password/email', { email });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Password reset request failed';
      return { success: false, error: errorMessage };
    }
  };

  // Check if user has specific role/permission
  const hasPermission = (permission) => {
    return auth.user?.permissions?.includes(permission) || false;
  };

  // Check if user is admin
  const isAdmin = () => {
    return auth.user?.role === 'admin' || false;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!auth.user?.name) return 'CA';
    return auth.user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Context value
  const value = {
    // State
    auth,
    user: auth.user,
    token: auth.token,
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    verifyToken,
    
    // Utilities
    hasPermission,
    isAdmin,
    getUserInitials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// HOC for protected routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ca-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

// Hook for API calls with auth
export const useAuthenticatedApi = () => {
  const { token, logout } = useAuth();

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });

  // Response interceptor to handle auth errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  return api;
};