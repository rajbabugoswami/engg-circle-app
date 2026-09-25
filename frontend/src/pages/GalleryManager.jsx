import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gallery`);
      setImages(res.data);
    } catch (error) {
      console.error('Error fetching gallery', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select an image");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', title);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gallery`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });
      setSelectedFile(null);
      setTitle('');
      fetchGallery();
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gallery/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchGallery();
    } catch (error) {
      alert("Failed to delete image");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800 font-bold">&larr; Back</Link>
        <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8 max-w-xl">
        <h2 className="text-xl font-bold mb-4">Upload New Image</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Title / Description (Optional)</label>
            <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. Winner of Quiz 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Image</label>
            <input type="file" accept="image/*" onChange={(e)=>setSelectedFile(e.target.files[0])} className="w-full" required />
          </div>
          <button type="submit" disabled={loading || !selectedFile} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50 mt-2">
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map(img => (
          <div key={img.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col">
            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img.image_url}`} alt={img.title} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col flex-grow justify-between">
              <p className="font-semibold text-gray-800 mb-2 truncate">{img.title || 'Untitled'}</p>
              <button onClick={() => handleDelete(img.id)} className="text-red-600 hover:text-red-800 text-sm font-bold text-left">Delete</button>
            </div>
          </div>
        ))}
        {images.length === 0 && <p className="text-gray-500 col-span-full">No images in gallery yet.</p>}
      </div>
    </div>
  );
};

export default GalleryManager;
