'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Search, 
  Eye, 
  Trash2, 
  Phone, 
  Mail, 
  AlertCircle,
  RefreshCw,
  UserCheck,
  UserX,
  Edit3,
  Plus
} from 'lucide-react';
import Layout from '@/components/Layout';
import { adminApi } from '@/config/api';

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin');
      
      if (Array.isArray(response.data)) {
        setAdmins(response.data);
      } else {
        setAdmins([]);
        setError('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError(`Failed to load admins: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to delete admin: ${adminName}?`)) {
      return;
    }

    try {
      const response = await adminApi.delete(`/admin/${adminId}`);

      if (response.status === 200) {
        setSuccess(`Admin ${adminName} deleted successfully`);
        fetchAdmins();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError(error.response?.data?.message || 'Failed to delete admin');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phoneNumber?.includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'badge badge-success';
      case 'inactive':
        return 'badge badge-warning';
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
            <span className="text-gray-600">Loading admins...</span>
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
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
              <p className="mt-1 text-gray-600">Manage system administrators</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => router.push('/admins/create')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Admin</span>
            </button>
            <button
              onClick={fetchAdmins}
              className="btn-secondary flex items-center space-x-2"
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

        {/* Search */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search admins by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredAdmins.length} of {admins.length} admins
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Shield className="h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No admins found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? 'Try adjusting your search terms.' : 'No admins have been created yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{admin.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">ID: {admin._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {admin.email || 'No email'}
                          </div>
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {admin.phoneNumber || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(admin.status)}>
                          {admin.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {admin.role || 'admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/admins/${admin._id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View admin details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admins/edit/${admin._id}`)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit admin"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete admin"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => a.status === 'active').length}
                </p>
                <p className="text-sm text-gray-500">Active Admins</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => a.status === 'inactive').length}
                </p>
                <p className="text-sm text-gray-500">Inactive Admins</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                <p className="text-sm text-gray-500">Total Admins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 