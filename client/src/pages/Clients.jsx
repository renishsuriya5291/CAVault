// =============================================================================
// CLIENT MANAGEMENT PAGE (src/pages/Clients.jsx)
// =============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Eye,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { clientsAPI, handleApiError, clientHelpers } from '../services/api';

const Clients = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Main state
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    gst_number: '',
    pan_number: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    status: 'active'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch clients
  const fetchClients = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const response = await clientsAPI.getClients(params);
      
      if (response.data.success) {
        setClients(response.data.data.data || []);
        setCurrentPage(response.data.data.current_page || 1);
        setTotalPages(response.data.data.last_page || 1);
        setTotalClients(response.data.data.total || 0);
      } else {
        throw new Error(response.data.message || 'Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchClients();
  }, [currentPage, perPage, sortBy, sortOrder, statusFilter]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchClients();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle refresh
  const handleRefresh = () => {
    fetchClients(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormErrors({});

    try {
      let response;
      if (modalMode === 'create') {
        response = await clientsAPI.createClient(formData);
      } else {
        response = await clientsAPI.updateClient(selectedClient.id, formData);
      }

      if (response.data.success) {
        setShowModal(false);
        fetchClients();
        resetForm();
      } else {
        if (response.data.errors) {
          setFormErrors(response.data.errors);
        } else {
          throw new Error(response.data.message || 'Failed to save client');
        }
      }
    } catch (error) {
      console.error('Error saving client:', error);
      const errorInfo = handleApiError(error);
      if (errorInfo.errors) {
        setFormErrors(errorInfo.errors);
      } else {
        setError(errorInfo.message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [clientId]: true }));
      
      const response = await clientsAPI.deleteClient(clientId);
      
      if (response.data.success) {
        setClients(prev => prev.filter(client => client.id !== clientId));
        setTotalClients(prev => prev - 1);
      } else {
        throw new Error(response.data.message || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      const errorInfo = handleApiError(error);
      alert(`Error deleting client: ${errorInfo.message}`);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [clientId]: false }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company_name: '',
      gst_number: '',
      pan_number: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      status: 'active'
    });
    setFormErrors({});
    setSelectedClient(null);
  };

  // Open modal for create
  const handleCreate = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  // Open modal for edit
  const handleEdit = (client) => {
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company_name: client.company_name || '',
      gst_number: client.gst_number || '',
      pan_number: client.pan_number || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      pincode: client.pincode || '',
      country: client.country || 'India',
      status: client.status || 'active'
    });
    setSelectedClient(client);
    setModalMode('edit');
    setShowModal(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
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
                <p className="text-ca-neutral">Loading clients...</p>
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
                <h1 className="text-3xl font-bold text-ca-dark">Client Management</h1>
                <p className="text-ca-neutral mt-1">
                  Manage your clients and their document portfolios
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
                <Button asChild variant="outline">
                  <Link to="/documents">
                    <FileText className="w-4 h-4 mr-2" />
                    View Documents
                  </Link>
                </Button>
                <Button onClick={handleCreate} className="bg-ca-primary hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="ca-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Users className="w-6 h-6 text-ca-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-ca-neutral">Total Clients</p>
                    <p className="text-2xl font-bold text-ca-dark">{totalClients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ca-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-50">
                    <Building2 className="w-6 h-6 text-ca-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-ca-neutral">Active Clients</p>
                    <p className="text-2xl font-bold text-ca-dark">
                      {clients.filter(client => client.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ca-shadow border-0">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-ca-neutral">Avg Documents</p>
                    <p className="text-2xl font-bold text-ca-dark">
                      {totalClients > 0 ? Math.round(clients.reduce((sum, client) => sum + (client.document_count || 0), 0) / totalClients) : 0}
                    </p>
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
                      placeholder="Search clients by name, email, company, or GST number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="created_at-desc">Newest First</SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery || (statusFilter && statusFilter !== 'all')) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clients List */}
          {clients.length === 0 ? (
            <Card className="ca-shadow border-0">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-ca-neutral mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-ca-dark mb-2">No clients found</h3>
                <p className="text-ca-neutral mb-4">
                  {searchQuery || (statusFilter && statusFilter !== 'all')
                    ? 'Try adjusting your search criteria' 
                    : 'Add your first client to get started'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  {(searchQuery || (statusFilter && statusFilter !== 'all')) && (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                  <Button onClick={handleCreate} className="bg-ca-primary hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 mb-6">
                {clients.map((client) => (
                  <Card key={client.id} className="ca-shadow border-0 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 rounded-lg bg-blue-50">
                            <Building2 className="w-6 h-6 text-ca-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-ca-dark">
                                {client.name}
                              </h3>
                              <Badge className={client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {client.status}
                              </Badge>
                            </div>
                            
                            {client.company_name && (
                              <p className="text-sm text-ca-neutral mb-1">{client.company_name}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-4 text-sm text-ca-neutral">
                              {client.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {client.email}
                                </div>
                              )}
                              {client.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {client.phone}
                                </div>
                              )}
                              {client.address && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {client.address}
                                </div>
                              )}
                            </div>
                            
                            {(client.gst_number || client.pan_number) && (
                              <div className="flex gap-4 mt-2 text-xs text-ca-neutral">
                                {client.gst_number && <span>GST: {client.gst_number}</span>}
                                {client.pan_number && <span>PAN: {client.pan_number}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <p className="text-sm font-medium text-ca-dark">
                              {client.document_count || 0} Documents
                            </p>
                            <p className="text-xs text-ca-neutral">
                              {client.recent_document || 'No documents'}
                            </p>
                          </div>
                          
                          <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(client.id)}
                            disabled={deleteLoading[client.id]}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleteLoading[client.id] ? (
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
                        Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalClients)} of {totalClients} clients
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
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
                                onClick={() => setCurrentPage(page)}
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
                                onClick={() => setCurrentPage(totalPages)}
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
                          onClick={() => setCurrentPage(currentPage + 1)}
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

          {/* Client Modal */}
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {modalMode === 'create' ? 'Add New Client' : 'Edit Client'}
                </DialogTitle>
                <DialogDescription>
                  {modalMode === 'create' 
                    ? 'Enter the client details below. Fields marked with * are required.'
                    : 'Update the client information below.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Client full name"
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && <p className="text-xs text-red-500">{formErrors.name[0]}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Company or business name"
                      className={formErrors.company_name ? 'border-red-500' : ''}
                    />
                    {formErrors.company_name && <p className="text-xs text-red-500">{formErrors.company_name[0]}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="client@example.com"
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && <p className="text-xs text-red-500">{formErrors.email[0]}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 9876543210"
                      className={formErrors.phone ? 'border-red-500' : ''}
                    />
                    {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone[0]}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input
                      id="gst_number"
                      value={formData.gst_number}
                      onChange={(e) => setFormData({...formData, gst_number: e.target.value.toUpperCase()})}
                      placeholder="22AAAAA0000A1Z5"
                      className={formErrors.gst_number ? 'border-red-500' : ''}
                    />
                    {formErrors.gst_number && <p className="text-xs text-red-500">{formErrors.gst_number[0]}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pan_number">PAN Number</Label>
                    <Input
                      id="pan_number"
                      value={formData.pan_number}
                      onChange={(e) => setFormData({...formData, pan_number: e.target.value.toUpperCase()})}
                      placeholder="ABCDE1234F"
                      className={formErrors.pan_number ? 'border-red-500' : ''}
                    />
                    {formErrors.pan_number && <p className="text-xs text-red-500">{formErrors.pan_number[0]}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Complete address"
                    className={formErrors.address ? 'border-red-500' : ''}
                  />
                  {formErrors.address && <p className="text-xs text-red-500">{formErrors.address[0]}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="City"
                      className={formErrors.city ? 'border-red-500' : ''}
                    />
                    {formErrors.city && <p className="text-xs text-red-500">{formErrors.city[0]}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="State"
                      className={formErrors.state ? 'border-red-500' : ''}
                    />
                    {formErrors.state && <p className="text-xs text-red-500">{formErrors.state[0]}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      placeholder="123456"
                      className={formErrors.pincode ? 'border-red-500' : ''}
                    />
                    {formErrors.pincode && <p className="text-xs text-red-500">{formErrors.pincode[0]}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      placeholder="India"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={formLoading}
                    className="bg-ca-primary hover:bg-blue-700"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {modalMode === 'create' ? 'Creating...' : 'Updating...'}
                      </>
                    ) : (
                      modalMode === 'create' ? 'Create Client' : 'Update Client'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default Clients;
