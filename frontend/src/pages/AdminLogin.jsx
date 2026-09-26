import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="w-full max-w-md relative z-10 hover-float">
        <Link to="/" className="text-gray-400 hover:text-white mb-6 inline-block font-medium">&larr; Back to Home</Link>
        <div className="glass-dark p-8 rounded-2xl shadow-2xl border border-gray-700/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">
              Admin Portal
            </h2>
            <p className="text-gray-500 mt-2">Manage your events and quizzes</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded-lg text-center font-semibold">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-indigo-500/50 transition-shadow font-medium shadow-inner" 
                placeholder="Admin Email" />
                
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-indigo-500/50 transition-shadow font-medium shadow-inner" 
                placeholder="Password" />
            </div>

            <button type="submit" 
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
