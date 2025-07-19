// src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Search = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: 'all',
    client: '',
    fileType: 'all',
    status: 'all'
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'ABC Corp tax returns',
    'Q4 financial statements',
    'GST returns 2024',
    'audit reports'
  ]);

  // Categories and options
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

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const fileTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'word', label: 'Word' },
    { value: 'image', label: 'Images' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'size', label: 'Size' },
    { value: 'relevance', label: 'Relevance' }
  ];

  // Sample search results
  const sampleResults = [
    {
      id: 1,
      name: 'Annual Tax Return - ABC Corp.pdf',
      category: 'tax-returns',
      client: 'ABC Corporation',
      size: '2.4 MB',
      uploadedAt: '2024-07-15',
      status: 'completed',
      tags: ['tax', 'annual', '2024'],
      relevance: 95,
      excerpt: 'Annual tax return filing for ABC Corporation for the financial year 2023-24...'
    },
    {
      id: 2,
      name: 'GST Return March 2024.pdf',
      category: 'gst-returns',
      client: 'ABC Corporation',
      size: '856 KB',
      uploadedAt: '2024-03-31',
      status: 'completed',
      tags: ['gst', 'march', '2024'],
      relevance: 88,
      excerpt: 'Monthly GST return submission for March 2024 quarter...'
    },
    {
      id: 3,
      name: 'Financial Statement Q4 2023.xlsx',
      category: 'financial-statements',
      client: 'Tech Solutions Ltd',
      size: '1.8 MB',
      uploadedAt: '2024-01-15',
      status: 'completed',
      tags: ['financial', 'q4', '2023'],
      relevance: 82,
      excerpt: 'Quarterly financial statements including profit & loss, balance sheet...'
    }
  ];

  // Perform search
  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    
    // Add to recent searches
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
    }

    // Simulate API call
    setTimeout(() => {
      const filtered = sampleResults.filter(result => {
        const matchesQuery = result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = filters.category === 'all' || result.category === filters.category;
        const matchesClient = !filters.client || result.client.toLowerCase().includes(filters.client.toLowerCase());
        
        return matchesQuery && matchesCategory && matchesClient;
      });

      // Sort results
      const sorted = [...filtered].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'date':
            comparison = new Date(b.uploadedAt) - new Date(a.uploadedAt);
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'size':
            comparison = parseFloat(a.size) - parseFloat(b.size);
            break;
          case 'relevance':
            comparison = b.relevance - a.relevance;
            break;
          default:
            comparison = 0;
        }
        return sortOrder === 'desc' ? comparison : -comparison;
      });

      setSearchResults(sorted);
      setLoading(false);
    }, 800);
  };

  // Handle search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      dateRange: 'all',
      client: '',
      fileType: 'all',
      status: 'all'
    });
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="min-h-screen bg-ca-light">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="lg:ml-64 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ca-dark">Advanced Search</h1>
            <p className="text-ca-neutral mt-1">
              Find documents quickly with powerful search and filtering options
            </p>
          </div>

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
                    onClick={performSearch}
                    className="bg-ca-primary hover:bg-blue-700"
                    size="lg"
                    disabled={!searchQuery.trim()}
                  >
                    <SearchIcon className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && !searchQuery && (
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
                          onClick={() => setSearchQuery(search)}
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
                  </Button>
                  
                  {(filters.category !== 'all' || filters.client || filters.dateRange !== 'all') && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={filters.category} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
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
                    </div>

                    <div>
                      <Label htmlFor="dateRange">Date Range</Label>
                      <Select 
                        value={filters.dateRange} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dateRanges.map(range => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input
                        id="client"
                        placeholder="Client name"
                        value={filters.client}
                        onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="fileType">File Type</Label>
                      <Select 
                        value={filters.fileType} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, fileType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fileTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="ca-shadow border-0">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
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
                  <Select value={sortBy} onValueChange={setSortBy}>
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
                                __html: highlightText(result.name, searchQuery) 
                              }}
                            />
                            {sortBy === 'relevance' && (
                              <Badge variant="outline" className="text-xs">
                                {result.relevance}% match
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-ca-neutral mb-3">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {result.client}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(result.uploadedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {categories.find(cat => cat.value === result.category)?.label}
                            </span>
                            <span>{result.size}</span>
                          </div>

                          <p 
                            className="text-sm text-ca-neutral mb-3"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightText(result.excerpt, searchQuery) 
                            }}
                          />

                          <div className="flex items-center gap-2">
                            {getStatusBadge(result.status)}
                            <div className="flex gap-1">
                              {result.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
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
          ) : searchQuery ? (
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
                  <Button onClick={() => setSearchQuery('')}>
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
                    <li>• Use specific client names</li>
                    <li>• Search by document types</li>
                    <li>• Try date ranges for filtering</li>
                    <li>• Use tags for better results</li>
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
                        onClick={() => setSearchQuery(term)}
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
                    <li>• Filter by categories</li>
                    <li>• Date range selection</li>
                    <li>• Client-specific search</li>
                    <li>• File type filtering</li>
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

export default Search;