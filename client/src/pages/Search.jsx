// src/pages/Search.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Search as SearchIcon,
  Filter,
  Calendar,
  FileText,
  Download,
  Eye,
  Clock,
  User,
  Tag,
  Folder,
  SortAsc,
  SortDesc,
  X,
  MapPin,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { documentsAPI, handleApiError } from '../services/api';

const Search = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    dateFrom: searchParams.get('date_from') || '',
    dateTo: searchParams.get('date_to') || '',
    client: searchParams.get('client') || '',
    tags: searchParams.get('tags') || ''
  });

  // UI state
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Recent searches (stored in localStorage)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('ca_recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();

    // If there's a query in URL params, perform search
    if (searchParams.get('q')) {
      setHasSearched(true);
      performSearch();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await documentsAPI.getCategories();

      if (response.data.success) {
        setCategories([
          { value: 'all', label: 'All Categories' },
          ...response.data.data
        ]);
      } else {
        throw new Error('Failed to fetch categories');
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
        { value: 'Service Agreements', label: 'Service Agreements' },
        { value: 'Other', label: 'Other' }
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(() => {
      if (searchQuery.trim()) {
        performSearch();
      }
    }, 500),
    [searchQuery, filters, sortBy, sortOrder]
  );

  useEffect(() => {
    if (hasSearched && searchQuery.trim()) {
      debouncedSearch();
    }
  }, [searchQuery, filters, sortBy, sortOrder, debouncedSearch, hasSearched]);

  // Perform search API call
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build search parameters
      const searchParams = {
        q: searchQuery.trim()
      };

      // Add filters if they exist
      if (filters.category && filters.category !== 'all') {
        searchParams.category = filters.category;
      }
      if (filters.client.trim()) {
        searchParams.client = filters.client.trim();
      }
      if (filters.tags.trim()) {
        searchParams.tags = filters.tags.trim();
      }
      if (filters.dateFrom) {
        searchParams.date_from = filters.dateFrom;
      }
      if (filters.dateTo) {
        searchParams.date_to = filters.dateTo;
      }

      // Perform API search
      const response = await documentsAPI.searchDocuments(searchParams);

      if (response.data.success) {
        let results = response.data.data || [];

        // Sort results based on sortBy and sortOrder
        results = sortResults(results, sortBy, sortOrder);

        setSearchResults(results);

        // Add to recent searches
        addToRecentSearches(searchQuery);

        // Update URL params
        updateURLParams();
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort results helper
  const sortResults = (results, sortBy, sortOrder) => {
    const sorted = [...results].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'upload_date':
        case 'date':
          comparison = new Date(b.upload_date || b.uploadedAt) - new Date(a.upload_date || a.uploadedAt);
          break;
        case 'document_name':
        case 'name':
          comparison = (a.document_name || a.name || '').localeCompare(b.document_name || b.name || '');
          break;
        case 'file_size':
        case 'size':
          const aSizeBytes = convertSizeToBytes(a.file_size || a.size || '0');
          const bSizeBytes = convertSizeToBytes(b.file_size || b.size || '0');
          comparison = aSizeBytes - bSizeBytes;
          break;
        case 'relevance':
        default:
          // For relevance, assume API returns most relevant first
          comparison = 0;
          break;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return sorted;
  };

  // Convert file size string to bytes for sorting
  const convertSizeToBytes = (sizeStr) => {
    if (!sizeStr) return 0;
    const matches = sizeStr.match(/^([\d.]+)\s*(.*)/);
    if (!matches) return 0;

    const size = parseFloat(matches[1]);
    const unit = matches[2].toLowerCase();

    switch (unit) {
      case 'kb': return size * 1024;
      case 'mb': return size * 1024 * 1024;
      case 'gb': return size * 1024 * 1024 * 1024;
      default: return size;
    }
  };

  // Add to recent searches
  const addToRecentSearches = (query) => {
    const newRecentSearches = [
      query,
      ...recentSearches.filter(search => search !== query)
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    localStorage.setItem('ca_recent_searches', JSON.stringify(newRecentSearches));
  };

  // Update URL parameters
  const updateURLParams = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (filters.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters.client.trim()) params.set('client', filters.client.trim());
    if (filters.tags.trim()) params.set('tags', filters.tags.trim());
    if (filters.dateFrom) params.set('date_from', filters.dateFrom);
    if (filters.dateTo) params.set('date_to', filters.dateTo);

    setSearchParams(params);
  };

  // Handle search execution
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setHasSearched(true);
    performSearch();
  };

  // Handle search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: 'all',
      dateFrom: '',
      dateTo: '',
      client: '',
      tags: ''
    });
    setSearchParams(new URLSearchParams({ q: searchQuery }));
  };

  // Clear search and reset
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
    setFilters({
      category: 'all',
      dateFrom: '',
      dateTo: '',
      client: '',
      tags: ''
    });
    setSearchParams(new URLSearchParams());
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle sort changes
  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
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

  // Highlight search terms in text
  const highlightText = (text, query) => {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  // Handle document download
  const handleDownloadDocument = async (documentId, documentName) => {
    try {
      const response = await documentsAPI.downloadDocument(documentId);

      if (response.data.success && response.data.download_url) {
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

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'upload_date', label: 'Date' },
    { value: 'document_name', label: 'Name' },
    { value: 'file_size', label: 'Size' }
  ];

  return (
    <div className="min-h-screen bg-ca-light">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-ca-neutral hover:text-ca-dark"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-ca-dark">Advanced Search</h1>
            <p className="text-ca-neutral mt-1">
              Find documents quickly with powerful search and filtering options
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Search Section */}
          <Card className="ca-shadow border-0 mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Main Search Bar */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-ca-neutral" />
                    <Input
                      placeholder="Search documents, clients, tags, or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 text-base"
                      size="lg"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="bg-ca-primary hover:bg-blue-700"
                    size="lg"
                    disabled={!searchQuery.trim() || loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SearchIcon className="w-4 h-4 mr-2" />
                    )}
                    Search
                  </Button>
                  {hasSearched && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={clearSearch}
                      className="text-ca-neutral hover:text-ca-dark"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && !hasSearched && (
                  <div>
                    <Label className="text-sm font-medium text-ca-neutral mb-2 block">
                      Recent Searches
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery(search);
                            setHasSearched(true);
                          }}
                          className="text-ca-neutral hover:text-ca-dark"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Advanced Filters Toggle */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-ca-primary hover:text-blue-700"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filters
                    {Object.values(filters).some(value => value && value !== 'all') && (
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </Button>

                  {Object.values(filters).some(value => value && value !== 'all') && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-ca-neutral hover:text-ca-dark"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Advanced Filters */}
                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      {loadingCategories ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-ca-neutral">Loading...</span>
                        </div>
                      ) : (
                        <Select
                          value={filters.category}
                          onValueChange={(value) => handleFilterChange('category', value)}
                        >
                          <SelectTrigger>
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
                      )}
                    </div>

                    <div>
                      <Label htmlFor="client">Client Name</Label>
                      <Input
                        id="client"
                        placeholder="Filter by client"
                        value={filters.client}
                        onChange={(e) => handleFilterChange('client', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., tax, 2024"
                        value={filters.tags}
                        onChange={(e) => handleFilterChange('tags', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateFrom">Date From</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateTo">Date To</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-ca-primary mx-auto mb-4" />
                  <p className="text-ca-neutral">Searching documents...</p>
                </div>
              </div>
            </div>
          ) : hasSearched && searchResults.length > 0 ? (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ca-dark">
                    Search Results ({searchResults.length})
                  </h3>
                  <p className="text-sm text-ca-neutral">
                    Found {searchResults.length} documents matching "{searchQuery}"
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm text-ca-neutral">Sort by:</Label>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <Card key={result.id} className="ca-shadow border-0 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-ca-primary" />
                            <h4
                              className="font-semibold text-ca-dark"
                              dangerouslySetInnerHTML={{
                                __html: highlightText(result.document_name || result.name || 'Untitled', searchQuery)
                              }}
                            />
                          </div>

                          <div className="flex items-center gap-4 text-sm text-ca-neutral mb-3">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: highlightText(result.client_name || result.client || 'Unknown Client', searchQuery)
                                }}
                              />
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(result.upload_date || result.uploadedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {result.category || 'Uncategorized'}
                            </span>
                            <span>{result.file_size || result.size || 'Unknown size'}</span>
                          </div>

                          {result.description && (
                            <p
                              className="text-sm text-ca-neutral mb-3"
                              dangerouslySetInnerHTML={{
                                __html: highlightText(result.description, searchQuery)
                              }}
                            />
                          )}

                          <div className="flex items-center gap-2">
                            {getStatusBadge(result.status)}
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex gap-1">
                                {result.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Tag className="w-2 h-2 mr-1" />
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: highlightText(tag, searchQuery)
                                      }}
                                    />
                                  </Badge>
                                ))}
                                {result.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{result.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadDocument(result.id, result.document_name || result.name)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : hasSearched && searchResults.length === 0 ? (
            <Card className="ca-shadow border-0">
              <CardContent className="p-12 text-center">
                <SearchIcon className="w-12 h-12 text-ca-neutral mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-ca-dark mb-2">No results found</h3>
                <p className="text-ca-neutral mb-4">
                  We couldn't find any documents matching "{searchQuery}". Try adjusting your search terms or filters.
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button onClick={clearSearch}>
                    New Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Search Tips */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="ca-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-ca-primary">
                    <TrendingUp className="w-5 h-5" />
                    Search Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-ca-neutral">
                    <li>• Use specific client names for better results</li>
                    <li>• Search by document types or categories</li>
                    <li>• Try date ranges for time-based filtering</li>
                    <li>• Use tags to find related documents</li>
                    <li>• Combine multiple filters for precision</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="ca-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-ca-primary">
                    <SearchIcon className="w-5 h-5" />
                    Quick Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Tax returns 2024', 'Audit reports', 'GST filings', 'Financial statements'].map((term, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setSearchQuery(term);
                          setHasSearched(true);
                        }}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="ca-shadow border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-ca-primary">
                    <Filter className="w-5 h-5" />
                    Advanced Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-ca-neutral">
                    <li>• Filter by document categories</li>
                    <li>• Date range selection</li>
                    <li>• Client-specific searches</li>
                    <li>• Tag-based filtering</li>
                    <li>• Multiple sort options</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default Search;