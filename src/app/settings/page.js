'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings, 
  User, 
  Shield, 
  Database, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';
import Layout from '@/components/Layout';
import { API_URLS } from '@/config/api';

export default function SettingsPage() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    items: 0,
    admins: 0
  });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    fetchAdminData();
    fetchStats();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await axios.get(API_URLS.ADMIN_ME, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const adminData = response.data.admin;
        setAdmin(adminData);
        setProfileData({
          name: adminData.name || '',
          email: adminData.email || '',
          phoneNumber: adminData.phoneNumber || ''
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, propertiesRes, itemsRes, adminsRes] = await Promise.all([
        axios.get(API_URLS.USER_LIST, { withCredentials: true }),
        axios.get(API_URLS.PROPERTY_LIST, { withCredentials: true }),
        axios.get(API_URLS.ITEM_LIST, { withCredentials: true }),
        axios.get(API_URLS.ADMIN_LIST, { withCredentials: true })
      ]);

      setStats({
        users: usersRes.data.users?.length || 0,
        properties: propertiesRes.data.properties?.length || 0,
        items: itemsRes.data.items?.length || 0,
        admins: adminsRes.data.admins?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        API_URLS.ADMIN_UPDATE(admin._id), 
        profileData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully');
        setAdmin(response.data.admin);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllData = async (dataType) => {
    const confirmText = `DELETE ALL ${dataType.toUpperCase()}`;
    const userInput = window.prompt(
      `⚠️ WARNING: This will permanently delete ALL ${dataType}!\n\nType "${confirmText}" to confirm:`
    );

    if (userInput !== confirmText) {
      return;
    }

    try {
      let endpoint;
      switch (dataType) {
        case 'users':
          endpoint = API_URLS.USER_DELETE_ALL;
          break;
        case 'properties':
          endpoint = API_URLS.PROPERTY_DELETE_ALL;
          break;
        case 'items':
          endpoint = API_URLS.ITEM_DELETE_ALL;
          break;
        default:
          return;
      }

      const response = await axios.delete(endpoint, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccess(`All ${dataType} deleted successfully`);
        fetchStats(); // Refresh stats
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error(`Error deleting ${dataType}:`, error);
      setError(error.response?.data?.message || `Failed to delete ${dataType}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600">Loading settings...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-gray-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-gray-600">Manage admin panel configuration</p>
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
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Admin Info */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Admin Info</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{admin?.role || 'Admin'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="badge badge-success">{admin?.status || 'Active'}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm">
                    {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* System Stats */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-6 w-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">System Stats</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Users</span>
                  <span className="font-medium">{stats.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Properties</span>
                  <span className="font-medium">{stats.properties}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="font-medium">{stats.items}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Admins</span>
                  <span className="font-medium">{stats.admins}</span>
                </div>
              </div>
              <button
                onClick={fetchStats}
                className="btn-secondary w-full mt-4 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Stats</span>
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center space-x-3 mb-6">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-red-700">
              These actions are irreversible. Please be certain before proceeding.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleDeleteAllData('users')}
                className="btn-danger flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete All Users</span>
              </button>
              
              <button
                onClick={() => handleDeleteAllData('properties')}
                className="btn-danger flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete All Properties</span>
              </button>
              
              <button
                onClick={() => handleDeleteAllData('items')}
                className="btn-danger flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete All Items</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 