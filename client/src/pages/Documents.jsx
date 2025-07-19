// src/pages/Documents.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  Upload,
  FolderOpen,
  Calendar,
  FileIcon,
  MoreHorizontal,
  Eye,
  Share,
  Archive
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Documents = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'tax-returns', label: 'Tax Returns' },
    { value: 'financial-statements', label: 'Financial Statements' },
    { value: 'audit-reports', label: 'Audit Reports' },
    { value: 'gst-returns', label: 'GST Returns' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'others', label: 'Others' }
  ];

  // Sample documents data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDocuments([
        {
          id: 1,
          name: 'Annual Tax Return - ABC Corp.pdf',
          category: 'tax-returns',
          size: '2.4 MB',
          uploadedAt: '2024-07-15',
          status: 'completed',
          client: 'ABC Corporation',
          tags: ['tax', 'annual', '2024']
        },
        {
          id: 2,
          name: 'Financial Statement Q4 2023.xlsx',
          category: 'financial-statements',
          size: '1.8 MB',
          uploadedAt: '2024-07-14',
          status: 'processing',
          client: 'XYZ Ltd.',
          tags: ['financial', 'q4', '2023']
        },
        {
          id: 3,
          name: 'Audit Report - Tech Solutions.pdf',
          category: 'audit-reports',
          size: '3.2 MB',
          uploadedAt: '2024-07-13',
          status: 'completed',
          client: 'Tech Solutions',
          tags: ['audit', 'compliance']
        },
        {
          id: 4,
          name: 'GST Return March 2024.pdf',
          category: 'gst-returns',
          size: '856 KB',
          uploadedAt: '2024-07-12',
          status: 'review',
          client: 'Small Business Inc.',
          tags: ['gst', 'march', '2024']
        },
        {
          id: 5,
          name: 'Service Agreement - Consulting.docx',
          category: 'contracts',
          size: '245 KB',
          uploadedAt: '2024-07-11',
          status: 'completed',
          client: 'Consulting Firm',
          tags: ['contract', 'service']
        },
        {
          id: 6,
          name: 'Invoice Template 2024.xlsx',
          category: 'invoices',
          size: '125 KB',
          uploadedAt: '2024-07-10',
          status: 'completed',
          client: 'Multiple Clients',
          tags: ['invoice', 'template']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter documents based on search and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconClass = "w-8 h-8";
    
    switch (extension) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'xlsx':
      case 'xls':
        return <FileIcon className={`${iconClass} text-green-600`} />;
      case 'docx':
      case 'doc':
        return <FileIcon className={`${iconClass} text-blue-600`} />;
      default:
        return <FileText className={`${iconClass} text-ca-neutral`} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ca-light">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="lg:ml-64 pt-16">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                ))}
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
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-ca-dark">Documents</h1>
                <p className="text-ca-neutral mt-1">
                  Manage and organize your client documents securely
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button asChild className="bg-ca-primary hover:bg-blue-700">
                  <Link to="/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="ca-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <FileText className="w-6 h-6 text-ca-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-ca-neutral">Total Documents</p>
                    <p className="text-2xl font-bold text-ca-dark">{documents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ca-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-50">
                    <FolderOpen className="w-6 h-6 text-ca-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-ca-neutral">Categories</p>
                    <p className="text-2xl font-bold text-ca-dark">{categories.length - 1}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ca-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-ca-neutral">This Month</p>
                    <p className="text-2xl font-bold text-ca-dark">
                      {documents.filter(doc => 
                        new Date(doc.uploadedAt).getMonth() === new Date().getMonth()
                      ).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ca-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-50">
                    <Archive className="w-6 h-6 text-ca-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-ca-neutral">Storage Used</p>
                    <p className="text-2xl font-bold text-ca-dark">68%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Section */}
          <Card className="ca-shadow border-0 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-ca-neutral" />
                    <Input
                      placeholder="Search documents, clients, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          {filteredDocuments.length === 0 ? (
            <Card className="ca-shadow border-0">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-ca-neutral mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-ca-dark mb-2">No documents found</h3>
                <p className="text-ca-neutral mb-4">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'Upload your first document to get started'
                  }
                </p>
                <Button asChild className="bg-ca-primary hover:bg-blue-700">
                  <Link to="/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="ca-shadow border-0 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(document.name)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-semibold text-ca-dark truncate">
                            {document.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {document.client}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-ca-neutral">
                        <span>{document.size}</span>
                        <span>{formatDate(document.uploadedAt)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {getStatusBadge(document.status)}
                        <Badge variant="outline" className="text-xs">
                          {categories.find(cat => cat.value === document.category)?.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{document.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Documents;