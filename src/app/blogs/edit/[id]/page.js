'use client';

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import axios from "axios";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../../../../config/firebase';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Link as LinkExtension } from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const EditBlog = () => {
  const params = useParams();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [exampleCode, setExampleCode] = useState("");
  const [code, setCode] = useState("");
  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

  // Update editor content when blog data is loaded
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/blogs/?id=${params.id}`);
      const blog = response.data;
      
      setTitle(blog.title || "");
      setAuthor(blog.author || "");
      setContent(blog.content || "");
      setDescription(blog.description || "");
      setExampleCode(blog.exampleCode || "");
      setCode(blog.code || "");
      setCurrentImageUrl(blog.image || "");
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = currentImageUrl;

      // If a new image is selected, upload it
      if (image) {
        const storageRef = ref(storage, `blogs/${Date.now()}_${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        // Wait for upload to complete
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              try {
                imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("File available at", imageUrl);
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      }

      // Prepare form data
      const blogData = {
        title,
        author,
        content,
        description,
        imageUrl,
        exampleCode,
        code
      };

      // Submit the form data to your API endpoint
      await axios.put(`http://localhost:5000/api/blogs/${params.id}`, blogData);
      alert("Blog updated successfully");

      // Redirect to blog view
      window.location.href = `/blogs/${params.id}`;
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Error updating blog.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
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
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/blogs/${params.id}`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition duration-200"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Blog</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 p-8 dark:bg-gray-800 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="form-group">
          <label htmlFor="title" className="block text-gray-700 dark:text-gray-200 text-lg font-semibold mb-2">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write your title"
            className="w-full p-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author" className="block text-gray-700 dark:text-gray-200 text-lg font-semibold mb-2">Author</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className="w-full p-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image" className="block text-gray-700 dark:text-gray-200 text-lg font-semibold mb-2">Image</label>
          
          {/* Current Image Preview */}
          {currentImageUrl && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Current Image:</p>
              <img
                src={currentImageUrl}
                alt="Current blog image"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          )}
          
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setImage(e.target.files[0]);
              }
            }}
            className="w-full text-gray-700 dark:text-gray-200 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 p-3"
          />
          {image && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">New image selected: {image.name}</p>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">Leave empty to keep current image</p>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="block text-gray-700 dark:text-gray-200 text-lg font-semibold mb-2">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe here"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-black"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content" className="block text-gray-700 dark:text-gray-200 text-lg font-semibold mb-2">Content</label>
          
          {/* Tiptap Editor Toolbar */}
          {editor && (
            <div className="border border-gray-300 rounded-t-lg p-3 bg-gray-50 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  editor.isActive('strike') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Strike
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Quote
              </button>
            </div>
          )}
          
          {/* Tiptap Editor Content */}
          <EditorContent
            editor={editor}
            className="border border-gray-300 rounded-b-lg min-h-[200px] p-4 prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
            style={{ backgroundColor: 'white' }}
          />
          
          <style jsx global>{`
            .ProseMirror {
              outline: none;
              min-height: 200px;
              color: #000;
            }
            .ProseMirror p.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              float: left;
              color: #9ca3af;
              pointer-events: none;
              height: 0;
            }
          `}</style>
        </div>

        <div className="form-group">
          <label htmlFor="codeTopic" className="block text-gray-700 dark:text-gray-200 text-lg font-semibold mb-2">Code Topic (Optional)</label>
          <input
            id="codeTopic"
            type="text"
            value={exampleCode}
            onChange={(e) => setExampleCode(e.target.value)}
            placeholder="Code topic"
            className="w-full p-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <div className="form-group">
          <label className="block text-gray-700 dark:text-gray-200 text-lg font-semibold mb-2">Code Example (Optional)</label>
          <CodeMirror
            value={code}
            theme={oneDark}
            onChange={(value) => setCode(value)}
            height="200px"
            className="w-full border border-gray-300 text-black rounded-lg shadow-sm"
            style={{
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px'
            }}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={uploading}
          >
            {uploading ? "Updating Blog..." : "Update Blog"}
          </button>
          
          <Link
            href={`/blogs/${params.id}`}
            className="py-3 px-4 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditBlog; 