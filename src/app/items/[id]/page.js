'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Package, 
  MapPin, 
  Tag, 
  Calendar, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  AlertCircle,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import Layout from '@/components/Layout';
import { adminApi } from '@/config/api';

export default function ItemViewPage() {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const params = useParams();
  const itemId = params.id;

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get(`/items/${itemId}`);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching item:', error);
      setError(`Failed to load item: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete item: ${item.title}?`)) {
      return;
    }

    try {
      await adminApi.delete(`/items/${itemId}`);
      setSuccess('Item deleted successfully');
      setTimeout(() => {
        router.push('/items');
      }, 2000);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(`Failed to delete item: ${error.response?.data?.message || error.message}`);
    }
  };

  const getCategoryBadge = (category) => {
    const categories = {
      electronics: 'bg-blue-100 text-blue-800',
      furniture: 'bg-green-100 text-green-800',
      clothing: 'bg-purple-100 text-purple-800',
      books: 'bg-yellow-100 text-yellow-800',
      vehicles: 'bg-red-100 text-red-800',
      appliances: 'bg-indigo-100 text-indigo-800',
      sports: 'bg-orange-100 text-orange-800',
      toys: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categories[category] || categories.other}`}>
        {category?.charAt(0)?.toUpperCase() + category?.slice(1) || 'Other'}
      </span>
    );
  };

  const getConditionBadge = (condition) => {
    const conditions = {
      new: 'bg-green-100 text-green-800',
      'like-new': 'bg-blue-100 text-blue-800',
      good: 'bg-yellow-100 text-yellow-800',
      fair: 'bg-orange-100 text-orange-800',
      poor: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conditions[condition] || conditions.good}`}>
        {condition?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Good'}
      </span>
    );
  };

  const getAvailabilityBadge = (isAvailable) => {
    return isAvailable ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Available
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Not Available
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading item details...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !item) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/items')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Items</span>
            </button>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/items')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Items</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Item Details</h1>
              <p className="mt-1 text-gray-600">View and manage item information</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => router.push(`/items/edit/${itemId}`)}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Item</span>
            </button>
            <button
              onClick={handleDelete}
              className="btn-danger flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
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

        {item && (
          <div className="space-y-6">
            {/* Item Images */}
            {item.images && item.images.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.images.map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Item image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KICA8L3N2Zz4K';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Item Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
                      <div className="mt-2 flex items-center space-x-4">
                        {getCategoryBadge(item.category)}
                        {getConditionBadge(item.condition)}
                        {getAvailabilityBadge(item.isAvailable)}
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-green-600 flex items-center">
                          <DollarSign className="h-5 w-5" />
                          {item.price?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {item.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{item.description}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">Category: {item.category || 'Other'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">Condition: {item.condition || 'Good'}</span>
                        </div>
                        {item.brand && (
                          <div className="flex items-center space-x-2">
                            <Tag className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-900">Brand: {item.brand}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">
                            Status: {item.isAvailable ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-900">{item.location}</p>
                            {(item.city || item.state || item.country) && (
                              <p className="text-gray-600">
                                {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Owner Info */}
                {item.user && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Owner</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.user.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.user.phoneNumber || 'No contact'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/users/${item.user._id}`)}
                        className="w-full btn-secondary flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View User Profile</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Item Info */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Item ID</label>
                      <span className="text-sm text-gray-900 font-mono">{item._id}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(item.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 