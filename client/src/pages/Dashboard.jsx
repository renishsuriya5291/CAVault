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
  HardDrive
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    activeClients: 0,
    storageUsed: 0,
    recentUploads: 0,
    pendingReviews: 0
  });

  // Simulate loading dashboard data
  useEffect(() => {
    // In real app, this would be an API call
    setTimeout(() => {
      setStats({
        totalDocuments: 247,
        activeClients: 34,
        storageUsed: 68,
        recentUploads: 12,
        pendingReviews: 5
      });
    }, 1000);
  }, []);

  const quickStats = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      color: 'text-ca-primary',
      bg: 'bg-blue-50'
    },
    {
      title: 'Active Clients',
      value: stats.activeClients,
      change: '+3',
      changeType: 'positive',
      icon: Users,
      color: 'text-ca-secondary',
      bg: 'bg-green-50'
    },
    {
      title: 'Storage Used',
      value: `${stats.storageUsed}%`,
      change: '+5GB',
      changeType: 'neutral',
      icon: HardDrive,
      color: 'text-ca-neutral',
      bg: 'bg-gray-50'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      change: '-2',
      changeType: 'positive',
      icon: AlertCircle,
      color: 'text-ca-accent',
      bg: 'bg-red-50'
    }
  ];

  const recentDocuments = [
    {
      id: 1,
      name: 'Annual Tax Return - ABC Corp',
      category: 'Tax Returns',
      uploadedAt: '2 hours ago',
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Financial Statement Q4',
      category: 'Financial Reports',
      uploadedAt: '4 hours ago',
      status: 'processing',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Audit Report - XYZ Ltd',
      category: 'Audit Documents',
      uploadedAt: '1 day ago',
      status: 'completed',
      size: '3.2 MB'
    },
    {
      id: 4,
      name: 'GST Return March 2024',
      category: 'Tax Returns',
      uploadedAt: '2 days ago',
      status: 'review',
      size: '856 KB'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Document uploaded',
      details: 'Annual Tax Return - ABC Corp',
      time: '2 hours ago',
      icon: Upload,
      color: 'text-green-600'
    },
    {
      id: 2,
      action: 'Client added',
      details: 'New client: Tech Solutions Ltd',
      time: '5 hours ago',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 3,
      action: 'Document reviewed',
      details: 'Financial Statement Q3',
      time: '1 day ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 4,
      action: 'Security scan completed',
      details: 'All documents verified',
      time: '2 days ago',
      icon: Shield,
      color: 'text-ca-primary'
    }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      review: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={`${variants[status]} border-0`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-ca-light">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="lg:ml-64 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-ca-dark">
                  Welcome back, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-ca-neutral mt-1">
                  Here's what's happening with your documents today
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
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
                        <span className={`ml-2 text-sm ${
                          stat.changeType === 'positive' ? 'text-green-600' : 
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
                      <span>{stats.storageUsed}% of 100GB</span>
                    </div>
                    <Progress value={stats.storageUsed} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-ca-neutral">Documents</p>
                      <p className="font-semibold">{stats.storageUsed}GB</p>
                    </div>
                    <div>
                      <p className="text-ca-neutral">Available</p>
                      <p className="font-semibold">{100 - stats.storageUsed}GB</p>
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
                    <Link to="/clients">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Clients
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/reports">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Report
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
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-md">
                          <FileText className="w-4 h-4 text-ca-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-ca-dark">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-ca-neutral">
                            <span>{doc.category}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.uploadedAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(doc.status)}
                      </div>
                    </div>
                  ))}
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
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gray-50`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
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
                  ))}
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
                    Your documents are protected with enterprise-grade encryption. Upload more documents to get started.
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