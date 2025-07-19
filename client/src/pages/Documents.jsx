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
  Archive,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { documentsAPI, handleApiError } from '../services/api';

const Documents = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Main state
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('upload_date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  
  // UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState({});

  // Fetch documents with filters
  const fetchDocuments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Build query parameters
      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Add filters if they exist
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedClient.trim()) params.client = selectedClient.trim();
      if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;

      const response = await documentsAPI.getDocuments(params);
      
      if (response.data.success) {
        setDocuments(response.data.data.data || []);
        setCurrentPage(response.data.data.current_page || 1);
        setTotalPages(response.data.data.last_page || 1);
        setTotalDocuments(response.data.data.total || 0);
        
        // Update stats if available
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await documentsAPI.getCategories();
      if (response.data.success) {
        setCategories([
          { value: 'all', label: 'All Categories' },
          ...response.data.data
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { value: 'all', label: 'All Categories' },
        { value: 'Tax Returns', label: 'Tax Returns' },
        { value: 'Financial Statements', label: 'Financial Statements' },
        { value: 'Audit Reports', label: 'Audit Reports' },
        { value: 'GST Returns', label: 'GST Returns' },
        { value: 'Other', label: 'Other' }
      ]);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await documentsAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  // Fetch documents when filters change
  useEffect(() => {
    fetchDocuments();
  }, [currentPage, perPage, sortBy, sortOrder, selectedCategory, selectedStatus]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchDocuments();
      } else {
        setCurrentPage(1); // This will trigger fetchDocuments via the above useEffect
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedClient]);

  // Handle refresh
  const handleRefresh = () => {
    fetchDocuments(true);
    fetchStats();
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [documentId]: true }));
      
      const response = await documentsAPI.deleteDocument(documentId);
      
      if (response.data.success) {
        // Remove document from state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        setTotalDocuments(prev => prev - 1);
        
        // Show success message (you can implement toast here)
        console.log('Document deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      const errorInfo = handleApiError(error);
      alert(`Error deleting document: ${errorInfo.message}`);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [documentId]: false }));
    }
  };

  // Handle document download
  const handleDownloadDocument = async (documentId, documentName) => {
    try {
      const response = await documentsAPI.downloadDocument(documentId);
      
      if (response.data.success && response.data.download_url) {
        // Open download URL in new tab
        window.open(response.data.download_url, '_blank');
      } else {
        throw new Error('Failed to get download URL');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      const errorInfo = handleApiError(error);
      alert(`Error downloading document: ${errorInfo.message}`);
    }
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
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </Badge>
    );
  };

  // File icon helper
  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
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
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileIcon className={`${iconClass} text-purple-600`} />;
      default:
        return <FileText className={`${iconClass} text-ca-neutral`} />;
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Pagination helper
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedClient('');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-ca-light">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="lg:ml-64 pt-16">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-ca-primary mx-auto mb-4" />
                <p className="text-ca-neutral">Loading documents...</p>
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

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-ca-dark">Documents</h1>
                <p className="text-ca-neutral mt-1">
                  Manage and organize your client documents securely
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
                    <p className="text-2xl font-bold text-ca-dark">
                      {stats.totalDocuments || totalDocuments || 0}
                    </p>
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
                    <p className="text-2xl font-bold text-ca-dark">
                      {Object.keys(stats.categoryCounts || {}).length || categories.length - 1}
                    </p>
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
                      {stats.recentUploads || 0}
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
                    <p className="text-2xl font-bold text-ca-dark">
                      {stats.storageUsed || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Section */}
          <Card className="ca-shadow border-0 mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search and View Toggle */}
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
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Filter by client..."
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full sm:w-48"
                  />

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upload_date-desc">Newest First</SelectItem>
                      <SelectItem value="upload_date-asc">Oldest First</SelectItem>
                      <SelectItem value="document_name-asc">Name A-Z</SelectItem>
                      <SelectItem value="document_name-desc">Name Z-A</SelectItem>
                      <SelectItem value="file_size-desc">Size Large-Small</SelectItem>
                      <SelectItem value="file_size-asc">Size Small-Large</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchQuery || (selectedCategory && selectedCategory !== 'all') || selectedClient || (selectedStatus && selectedStatus !== 'all')) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Display */}
          {documents.length === 0 ? (
            <Card className="ca-shadow border-0">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-ca-neutral mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-ca-dark mb-2">No documents found</h3>
                <p className="text-ca-neutral mb-4">
                  {searchQuery || (selectedCategory && selectedCategory !== 'all') || selectedClient || (selectedStatus && selectedStatus !== 'all')
                    ? 'Try adjusting your search criteria' 
                    : 'Upload your first document to get started'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  {(searchQuery || (selectedCategory && selectedCategory !== 'all') || selectedClient || (selectedStatus && selectedStatus !== 'all')) && (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                  <Button asChild className="bg-ca-primary hover:bg-blue-700">
                    <Link to="/upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Documents Grid/List */}
              <div className={`grid gap-6 mb-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {documents.map((document) => (
                  <Card key={document.id} className="ca-shadow border-0 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(document.document_name || document.name)}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold text-ca-dark truncate">
                              {document.document_name || document.name || 'Untitled Document'}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {document.client_name || document.client || 'Unknown Client'}
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
                          <span>{document.file_size || document.size || 'Unknown size'}</span>
                          <span>{formatDate(document.upload_date || document.uploadedAt)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {getStatusBadge(document.status)}
                          <Badge variant="outline" className="text-xs">
                            {document.category || 'Uncategorized'}
                          </Badge>
                        </div>

                        {document.tags && document.tags.length > 0 && (
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
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleDownloadDocument(document.id, document.document_name || document.name)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteDocument(document.id)}
                            disabled={deleteLoading[document.id]}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleteLoading[document.id] ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Card className="ca-shadow border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-ca-neutral">
                        Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalDocuments)} of {totalDocuments} documents
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            );
                          })}
                          {totalPages > 5 && (
                            <>
                              <span className="text-ca-neutral">...</span>
                              <Button
                                variant={currentPage === totalPages ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(totalPages)}
                                className="w-8 h-8 p-0"
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Documents;