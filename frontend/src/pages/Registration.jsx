import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Registration = () => {
  const [formData, setFormData] = useState({
    quizCode: '',
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    year: '',
    roll_number: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    // If URL has ?quizCode=XYZ, prefill it
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('quizCode');
    if (code) {
      setFormData(prev => ({ ...prev, quizCode: code }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/participants/register`, formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-dark p-8 rounded-2xl shadow-2xl text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Registration Successful!</h2>
          <p className="text-gray-300 mb-8">Please check your email for the confirmation details and keep your Quiz Code safe.</p>
          <Link to="/join" className="inline-block w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1">
            Go to Join Quiz Page
          </Link>
        </div>
      </div>
    );
  }

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
              Student Registration
            </h2>
            <p className="text-gray-400 mt-2">Enter your details to register for the event</p>
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
                
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} 
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
                placeholder="Mobile Number" />

              <input type="text" name="college" required value={formData.college} onChange={handleChange} 
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
                placeholder="College / Institute Name" />

              <div className="flex gap-4">
                <input type="text" name="course" required value={formData.course} onChange={handleChange} 
                  className="w-1/2 px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
                  placeholder="Course / Branch" />
                  
                <input type="text" name="year" required value={formData.year} onChange={handleChange} 
                  className="w-1/2 px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
                  placeholder="Year / Semester" />
              </div>

              <input type="text" name="roll_number" value={formData.roll_number} onChange={handleChange} 
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
                placeholder="Roll Number (Optional)" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none">
              {loading ? 'Registering...' : 'Submit Registration'}
            </button>

            <p className="text-center text-gray-400 mt-4 text-sm">
              Already registered? <Link to="/join" className="text-purple-400 hover:text-purple-300 underline">Join Quiz directly</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
