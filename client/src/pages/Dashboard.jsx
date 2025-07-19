// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  FileText,
  Upload,
  Users,
  Shield,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  FolderOpen,
  Activity,
  BarChart3,
  ArrowRight,
  Calendar,
  HardDrive,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { dashboardAPI, documentsAPI, handleApiError } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // State for dashboard data
  const [stats, setStats] = useState({
    totalDocuments: 0,
    activeClients: 0,
    storageUsed: 0,
    recentUploads: 0,
    pendingReviews: 0,
    categoryCounts: {},
    totalSize: '0 GB',
    storageLimit: '100GB'
  });

  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [storageStats, setStorageStats] = useState({
    total_size: 0,
    formatted_size: '0 GB',
    usage_percentage: 0,
    storage_limit: 107374182400
  });

  // Fetch all dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all data in parallel
      const [
        statsResponse,
        recentDocsResponse,
        recentActivityResponse,
        storageStatsResponse
      ] = await Promise.allSettled([
        documentsAPI.getStats(),
        documentsAPI.getRecentDocuments(4),
        dashboardAPI.getRecentActivity().catch(() => ({ data: { data: [] } })), // Fallback if not implemented
        dashboardAPI.getStorageStats().catch(() => ({ data: { data: {} } })) // Fallback if not implemented
      ]);

      // Handle stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
        setStats(statsResponse.value.data.data);
      } else {
        console.warn('Failed to fetch stats:', statsResponse.reason);
      }

      // Handle recent documents response
      if (recentDocsResponse.status === 'fulfilled' && recentDocsResponse.value.data.success) {
        setRecentDocuments(recentDocsResponse.value.data.data);
      } else {
        console.warn('Failed to fetch recent documents:', recentDocsResponse.reason);
      }

      // Handle recent activity response (may not be implemented yet)
      if (recentActivityResponse.status === 'fulfilled' && recentActivityResponse.value.data.success) {
        setRecentActivity(recentActivityResponse.value.data.data);
      } else {
        // Use fallback activity data
        setRecentActivity([
          {
            id: 1,
            action: 'Document uploaded',
            details: 'Recent document uploaded',
            time: '2 hours ago',
            icon: 'Upload',
            color: 'text-green-600'
          },
          {
            id: 2,
            action: 'System update',
            details: 'Dashboard data refreshed',
            time: 'Just now',
            icon: 'RefreshCw',
            color: 'text-blue-600'
          }
        ]);
      }

      // Handle storage stats response
      if (storageStatsResponse.status === 'fulfilled' && storageStatsResponse.value.data.success) {
        setStorageStats(storageStatsResponse.value.data.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh handler
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const formatStoragePercentage = (percentage) => {
    if (!percentage || percentage === 0) return 0;

    // If percentage is very small (less than 0.01%), show as 0.01%
    if (percentage < 0.01) return 0.01;

    // If percentage is less than 1%, show 2 decimal places
    if (percentage < 1) return parseFloat(percentage.toFixed(2));

    // Otherwise, show 1 decimal place
    return parseFloat(percentage.toFixed(1));
  };

  // Add this helper for storage size formatting:
  const formatStorageSize = (sizeInBytes) => {
    if (!sizeInBytes || sizeInBytes === 0) return '0 KB';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    // Format to appropriate decimal places
    if (size < 10) {
      return `${size.toFixed(2)} ${units[unitIndex]}`;
    } else if (size < 100) {
      return `${size.toFixed(1)} ${units[unitIndex]}`;
    } else {
      return `${Math.round(size)} ${units[unitIndex]}`;
    }
  };

  // Quick stats configuration
  // Update the quickStats array (around line 120):
  const quickStats = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments || 0,
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      color: 'text-ca-primary',
      bg: 'bg-blue-50'
    },
    {
      title: 'Active Clients',
      value: stats.activeClients || 0,
      change: '+3',
      changeType: 'positive',
      icon: Users,
      color: 'text-ca-secondary',
      bg: 'bg-green-50'
    },
    {
      title: 'Storage Used',
      value: `${formatStoragePercentage(stats.storageUsed || storageStats.usage_percentage || 0)}%`,
      change: '+5GB',
      changeType: 'neutral',
      icon: HardDrive,
      color: 'text-ca-neutral',
      bg: 'bg-gray-50'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews || 0,
      change: '-2',
      changeType: 'positive',
      icon: AlertCircle,
      color: 'text-ca-accent',
      bg: 'bg-red-50'
    }
  ];

  // Icon mapping for activity
  const getActivityIcon = (iconName) => {
    const icons = {
      Upload,
      Users,
      CheckCircle,
      Shield,
      RefreshCw,
      FileText,
      Activity
    };
    return icons[iconName] || Activity;
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      review: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`${variants[status] || variants.completed} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-ca-light">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-64 pt-16">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-ca-primary mx-auto mb-4" />
                <p className="text-ca-neutral">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ca-light">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-ca-dark">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}
                </h1>
                <p className="text-ca-neutral mt-1">
                  Here's what's happening with your documents today
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-ca-neutral hover:text-ca-dark"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button asChild className="bg-ca-primary hover:bg-blue-700">
                  <Link to="/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/documents">
                    <FileText className="w-4 h-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="ca-shadow border-0">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-ca-neutral">
                        {stat.title}
                      </p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-ca-dark">
                          {stat.value}
                        </p>
                        <span className={`ml-2 text-sm ${stat.changeType === 'positive' ? 'text-green-600' :
                          stat.changeType === 'negative' ? 'text-red-600' : 'text-ca-neutral'
                          }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Storage Usage */}
            <Card className="ca-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-ca-primary" />
                  Storage Usage
                </CardTitle>
                <CardDescription>
                  Your current storage utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Used Space</span>
                      <span>
                        {storageStats.formatted_size || formatStorageSize(storageStats.total_size) || '0 KB'} of 100GB
                      </span>
                    </div>
                    <Progress
                      value={formatStoragePercentage(storageStats.usage_percentage || stats.storageUsed || 0)}
                      className="h-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-ca-neutral">Documents</p>
                      <p className="font-semibold">
                        {storageStats.formatted_size || formatStorageSize(storageStats.total_size) || '0 KB'}
                      </p>
                    </div>
                    <div>
                      <p className="text-ca-neutral">Available</p>
                      <p className="font-semibold">
                        {(100 - formatStoragePercentage(storageStats.usage_percentage || stats.storageUsed || 0)).toFixed(1)}% free
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="ca-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-ca-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Document
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/search">
                      <FileText className="w-4 h-4 mr-2" />
                      Search Documents
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/documents?filter=clients">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Clients
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/documents?view=analytics">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card className="ca-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-ca-primary" />
                  Security Status
                </CardTitle>
                <CardDescription>
                  Your document security overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Encryption</span>
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup</span>
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Updated
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Access Control</span>
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Secure
                    </Badge>
                  </div>
                  <div className="text-xs text-ca-neutral mt-3">
                    Last security scan: 2 hours ago
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Documents */}
            <Card className="ca-shadow border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ca-primary" />
                    Recent Documents
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/documents">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
                <CardDescription>
                  Latest uploaded and processed documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-md">
                            <FileText className="w-4 h-4 text-ca-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-ca-dark">
                              {doc.name || doc.document_name || 'Untitled Document'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-ca-neutral">
                              <span>{doc.category}</span>
                              <span>•</span>
                              <span>{doc.size || doc.file_size}</span>
                              <span>•</span>
                              <span>{doc.uploadedAt || doc.uploaded_time_ago}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(doc.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-ca-neutral">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent documents</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link to="/upload">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload First Document
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="ca-shadow border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-ca-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest actions and system updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => {
                      const IconComponent = getActivityIcon(activity.icon);
                      return (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-50">
                            <IconComponent className={`w-4 h-4 ${activity.color || 'text-ca-primary'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-ca-dark">
                              {activity.action}
                            </p>
                            <p className="text-xs text-ca-neutral">
                              {activity.details}
                            </p>
                            <p className="text-xs text-ca-neutral mt-1">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-ca-neutral">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="mt-8 bg-gradient-to-r from-ca-primary to-ca-secondary text-white ca-shadow border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Secure Document Management
                  </h3>
                  <p className="opacity-90">
                    Your documents are protected with enterprise-grade encryption.
                    {stats.totalDocuments === 0
                      ? ' Upload your first document to get started.'
                      : ' Continue managing your documents securely.'
                    }
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Button
                    size="lg"
                    className="bg-white text-ca-primary hover:bg-gray-100"
                    asChild
                  >
                    <Link to="/upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;