'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Calendar, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  AlertCircle,
  DollarSign,
  Ruler,
  User,
  Tag,
  Eye
} from 'lucide-react';
import Layout from '@/components/Layout';
import { adminApi } from '@/config/api';

export default function PropertyViewPage() {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id;

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.get(`/properties/${propertyId}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
      setError(`Failed to load property: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, fetchProperty]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete property: ${property.title}?`)) {
      return;
    }

    try {
      await adminApi.delete(`/properties/${propertyId}`);
      setSuccess('Property deleted successfully');
      setTimeout(() => {
        router.push('/properties');
      }, 2000);
    } catch (error) {
      console.error('Error deleting property:', error);
      setError(`Failed to delete property: ${error.response?.data?.message || error.message}`);
    }
  };

  const getPropertyTypeBadge = (type) => {
    const types = {
      apartment: 'bg-blue-100 text-blue-800',
      house: 'bg-green-100 text-green-800',
      villa: 'bg-purple-100 text-purple-800',
      plot: 'bg-yellow-100 text-yellow-800',
      commercial: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${types[type] || types.other}`}>
        {type?.charAt(0)?.toUpperCase() + type?.slice(1) || 'Other'}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading property details...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !property) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/properties')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Properties</span>
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
              onClick={() => router.push('/properties')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Properties</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Details</h1>
              <p className="mt-1 text-gray-600">View and manage property information</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => router.push(`/properties/edit/${propertyId}`)}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Property</span>
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

        {property && (
          <div className="space-y-6">
            {/* Property Images */}
            {property.images && property.images.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property.images.map((image, index) => (
                    <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Property image ${index + 1}`}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YzZjRmNiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KICA8L3N2Zz4K';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
                      <div className="mt-2 flex items-center space-x-4">
                        {getPropertyTypeBadge(property.propertyType)}
                        <span className="text-2xl font-bold text-green-600 flex items-center">
                          <DollarSign className="h-5 w-5" />
                          {property.price?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {property.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{property.description}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <Bed className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{property.bedrooms || 0} Bedrooms</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Bath className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{property.bathrooms || 0} Bathrooms</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Ruler className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{property.area || 'N/A'} sqft</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Tag className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{property.propertyType || 'Other'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-900">{property.address}</p>
                            {(property.city || property.state || property.country) && (
                              <p className="text-gray-600">
                                {[property.city, property.state, property.country].filter(Boolean).join(', ')}
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
                {property.user && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Owner</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {property.user.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {property.user.phoneNumber || 'No contact'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/users/${property.user._id}`)}
                        className="w-full btn-secondary flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View User Profile</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Property Info */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Property ID</label>
                      <span className="text-sm text-gray-900 font-mono">{property._id}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(property.createdAt).toLocaleDateString('en-US', {
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
                          {new Date(property.updatedAt).toLocaleDateString('en-US', {
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