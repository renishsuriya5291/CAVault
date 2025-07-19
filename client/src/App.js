// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ToasterProvider from './components/ToasterProvider';

// Import your pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Help from './pages/Help';

// Protected Route wrapper
import { withAuth } from './hooks/useAuth';

// Wrap protected components
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedDocuments = withAuth(Documents);
const ProtectedUpload = withAuth(Upload);
const ProtectedSearch = withAuth(Search);
const ProtectedSettings = withAuth(Settings);
const ProtectedHelp = withAuth(Help);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Add Toaster Provider */}
          <ToasterProvider />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedDashboard />} />
            <Route path="/documents" element={<ProtectedDocuments />} />
            <Route path="/upload" element={<ProtectedUpload />} />
            <Route path="/search" element={<ProtectedSearch />} />
            <Route path="/settings" element={<ProtectedSettings />} />
            <Route path="/help" element={<ProtectedHelp />} />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 or other routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;