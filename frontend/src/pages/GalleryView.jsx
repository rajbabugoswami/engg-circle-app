import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const GalleryView = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gallery`);
        setGallery(res.data);
      } catch (error) {
        console.error('Error fetching gallery', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen bg-[#050914] flex flex-col text-white relative overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      <header className="relative z-50 bg-white/5 backdrop-blur-md border-b border-blue-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 md:gap-4 group">
            <img src="/logo.jpeg" alt="The Engg Circle Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover shadow-[0_0_15px_rgba(59,130,246,0.3)] border-2 border-blue-400/30 group-hover:scale-105 transition-transform" />
            <span 
              className="text-2xl md:text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ fontFamily: "'Pacifico', cursive", fontWeight: 400, paddingTop: '4px' }}
            >
              The Engg Circle
            </span>
          </Link>
          <Link to="/" className="px-4 py-2 rounded-lg border border-transparent hover:border-blue-400/50 hover:bg-blue-500/10 text-gray-200 hover:text-white text-base font-semibold transition-all duration-300">
            Home
          </Link>
        </div>
      </header>

      <main className="flex-grow relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 drop-shadow-lg">
              Event Highlights
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              Memories and moments from our previous quizzes and events.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : gallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gallery.map(img => (
                <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:border-blue-400/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:-translate-y-2 cursor-pointer">
                  <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img.image_url}`} alt={img.title} className="w-full h-64 object-cover transform transition-transform duration-700 group-hover:scale-110" />
                  {img.title && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#050914] via-[#050914]/80 to-transparent">
                      <p className="text-white font-semibold tracking-wide truncate">{img.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              <p>No images have been uploaded yet.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 py-6 border-t border-white/10 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} The Engg Circle. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default GalleryView;
