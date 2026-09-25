import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const payload = {};
      if (formData.email) payload.email = formData.email;
      if (formData.password) payload.password = formData.password;
      
      if (Object.keys(payload).length === 0) {
        setMessage({ type: 'error', text: 'Please fill out at least one field to update' });
        return;
      }

      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/update`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: 'Credentials updated successfully. Please log in again.' });
      
      // If they change password or email, it's safer to make them log in again.
      setTimeout(() => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      }, 2000);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <Link to="/admin/dashboard" className="text-indigo-600 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Update Admin Credentials</h2>
          
          {message.text && (
            <div className={`p-4 mb-6 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Email Address (Optional)</label>
              <input
                type="email"
                placeholder="Leave blank to keep current email"
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {formData.password && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-type new password"
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required={!!formData.password}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition"
            >
              Update Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
