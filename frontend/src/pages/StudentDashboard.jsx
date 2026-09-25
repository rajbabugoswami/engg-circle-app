import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const fetchMyEvents = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/participants/my-events?email=${encodeURIComponent(email)}`);
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8 text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="text-gray-300 hover:text-white font-medium">&larr; Back to Home</Link>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Student Dashboard</h1>
        </div>

        {!results ? (
          <div className="glass-dark p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4">View My Certificates</h2>
            <p className="text-gray-400 mb-6">Enter your registered email to view your event participation and download certificates.</p>
            <form onSubmit={fetchMyEvents} className="space-y-4">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter Registered Email"
                className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 shadow-inner"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Find My Events'}
              </button>
            </form>
            {error && <p className="text-red-400 mt-4 text-center font-bold">{error}</p>}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Results for {email}</h2>
              <button onClick={() => setResults(null)} className="text-purple-400 hover:text-white underline font-semibold bg-white/10 px-4 py-2 rounded-lg">Use different email</button>
            </div>
            
            {results.length === 0 ? (
              <div className="glass-dark p-8 rounded-2xl text-center border border-purple-500/30">
                <p className="text-xl text-gray-300">No events found for this email.</p>
                <Link to="/join" className="text-purple-400 mt-4 inline-block hover:underline">Join an upcoming event</Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {results.map(record => (
                  <div key={record.id} className="glass-dark p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-purple-500/50 border border-transparent transition-all shadow-lg bg-white/5">
                    <div>
                      <h3 className="text-xl font-bold text-blue-300 mb-2">{record.event_name}</h3>
                      <div className="flex gap-4 text-sm text-gray-300 bg-black/30 p-2 rounded w-fit">
                        <p>Rank: <span className="font-bold text-white">#{record.rank_pos || 'N/A'}</span></p>
                        <p>Score: <span className="font-bold text-white">{record.score}</span></p>
                      </div>
                      {record.certificate_id && (
                        <p className="text-xs text-gray-400 mt-3 font-mono bg-black/20 p-1 rounded inline-block">ID: {record.certificate_id}</p>
                      )}
                    </div>
                    
                    <div>
                      {record.pdf_url ? (
                        <a 
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${record.pdf_url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg inline-block text-center transform transition-transform hover:-translate-y-1"
                        >
                          ↓ Download Certificate
                        </a>
                      ) : (
                        <span className="px-6 py-3 bg-gray-800 text-gray-400 font-bold rounded-xl cursor-not-allowed inline-block border border-gray-700">
                          {record.rank_pos ? 'Certificate Pending' : 'Not Eligible'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
