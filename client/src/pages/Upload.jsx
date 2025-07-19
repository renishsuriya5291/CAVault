// src/pages/Upload.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import {
  Upload as UploadIcon,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Lock,
  CloudUpload,
  FolderOpen,
  Plus,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Users,
  Building2,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { documentsAPI, clientsAPI, handleApiError } from '../services/api';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // File management state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    client_id: '', // UPDATED: Changed from client_name to client_id
    description: '',
    tags: ''
  });

  // Categories and clients state
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);

  // Error and success state
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);

  // NEW: Client creation modal state
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientFormData, setClientFormData] = useState({
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
  const [clientFormLoading, setClientFormLoading] = useState(false);
  const [clientFormErrors, setClientFormErrors] = useState({});

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchClients();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await documentsAPI.getCategories();

      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { value: 'Tax Returns', label: 'Tax Returns' },
        { value: 'Financial Statements', label: 'Financial Statements' },
        { value: 'Audit Reports', label: 'Audit Reports' },
        { value: 'GST Returns', label: 'GST Returns' },
        { value: 'Service Agreements', label: 'Service Agreements' },
        { value: 'Invoice Templates', label: 'Invoice Templates' },
        { value: 'Legal Documents', label: 'Legal Documents' },
        { value: 'Other', label: 'Other' }
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // NEW: Fetch client options
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await clientsAPI.getClientOptions();
      if (response.data.success) {
        setClients(response.data.data || []);
      } else {
        throw new Error('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. You can still upload by creating a new client.');
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // NEW: Handle client creation
  const handleCreateClient = async (e) => {
    e.preventDefault();
    setClientFormLoading(true);
    setClientFormErrors({});

    try {
      const response = await clientsAPI.createClient(clientFormData);

      if (response.data.success) {
        // Add new client to the list
        const newClient = {
          value: response.data.data.id,
          label: response.data.data.company_name
            ? `${response.data.data.name} (${response.data.data.company_name})`
            : response.data.data.name
        };
        setClients(prev => [...prev, newClient]);

        // Select the new client
        setFormData(prev => ({ ...prev, client_id: response.data.data.id }));

        // Close modal and reset form
        setShowClientModal(false);
        resetClientForm();

        // Show success message
        setError(null);
      } else {
        if (response.data.errors) {
          setClientFormErrors(response.data.errors);
        } else {
          throw new Error(response.data.message || 'Failed to create client');
        }
      }
    } catch (error) {
      console.error('Error creating client:', error);
      const errorInfo = handleApiError(error);
      if (errorInfo.errors) {
        setClientFormErrors(errorInfo.errors);
      } else {
        setError(errorInfo.message);
      }
    } finally {
      setClientFormLoading(false);
    }
  };

  // NEW: Reset client form
  const resetClientForm = () => {
    setClientFormData({
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
    setClientFormErrors({});
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      // Check file size (max 50MB per file)
      if (file.size > 50 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 50MB.`);
        return false;
      }

      // Check file type based on API documentation
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif'
      ];

      const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setError(`File "${file.name}" has an unsupported format. Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF`);
        return false;
      }

      // Check for duplicates
      const isDuplicate = selectedFiles.some(existingFile =>
        existingFile.file.name === file.name && existingFile.file.size === file.size
      );

      if (isDuplicate) {
        setError(`File "${file.name}" is already selected.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      const filesWithId = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'ready'
      }));

      setSelectedFiles(prev => [...prev, ...filesWithId]);
      setError(null); // Clear any previous errors
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    setUploadResults(prev => prev.filter(result => result.fileId !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType, fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    const iconClass = "w-8 h-8";

    if (fileType?.includes('pdf') || extension === 'pdf') {
      return <FileText className={`${iconClass} text-red-500`} />;
    }
    if (fileType?.includes('word') || ['doc', 'docx'].includes(extension)) {
      return <FileText className={`${iconClass} text-blue-600`} />;
    }
    if (fileType?.includes('excel') || fileType?.includes('sheet') || ['xls', 'xlsx'].includes(extension)) {
      return <FileText className={`${iconClass} text-green-600`} />;
    }
    if (fileType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <FileText className={`${iconClass} text-purple-600`} />;
    }
    return <FileText className={`${iconClass} text-ca-neutral`} />;
  };

  const validateForm = () => {
    const errors = [];

    if (selectedFiles.length === 0) {
      errors.push('Please select at least one file to upload.');
    }

    if (!formData.category) {
      errors.push('Please select a document category.');
    }

    // UPDATED: Validate client_id instead of client_name
    if (!formData.client_id) {
      errors.push('Please select a client.');
    }

    if (errors.length > 0) {
      setError(errors.join(' '));
      return false;
    }

    setError(null);
    return true;
  };

  const uploadSingleFile = async (fileItem) => {
    try {
      // Create FormData for the file upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', fileItem.file);
      uploadFormData.append('client_id', formData.client_id); // UPDATED: Use client_id
      uploadFormData.append('category', formData.category);

      if (formData.description.trim()) {
        uploadFormData.append('description', formData.description.trim());
      }

      if (formData.tags.trim()) {
        uploadFormData.append('tags', formData.tags.trim());
      }

      // Start upload with progress tracking
      setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));

      const response = await documentsAPI.uploadDocument(uploadFormData);

      if (response.data.success) {
        // Complete the progress
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }));

        // Update file status
        setSelectedFiles(prev =>
          prev.map(file =>
            file.id === fileItem.id
              ? { ...file, status: 'completed' }
              : file
          )
        );

        // Add to results
        setUploadResults(prev => [...prev, {
          fileId: fileItem.id,
          fileName: fileItem.name,
          success: true,
          message: response.data.message,
          documentId: response.data.data?.id
        }]);

        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error for file:', fileItem.name, error);

      // Update file status to error
      setSelectedFiles(prev =>
        prev.map(file =>
          file.id === fileItem.id
            ? { ...file, status: 'error' }
            : file
        )
      );

      // Add error to results
      const errorInfo = handleApiError(error);
      setUploadResults(prev => [...prev, {
        fileId: fileItem.id,
        fileName: fileItem.name,
        success: false,
        message: errorInfo.message,
        errors: errorInfo.errors
      }]);

      return { success: false, error: errorInfo };
    }
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setUploadingFiles(true);
    setError(null);
    setSuccessCount(0);
    setFailureCount(0);
    setUploadResults([]);

    try {
      // Update all files status to uploading
      setSelectedFiles(prev =>
        prev.map(file => ({ ...file, status: 'uploading' }))
      );

      // Upload files sequentially to avoid overwhelming the server
      const results = [];
      for (const fileItem of selectedFiles) {
        const result = await uploadSingleFile(fileItem);
        results.push(result);

        // Update progress simulation for better UX
        const progressSteps = [20, 40, 60, 80, 95];
        for (const step of progressSteps) {
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: step }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Calculate results
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      setSuccessCount(successful);
      setFailureCount(failed);

      // Show results and redirect if all successful
      if (failed === 0) {
        setTimeout(() => {
          navigate('/documents', {
            state: {
              uploadSuccess: true,
              uploadedCount: successful
            }
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Upload process failed:', error);
      setError('Upload process failed. Please try again.');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetUpload = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    setUploadResults([]);
    setSuccessCount(0);
    setFailureCount(0);
    setError(null);
    setFormData({
      category: '',
      client_id: '', // UPDATED: Reset client_id
      description: '',
      tags: ''
    });
  };

  return (
    <div className="min-h-screen bg-ca-light">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 pt-16">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/documents')}
                className="text-ca-neutral hover:text-ca-dark"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Documents
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-ca-dark">Upload Documents</h1>
            <p className="text-ca-neutral mt-1">
              Securely upload and encrypt your client documents
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success/Results Alert */}
          {(successCount > 0 || failureCount > 0) && !uploadingFiles && (
            <Alert className={`mb-6 ${failureCount === 0 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <CheckCircle className={`w-4 h-4 ${failureCount === 0 ? 'text-green-600' : 'text-yellow-600'}`} />
              <AlertDescription className={failureCount === 0 ? 'text-green-800' : 'text-yellow-800'}>
                Upload completed: {successCount} successful, {failureCount} failed.
                {failureCount === 0 && ' Redirecting to documents...'}
              </AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <Alert className="mb-6 border-ca-primary bg-blue-50">
            <Shield className="w-4 h-4 text-ca-primary" />
            <AlertDescription className="text-ca-dark">
              All documents are encrypted with AES-256 encryption before upload.
              Your files are processed securely and stored with enterprise-grade protection.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Upload Section */}
              <Card className="ca-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudUpload className="w-5 h-5 text-ca-primary" />
                    File Upload
                  </CardTitle>
                  <CardDescription>
                    Drag and drop files or click to browse. Maximum file size: 50MB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-ca-primary bg-blue-50'
                        : 'border-gray-300 hover:border-ca-primary hover:bg-gray-50'
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center">
                      <UploadIcon className={`w-12 h-12 mb-4 ${dragActive ? 'text-ca-primary' : 'text-ca-neutral'
                        }`} />
                      <h3 className="text-lg font-semibold text-ca-dark mb-2">
                        {dragActive ? 'Drop files here' : 'Upload Documents'}
                      </h3>
                      <p className="text-ca-neutral mb-4">
                        Drag and drop your files here, or click to browse
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                        disabled={uploadingFiles}
                      />
                      <Button
                        asChild
                        className="bg-ca-primary hover:bg-blue-700"
                        disabled={uploadingFiles}
                      >
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Plus className="w-4 h-4 mr-2" />
                          Choose Files
                        </label>
                      </Button>
                    </div>
                  </div>

                  {/* Supported formats */}
                  <div className="mt-4 text-xs text-ca-neutral">
                    <p><strong>Supported formats:</strong> PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF</p>
                    <p><strong>Maximum file size:</strong> 50MB per file</p>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <Card className="ca-shadow border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-ca-primary" />
                        Selected Files ({selectedFiles.length})
                      </CardTitle>
                      {!uploadingFiles && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetUpload}
                          className="text-ca-neutral hover:text-red-600"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedFiles.map((fileItem) => (
                        <div key={fileItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {getFileIcon(fileItem.type, fileItem.name)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ca-dark truncate">
                              {fileItem.name}
                            </p>
                            <p className="text-xs text-ca-neutral">
                              {formatFileSize(fileItem.size)}
                            </p>
                            {uploadProgress[fileItem.id] !== undefined && (
                              <div className="mt-2">
                                <Progress value={uploadProgress[fileItem.id]} className="h-1" />
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-ca-neutral">
                                    {Math.round(uploadProgress[fileItem.id])}%
                                  </span>
                                  {fileItem.status === 'uploading' && (
                                    <Loader2 className="w-3 h-3 animate-spin text-ca-primary" />
                                  )}
                                  {fileItem.status === 'completed' && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  {fileItem.status === 'error' && (
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {fileItem.status === 'completed' && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            {fileItem.status === 'error' && (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            {fileItem.status === 'uploading' && (
                              <Loader2 className="w-5 h-5 animate-spin text-ca-primary" />
                            )}
                            {!uploadingFiles && fileItem.status === 'ready' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(fileItem.id)}
                                className="h-8 w-8 p-0 text-ca-neutral hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upload Results */}
              {uploadResults.length > 0 && (
                <Card className="ca-shadow border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-ca-primary" />
                      Upload Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {uploadResults.map((result, index) => (
                        <div key={index} className={`flex items-center gap-3 p-2 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.fileName}</p>
                            <p className={`text-xs ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                              {result.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Document Information Form - Right Column */}
            <div className="space-y-6">
              <Card className="ca-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ca-primary" />
                    Document Information
                  </CardTitle>
                  <CardDescription>
                    Provide details about the documents being uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    {loadingCategories ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-ca-neutral">Loading categories...</span>
                      </div>
                    ) : (
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleFormChange('category', value)}
                        disabled={uploadingFiles}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* UPDATED: Client Selection */}
                  <div>
                    <Label htmlFor="client_id">Client *</Label>
                    {loadingClients ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-ca-neutral">Loading clients...</span>
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="space-y-2">
                        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800 mb-2">
                            No clients found. Create a new client to proceed.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setShowClientModal(true)}
                            className="bg-ca-primary hover:bg-blue-700"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create New Client
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Select
                            value={formData.client_id}
                            onValueChange={(value) => handleFormChange('client_id', value)}
                            disabled={uploadingFiles}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map(client => (
                                <SelectItem key={client.value} value={client.value}>
                                  {client.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowClientModal(true)}
                            disabled={uploadingFiles}
                            title="Add new client"
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={fetchClients}
                            disabled={loadingClients}
                            className="text-xs"
                          >
                            <RefreshCw className={`w-3 h-3 mr-1 ${loadingClients ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/clients')}
                            className="text-xs"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Manage Clients
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description (optional)"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      disabled={uploadingFiles}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., tax, 2024, quarterly"
                      value={formData.tags}
                      onChange={(e) => handleFormChange('tags', e.target.value)}
                      disabled={uploadingFiles}
                    />
                    <p className="text-xs text-ca-neutral mt-1">
                      Separate tags with commas for better organization
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Button */}
              <Card className="ca-shadow border-0">
                <CardContent className="p-6">
                  <Button
                    onClick={handleUpload}
                    disabled={uploadingFiles || selectedFiles.length === 0 || !formData.category || !formData.client_id}
                    className="w-full bg-ca-primary hover:bg-blue-700 disabled:opacity-50"
                    size="lg"
                  >
                    {uploadingFiles ? (
                      <>
                        <Lock className="w-4 h-4 mr-2 animate-spin" />
                        Encrypting & Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Upload Documents
                      </>
                    )}
                  </Button>

                  {selectedFiles.length > 0 && !uploadingFiles && (
                    <p className="text-xs text-ca-neutral mt-2 text-center">
                      {selectedFiles.length} file(s) ready for upload
                    </p>
                  )}

                  {uploadingFiles && (
                    <div className="mt-3 text-center">
                      <p className="text-xs text-ca-neutral">
                        Please don't close this page while uploading...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Information */}
              <Card className="ca-shadow border-0 bg-gradient-to-br from-ca-primary to-ca-secondary text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Enterprise Security</h3>
                      <ul className="text-sm opacity-90 space-y-1">
                        <li>• AES-256 encryption</li>
                        <li>• Zero-knowledge storage</li>
                        <li>• Secure transmission</li>
                        <li>• GDPR compliant</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upload Progress Message */}
          {uploadingFiles && (
            <Alert className="mt-6 border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your documents are being encrypted and uploaded securely. Please do not close this page.
                ({selectedFiles.filter(f => f.status === 'completed').length}/{selectedFiles.length} completed)
              </AlertDescription>
            </Alert>
          )}

          {/* Additional Information */}
          <Card className="mt-8 ca-shadow border-0">
            <CardContent className="p-6">
              <h3 className="font-semibold text-ca-dark mb-3">Upload Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-ca-neutral">
                <div>
                  <h4 className="font-medium text-ca-dark mb-2">Supported Formats</h4>
                  <ul className="space-y-1">
                    <li>• PDF documents (.pdf)</li>
                    <li>• Microsoft Word (.doc, .docx)</li>
                    <li>• Excel spreadsheets (.xls, .xlsx)</li>
                    <li>• Images (.jpg, .jpeg, .png, .gif)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-ca-dark mb-2">Best Practices</h4>
                  <ul className="space-y-1">
                    <li>• Use descriptive file names</li>
                    <li>• Select appropriate categories</li>
                    <li>• Add relevant tags for easy searching</li>
                    <li>• Keep file sizes under 50MB</li>
                    <li>• Ensure files are not corrupted</li>
                    <li>• Select the correct client</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-ca-dark mb-2">Security Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-ca-neutral">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-ca-primary" />
                    <span>Client-side encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-ca-primary" />
                    <span>Secure file transfer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-ca-primary" />
                    <span>Audit trail logging</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Creation Modal */}
          <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-ca-primary" />
                  Create New Client
                </DialogTitle>
                <DialogDescription>
                  Add a new client to organize your documents. Fields marked with * are required.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Name *</Label>
                    <Input
                      id="client_name"
                      value={clientFormData.name}
                      onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                      placeholder="Client full name"
                      className={clientFormErrors.name ? 'border-red-500' : ''}
                    />
                    {clientFormErrors.name && <p className="text-xs text-red-500">{clientFormErrors.name[0]}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_company_name">Company Name</Label>
                    <Input
                      id="client_company_name"
                      value={clientFormData.company_name}
                      onChange={(e) => setClientFormData({ ...clientFormData, company_name: e.target.value })}
                      placeholder="Company name"
                      className={clientFormErrors.company_name ? 'border-red-500' : ''}
                    />
                    {clientFormErrors.company_name && <p className="text-xs text-red-500">{clientFormErrors.company_name[0]}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_email">Email</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={clientFormData.email}
                      onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                      placeholder="client@example.com"
                      className={clientFormErrors.email ? 'border-red-500' : ''}
                    />
                    {clientFormErrors.email && <p className="text-xs text-red-500">{clientFormErrors.email[0]}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_phone">Phone</Label>
                    <Input
                      id="client_phone"
                      value={clientFormData.phone}
                      onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className={clientFormErrors.phone ? 'border-red-500' : ''}
                    />
                    {clientFormErrors.phone && <p className="text-xs text-red-500">{clientFormErrors.phone[0]}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_gst_number">GST Number</Label>
                    <Input
                      id="client_gst_number"
                      value={clientFormData.gst_number}
                      onChange={(e) => setClientFormData({ ...clientFormData, gst_number: e.target.value.toUpperCase() })}
                      placeholder="22AAAAA0000A1Z5"
                      className={clientFormErrors.gst_number ? 'border-red-500' : ''}
                    />
                    {clientFormErrors.gst_number && <p className="text-xs text-red-500">{clientFormErrors.gst_number[0]}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_pan_number">PAN Number</Label>
                    <Input
                      id="client_pan_number"
                      value={clientFormData.pan_number}
                      onChange={(e) => setClientFormData({ ...clientFormData, pan_number: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      className={clientFormErrors.pan_number ? 'border-red-500' : ''}
                    />
                    {clientFormErrors.pan_number && <p className="text-xs text-red-500">{clientFormErrors.pan_number[0]}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_address">Address</Label>
                  <Textarea
                    id="client_address"
                    value={clientFormData.address}
                    onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                    placeholder="Complete address"
                    rows={2}
                    className={clientFormErrors.address ? 'border-red-500' : ''}
                  />
                  {clientFormErrors.address && <p className="text-xs text-red-500">{clientFormErrors.address[0]}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_city">City</Label>
                    <Input
                      id="client_city"
                      value={clientFormData.city}
                      onChange={(e) => setClientFormData({ ...clientFormData, city: e.target.value })}
                      placeholder="City"
                      className={clientFormErrors.city ? 'border-red-500' : ''}
                    />
                    {clientFormErrors.city && <p className="text-xs text-red-500">{clientFormErrors.city[0]}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_state">State</Label>
                    <Input
                      id="client_state"
                      value={clientFormData.state}
                      onChange={(e) => setClientFormData({ ...clientFormData, state: e.target.value })}
                      placeholder="State"
                      className={clientFormErrors.state ? 'border-red-500' : ''}
                    />
                    {clientFormErrors.state && <p className="text-xs text-red-500">{clientFormErrors.state[0]}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_pincode">Pincode</Label>
                    <Input
                      id="client_pincode"
                      value={clientFormData.pincode}
                      onChange={(e) => setClientFormData({ ...clientFormData, pincode: e.target.value })}
                      placeholder="123456"
                      className={clientFormErrors.pincode ? 'border-red-500' : ''}
                    />
                    {clientFormErrors.pincode && <p className="text-xs text-red-500">{clientFormErrors.pincode[0]}</p>}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowClientModal(false);
                      resetClientForm();
                    }}
                    disabled={clientFormLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={clientFormLoading || !clientFormData.name.trim()}
                    className="bg-ca-primary hover:bg-blue-700"
                  >
                    {clientFormLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Client
                      </>
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

export default Upload;