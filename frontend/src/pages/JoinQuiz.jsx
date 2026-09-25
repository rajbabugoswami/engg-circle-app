import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const JoinQuiz = () => {
  const [formData, setFormData] = useState({
    quizCode: '',
    name: '',
    email: '',
    college: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/participants/join`, formData);
      localStorage.setItem('participantSession', JSON.stringify({
        participantId: res.data.participantId,
        eventId: res.data.eventId,
        quizCode: res.data.quizCode,
        name: formData.name
      }));
      navigate('/quiz');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="w-full max-w-md relative z-10 hover-float">
        <Link to="/" className="text-gray-300 hover:text-white mb-6 inline-block font-medium">&larr; Back to Home</Link>
        <div className="glass-dark p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Join Live Quiz
            </h2>
            <p className="text-gray-400 mt-2">Enter your details to enter the arena</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded-lg text-center font-semibold">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <input type="text" name="quizCode" required value={formData.quizCode} onChange={handleChange} 
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
                placeholder="Event / Quiz Code" />
                
              <input type="text" name="name" required value={formData.name} onChange={handleChange} 
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
                placeholder="Full Name" />
                
              <input type="email" name="email" required value={formData.email} onChange={handleChange} 
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
                placeholder="Email Address" />
                
              <input type="text" name="college" value={formData.college} onChange={handleChange} 
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
                placeholder="College/Organization (Optional)" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none">
              {loading ? 'Connecting...' : 'Enter Waiting Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;
