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

  // Set up axios defaults with your Laravel backend URL
  useEffect(() => {
    // Configure axios base URL - update this to match your Laravel server
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    
    axios.defaults.baseURL = baseURL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';
    
    // For Sanctum SPA authentication
    axios.defaults.withCredentials = true;

    const token = localStorage.getItem('ca_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      verifyToken();
    } else {
      setAuth(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Get CSRF token from Laravel (for SPA authentication)
  const getCsrfToken = async () => {
    try {
      await axios.get('/sanctum/csrf-cookie');
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  };

  // Verify token and get user information
  const verifyToken = async () => {
    try {
      const response = await axios.get('/api/auth/user');
      
      // Handle different response structures
      const userData = response.data.success ? response.data.user : response.data;
      
      setAuth(prev => ({
        ...prev,
        user: userData,
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
      
      // For token-based authentication, we don't need CSRF cookie
      // await getCsrfToken();
      
      const response = await axios.post('/api/auth/login', { 
        email, 
        password 
      });
      
      console.log('Login response:', response.data); // Debug log
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
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
      } else {
        setAuth(prev => ({ ...prev, loading: false }));
        return { 
          success: false, 
          error: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      setAuth(prev => ({ ...prev, loading: false }));
      
      console.error('Login error:', error); // Debug log
      console.error('Error response:', error.response); // Debug log
      
      // Handle different error response structures
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.log('Error status:', status);
        console.log('Error data:', data);
        
        if (status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (status === 422) {
          // Validation errors
          if (data.errors) {
            errorMessage = Object.values(data.errors).flat().join(', ');
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 419) {
          errorMessage = 'Session expired. Please try again.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.error) {
          errorMessage = data.error;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and make sure the server is running.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the Laravel server is running on http://localhost:8000';
      }
      
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
      
      // For token-based authentication, we don't need CSRF cookie
      // await getCsrfToken();
      
      const response = await axios.post('/api/auth/register', userData);
      
      console.log('Register response:', response.data); // Debug log
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
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
      } else {
        setAuth(prev => ({ ...prev, loading: false }));
        return { 
          success: false, 
          error: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      setAuth(prev => ({ ...prev, loading: false }));
      
      console.error('Registration error:', error); // Debug log
      console.error('Error response:', error.response); // Debug log
      
      // Handle different error response structures
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.log('Error status:', status);
        console.log('Error data:', data);
        
        if (status === 422) {
          // Validation errors
          if (data.errors) {
            // Return errors object for field-specific error handling
            return { 
              success: false, 
              error: data.errors
            };
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 419) {
          errorMessage = 'Session expired. Please try again.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.error) {
          errorMessage = data.error;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and make sure the server is running.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the Laravel server is running on http://localhost:8000';
      }
      
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
      await axios.post('/api/auth/logout');
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

  // Logout from all devices
  const logoutAll = async () => {
    try {
      await axios.post('/api/auth/logout-all');
    } catch (error) {
      console.error('Logout all request failed:', error);
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
      const response = await axios.put('/api/auth/profile', profileData);
      
      if (response.data.success) {
        setAuth(prev => ({
          ...prev,
          user: { ...prev.user, ...response.data.data }
        }));
        
        return { success: true, user: response.data.data };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await axios.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  // Reset password request
  const requestPasswordReset = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.message };
      }
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
    logoutAll,
    updateProfile,
    changePassword,
    requestPasswordReset,
    verifyToken,
    getCsrfToken,
    
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
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    withCredentials: true,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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