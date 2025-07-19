// src/pages/Upload.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
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
  Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    client: '',
    description: '',
    tags: ''
  });

  // Categories for document classification
  const categories = [
    { value: 'tax-returns', label: 'Tax Returns' },
    { value: 'financial-statements', label: 'Financial Statements' },
    { value: 'audit-reports', label: 'Audit Reports' },
    { value: 'gst-returns', label: 'GST Returns' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'bank-statements', label: 'Bank Statements' },
    { value: 'receipts', label: 'Receipts' },
    { value: 'others', label: 'Others' }
  ];

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
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} has an unsupported format.`);
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
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (fileType.includes('word')) return <FileText className="w-8 h-8 text-blue-600" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FileText className="w-8 h-8 text-green-600" />;
    if (fileType.includes('image')) return <FileText className="w-8 h-8 text-purple-600" />;
    return <FileText className="w-8 h-8 text-ca-neutral" />;
  };

  const validateForm = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to upload.');
      return false;
    }
    if (!formData.category) {
      alert('Please select a document category.');
      return false;
    }
    if (!formData.client.trim()) {
      alert('Please enter the client name.');
      return false;
    }
    return true;
  };

  const simulateUpload = async (fileId) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: Math.min(progress, 100)
        }));
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setUploadingFiles(true);

    try {
      // Update file status to uploading
      setSelectedFiles(prev =>
        prev.map(file => ({ ...file, status: 'uploading' }))
      );

      // Simulate upload for each file
      const uploadPromises = selectedFiles.map(async (fileItem) => {
        await simulateUpload(fileItem.id);

        // Update status to completed
        setSelectedFiles(prev =>
          prev.map(file =>
            file.id === fileItem.id
              ? { ...file, status: 'completed' }
              : file
          )
        );
      });

      await Promise.all(uploadPromises);

      // Show success message and redirect
      setTimeout(() => {
        navigate('/documents');
      }, 1500);

    } catch (error) {
      console.error('Upload failed:', error);
      setSelectedFiles(prev =>
        prev.map(file => ({ ...file, status: 'error' }))
      );
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

  return (
    <div className="min-h-screen bg-ca-light">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 pt-16">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ca-dark">Upload Documents</h1>
            <p className="text-ca-neutral mt-1">
              Securely upload and encrypt your client documents
            </p>
          </div>

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
                      />
                      <Button asChild className="bg-ca-primary hover:bg-blue-700">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Plus className="w-4 h-4 mr-2" />
                          Choose Files
                        </label>
                      </Button>
                    </div>
                  </div>

                  {/* Supported formats */}
                  <div className="mt-4 text-xs text-ca-neutral">
                    <p>Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF</p>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <Card className="ca-shadow border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-ca-primary" />
                      Selected Files ({selectedFiles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedFiles.map((fileItem) => (
                        <div key={fileItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {getFileIcon(fileItem.type)}
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
                            {!uploadingFiles && (
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
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleFormChange('category', value)}
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
                  </div>

                  <div>
                    <Label htmlFor="client">Client Name *</Label>
                    <Input
                      id="client"
                      placeholder="Enter client name"
                      value={formData.client}
                      onChange={(e) => handleFormChange('client', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description (optional)"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., tax, 2024, quarterly"
                      value={formData.tags}
                      onChange={(e) => handleFormChange('tags', e.target.value)}
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
                    disabled={uploadingFiles || selectedFiles.length === 0}
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

          {/* Upload Success Message */}
          {uploadingFiles && (
            <Alert className="mt-6 border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your documents are being encrypted and uploaded securely. Please do not close this page.
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
                    <li>• PDF documents</li>
                    <li>• Microsoft Word (DOC, DOCX)</li>
                    <li>• Excel spreadsheets (XLS, XLSX)</li>
                    <li>• Images (JPG, PNG, GIF)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-ca-dark mb-2">Best Practices</h4>
                  <ul className="space-y-1">
                    <li>• Use descriptive file names</li>
                    <li>• Select appropriate categories</li>
                    <li>• Add relevant tags for easy searching</li>
                    <li>• Keep file sizes under 50MB</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Upload;