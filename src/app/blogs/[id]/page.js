'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function BlogView() {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/blogs/?id=${params.id}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`http://localhost:5000/api/blogs/${params.id}`);
        alert('Blog deleted successfully');
        window.location.href = '/blogs';
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/blogs"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition duration-200"
          >
            <ArrowLeft size={20} />
            Back to Blogs
          </Link>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Blog not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/blogs"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition duration-200"
        >
          <ArrowLeft size={20} />
          Back to Blogs
        </Link>
        
        <div className="flex gap-2">
          <Link
            href={`/blogs/edit/${blog._id}`}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            <Edit size={18} />
            Edit
          </Link>
          
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Featured Image */}
        {blog.image && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-6 pb-6 border-b">
            <span>By <strong>{blog.author}</strong></span>
            {blog.createdAt && (
              <span>{formatDate(blog.createdAt)}</span>
            )}
            {blog.exampleCode && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Contains Code
              </span>
            )}
          </div>

          {/* Description */}
          <div className="text-lg text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg">
            {blog.description}
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Code Section */}
          {(blog.exampleCode || blog.code) && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {blog.exampleCode || 'Code Example'}
              </h2>
              
              {blog.code && (
                <div className="rounded-lg overflow-hidden border">
                  <CodeMirror
                    value={blog.code}
                    theme={oneDark}
                    editable={false}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
} 