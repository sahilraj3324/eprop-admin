'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Search, 
  Eye, 
  Trash2, 
  MapPin, 
  IndianRupee, 
  AlertCircle,
  RefreshCw,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  Edit3
} from 'lucide-react';
import Layout from '@/components/Layout';
import { adminApi, API_URLS } from '@/config/api';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const categories = [
    'electronics', 'furniture', 'clothing', 'books', 'vehicles', 
    'appliances', 'sports', 'toys', 'other'
  ];

  const conditions = ['new', 'like-new', 'good', 'fair', 'poor'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/items');
      
      // Server returns items array directly
      if (Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        setItems([]);
        setError('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setError(`Failed to load items: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId, itemTitle) => {
    if (!window.confirm(`Are you sure you want to delete item: ${itemTitle}?`)) {
      return;
    }

    try {
      const response = await adminApi.delete(`/items/${itemId}`);

      // Server returns { message: 'Item removed' } on successful deletion
      if (response.status === 200) {
        setSuccess(`Item "${itemTitle}" deleted successfully`);
        fetchItems(); // Refresh the list
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error.response?.data?.message || 'Failed to delete item');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesCondition = filterCondition === 'all' || item.condition === filterCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  const formatPrice = (price) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)}K`;
    } else {
      return `₹${price?.toLocaleString()}`;
    }
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'new':
        return 'badge badge-success';
      case 'like-new':
        return 'badge badge-success';
      case 'good':
        return 'badge badge-warning';
      case 'fair':
        return 'badge badge-warning';
      case 'poor':
        return 'badge badge-danger';
      default:
        return 'badge';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading items...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Items Management</h1>
              <p className="mt-1 text-gray-600">Manage all item listings</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={fetchItems}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Search and Filters */}
        <div className="card">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between space-y-4 xl:space-y-0 xl:space-x-4">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search items by title, brand, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category} className="capitalize">
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="input-field w-full sm:w-auto"
              >
                <option value="all">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition} className="capitalize">
                    {condition.replace('-', ' ')}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-500 whitespace-nowrap">
                {filteredItems.length} of {items.length} items
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No items found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || filterCategory !== 'all' || filterCondition !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No items have been listed yet.'
                }
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {item.title || 'Untitled Item'}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Tag className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-600 capitalize">
                        {item.category || 'Other'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => router.push(`/items/${item._id}`)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View item"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/items/edit/${item._id}`)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Edit item"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id, item.title)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-900">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="text-lg font-semibold">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    <span className={getConditionBadge(item.condition)}>
                      {item.condition?.replace('-', ' ') || 'Unknown'}
                    </span>
                  </div>

                  {item.brand && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Brand:</span> {item.brand}
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description || 'No description available'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {item.isAvailable ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Available</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Sold</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {items.filter(item => item.isAvailable).length}
                </p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {items.filter(item => !item.isAvailable).length}
                </p>
                <p className="text-sm text-gray-500">Sold</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(items.map(item => item.category)).size}
                </p>
                <p className="text-sm text-gray-500">Categories</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                <p className="text-sm text-gray-500">Total Items</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 