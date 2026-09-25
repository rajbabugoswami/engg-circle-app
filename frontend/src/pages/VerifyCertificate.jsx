import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyCertificate = () => {
  const [searchParams] = useSearchParams();
  const [certId, setCertId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('id')) {
      handleVerify(searchParams.get('id'));
    }
  }, [searchParams]);

  const handleVerify = async (idToVerify) => {
    const id = idToVerify || certId;
    if (!id) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/certificates/verify/${id}`);
      setResult(res.data.data);
    } catch (err) {
      setError('✕ Certificate Not Found or Invalid ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

      <div className="w-full max-w-lg relative z-10 hover-float">
        <Link to="/" className="text-gray-300 hover:text-white mb-6 inline-block font-medium">&larr; Back to Home</Link>
        <div className="glass-dark p-8 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-center">
            Verify Digital Certificate
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input 
              type="text" 
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. CERT-2026-XXXX" 
              className="flex-1 px-4 py-3 bg-white text-gray-900 border-0 rounded-xl focus:ring-4 focus:ring-purple-500/50 transition-shadow font-medium shadow-inner" 
            />
            <button 
              onClick={() => handleVerify(certId)}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-purple-500/50 shadow-lg font-bold transition-all disabled:opacity-50"
            >
              {loading ? '...' : 'Verify'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl font-bold text-center">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-900/40 border border-green-500/50 p-6 rounded-2xl text-left backdrop-blur-md">
              <h3 className="text-2xl font-bold text-green-400 flex items-center mb-6">
                <span className="text-3xl mr-3 bg-green-500/20 p-2 rounded-full">✓</span> AUTHENTICATED
              </h3>
              <div className="space-y-4 text-gray-200">
                <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">Participant</span> <span className="font-bold text-white">{result.name}</span></p>
                <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">Event</span> <span className="font-bold text-white text-right">{result.event_name}</span></p>
                <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">Score</span> <span className="font-bold text-blue-400">{result.score} pts</span></p>
                <p className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">Date</span> <span className="font-medium">{new Date(result.event_date).toLocaleDateString()}</span></p>
                <p className="flex justify-between"><span className="text-gray-400">ID</span> <span className="font-mono text-purple-300">{result.certificate_id}</span></p>
              </div>
              
              <a 
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${result.pdf_url}`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-8 block w-full text-center bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-colors border border-white/20"
              >
                View Original PDF
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
