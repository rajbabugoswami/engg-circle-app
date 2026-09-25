import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const PresentationUpload = () => {
  const { eventId } = useParams();
  const [file, setFile] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);

  useEffect(() => {
    fetchPresentation();
  }, [eventId]);

  const fetchPresentation = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/presentation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentFile(res.data.fileUrl);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error('Error fetching presentation', error);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('presentation', file);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/presentation`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setCurrentFile(res.data.fileUrl);
      alert('Presentation uploaded successfully!');
    } catch (error) {
      console.error('Error uploading presentation', error);
      alert('Upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upload Presentation</h2>
          <Link to="/admin/dashboard" className="text-indigo-600 hover:underline">Back</Link>
        </div>
        
        {currentFile && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-800">
            <p className="font-bold">Active Presentation:</p>
            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${currentFile}`} target="_blank" rel="noreferrer" className="text-sm underline break-all">
              {currentFile}
            </a>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select PDF or PPT File</label>
            <input 
              type="file" 
              accept=".pdf,.ppt,.pptx" 
              onChange={(e) => setFile(e.target.files[0])} 
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              required 
            />
            <p className="text-xs text-gray-500 mt-1">Upload a PDF for most robust browser rendering.</p>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default PresentationUpload;
