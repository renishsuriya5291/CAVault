// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
// import { Toaster } from '@/components/ui/toaster'; // Uncomment when ShadCN is working

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ca-light to-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ca-primary mx-auto mb-4"></div>
      <p className="text-ca-neutral">Loading CA Portal...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Main App Routes
const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ca-light to-white">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents" element={
          <ProtectedRoute>
            <Layout>
              <Documents />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Add more protected routes as needed */}
        <Route path="/upload" element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Upload Documents</h1>
                <p className="text-ca-neutral mt-2">Upload your secure documents here.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/search" element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Search Documents</h1>
                <p className="text-ca-neutral mt-2">Search through your document library.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-ca-neutral mt-2">Manage your account settings.</p>
              </div>
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ca-light to-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-ca-dark mb-4">404</h1>
              <p className="text-ca-neutral mb-4">Page not found</p>
              <a href="/dashboard" className="text-ca-primary hover:underline">
                Go to Dashboard
              </a>
            </div>
          </div>
        } />
      </Routes>
      
      {/* Uncomment when ShadCN toaster is working */}
      {/* <Toaster /> */}
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;