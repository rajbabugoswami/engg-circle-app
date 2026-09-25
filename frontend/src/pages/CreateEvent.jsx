import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    duration: 60,
    default_time: 30,
    max_participants: 100,
    marks_per_q: 10,
    negative_marks: 0,
    organizer_name: '',
    institute_name: '',
    certificate_rank_limit: 3,
    cert_generation_enabled: true,
    auto_email_enabled: true
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error creating event', error);
      alert('Failed to create event');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white p-4 md:p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Event / Quiz</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Name</label>
              <input type="text" name="name" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" name="event_date" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" rows="3" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (mins)</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Question Time (sec)</label>
              <input type="number" name="default_time" value={formData.default_time} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Marks Per Question</label>
              <input type="number" name="marks_per_q" value={formData.marks_per_q} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Negative Marks</label>
              <input type="number" name="negative_marks" value={formData.negative_marks} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Participants</label>
              <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organizer Name</label>
              <input type="text" name="organizer_name" required value={formData.organizer_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institute / Organization Name</label>
              <input type="text" name="institute_name" required value={formData.institute_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. XYZ College" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Certificate Settings</h3>
            
            <div className="mb-6 max-w-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Eligibility (Top Ranks)</label>
              <select name="certificate_rank_limit" value={formData.certificate_rank_limit} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value={3}>Top 3 Students</option>
                <option value={5}>Top 5 Students</option>
                <option value={10}>Top 10 Students</option>
                <option value={50}>Top 50 Students</option>
                <option value={100}>Top 100 Students</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center space-x-3 text-gray-700">
                <input type="checkbox" checked={formData.cert_generation_enabled} onChange={(e) => setFormData({...formData, cert_generation_enabled: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                <span className="font-medium">Enable Automatic Certificates</span>
              </label>
              
              <label className="flex items-center space-x-3 text-gray-700">
                <input type="checkbox" checked={formData.auto_email_enabled} onChange={(e) => setFormData({...formData, auto_email_enabled: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                <span className="font-medium">Enable Automatic Email Delivery</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="mr-4 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
