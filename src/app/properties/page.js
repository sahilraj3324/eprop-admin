'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building, 
  Search, 
  Eye, 
  Trash2, 
  MapPin, 
  IndianRupee, 
  AlertCircle,
  RefreshCw,
  Home,
  Building2,
  Calendar,
  Edit3
} from 'lucide-react';
import Layout from '@/components/Layout';
import { adminApi, API_URLS } from '@/config/api';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/properties');
      
      // Server returns properties array directly
      if (Array.isArray(response.data)) {
        setProperties(response.data);
      } else {
        setProperties([]);
        setError('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(`Failed to load properties: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId, propertyTitle) => {
    if (!window.confirm(`Are you sure you want to delete property: ${propertyTitle}?`)) {
      return;
    }

    try {
      const response = await adminApi.delete(`/properties/${propertyId}`);

      // Server returns { message: 'Property removed' } on successful deletion
      if (response.status === 200) {
        setSuccess(`Property "${propertyTitle}" deleted successfully`);
        fetchProperties(); // Refresh the list
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      setError(error.response?.data?.message || 'Failed to delete property');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || property.propertyType === filterType;

    return matchesSearch && matchesType;
  });

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else {
      return `₹${price?.toLocaleString()}`;
    }
  };

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'apartment':
        return Building2;
      case 'house':
        return Home;
      case 'villa':
        return Building;
      default:
        return Building;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading properties...</span>
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
            <Building className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
              <p className="mt-1 text-gray-600">Manage all property listings</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={fetchProperties}
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search properties by title, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field max-w-xs"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="plot">Plot</option>
              </select>
              <div className="text-sm text-gray-500 whitespace-nowrap">
                {filteredProperties.length} of {properties.length} properties
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Building className="h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No properties found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No properties have been listed yet.'
                }
              </p>
            </div>
          ) : (
            filteredProperties.map((property) => {
              const PropertyIcon = getPropertyTypeIcon(property.propertyType);
              return (
                <div key={property._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <PropertyIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {property.title || 'Untitled Property'}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {property.propertyType || 'Unknown Type'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/properties/${property._id}`)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View property"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/properties/edit/${property._id}`)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Edit property"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property._id, property.title)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {[property.city, property.state, property.country].filter(Boolean).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-900">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="text-lg font-semibold">
                        {formatPrice(property.price)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {property.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {property.bedrooms && (
                          <span>{property.bedrooms} BR</span>
                        )}
                        {property.bathrooms && (
                          <span>{property.bathrooms} BA</span>
                        )}
                        {property.area && (
                          <span>{property.area} sq ft</span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['apartment', 'house', 'villa', 'commercial'].map(type => {
            const count = properties.filter(p => p.propertyType === type).length;
            return (
              <div key={type} className="card">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-500 capitalize">{type}s</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
} 