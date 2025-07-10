'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/blogs/');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`http://localhost:5000/api/blogs/${id}`);
        setBlogs(blogs.filter(blog => blog._id !== id));
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete blog');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Blog Management</h1>
        <Link
          href="/blogs/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
        >
          <Plus size={20} />
          Create New Blog
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No blogs found</p>
          <Link
            href="/blogs/create"
            className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Create your first blog
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {blog.image && (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-2">
                  By {blog.author}
                </p>
                
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {blog.description}
                </p>

                {blog.createdAt && (
                  <p className="text-gray-500 text-xs mb-4">
                    {formatDate(blog.createdAt)}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Link
                      href={`/blogs/${blog._id}`}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded"
                      title="View Blog"
                    >
                      <Eye size={18} />
                    </Link>
                    
                    <Link
                      href={`/blogs/edit/${blog._id}`}
                      className="text-green-600 hover:text-green-700 p-1 rounded"
                      title="Edit Blog"
                    >
                      <Edit size={18} />
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="text-red-600 hover:text-red-700 p-1 rounded"
                      title="Delete Blog"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  {blog.exampleCode && (
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                      Has Code
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 