import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalParticipants: 0, totalQuestions: 0, certificates: 0 });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
      setStats(prev => ({ ...prev, totalEvents: res.data.length }));
    } catch (error) {
      console.error('Error fetching events', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}/duplicate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (error) {
      alert('Failed to duplicate event');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link to="/admin/settings" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 shadow-sm">
            ⚙️ Settings
          </Link>
          <Link to="/admin/create-event" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow-sm">
            + Create Event
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Active Events</h3>
          <p className="text-4xl font-extrabold text-indigo-600 mt-2">{stats.totalEvents}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{event.quiz_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.event_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'LIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <Link to={`/admin/events/${event.id}/questions`} className="text-indigo-600 hover:text-indigo-900">Questions</Link>
                  <Link to={`/admin/events/${event.id}/presentation`} className="text-indigo-600 hover:text-indigo-900">Presentation</Link>
                  <Link to={`/admin/events/${event.id}/certificate-editor`} className="text-blue-600 hover:text-blue-900">Cert Template</Link>
                  <Link to={`/admin/events/${event.id}/certificates`} className="text-purple-600 hover:text-purple-900">Certificates</Link>
                  {event.status !== 'COMPLETED' && <Link to={`/admin/live/${event.id}`} className="text-green-600 hover:text-green-900 font-bold">START</Link>}
                  
                  <button onClick={() => handleDuplicate(event.id)} className="text-orange-600 hover:text-orange-900 ml-4 font-semibold">Copy</button>
                  <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No events found. Create one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
