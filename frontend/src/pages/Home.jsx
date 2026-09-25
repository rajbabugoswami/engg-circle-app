import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gallery`);
        setGallery(res.data);
      } catch (error) {
        console.error('Error fetching gallery', error);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen bg-[#050914] flex flex-col text-white relative overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Pacifico&display=swap');
        `}
      </style>
      
      {/* Background logo - highly visible behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[350px] sm:h-[350px] md:w-[600px] md:h-[600px] opacity-30 bg-center bg-no-repeat bg-cover rounded-full pointer-events-none" style={{ backgroundImage: "url('/logo.jpeg')" }}></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

      <header className="relative z-50 bg-white/5 backdrop-blur-md border-b border-blue-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          
          {/* Left: Logo and Brand Name */}
          <div className="flex items-center gap-3 md:gap-4">
            <img src="/logo.jpeg" alt="The Engg Circle Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover shadow-[0_0_15px_rgba(59,130,246,0.3)] border-2 border-blue-400/30" />
            <span 
              className="text-2xl md:text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ fontFamily: "'Pacifico', cursive", fontWeight: 400, paddingTop: '4px' }}
            >
              The Engg Circle
            </span>
          </div>
          
          {/* Right: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/join" className="px-4 py-2 rounded-lg border border-transparent hover:border-blue-400/50 hover:bg-blue-500/10 text-gray-200 hover:text-white text-base font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">Join Quiz</Link>
            <Link to="/student/dashboard" className="px-4 py-2 rounded-lg border border-transparent hover:border-blue-400/50 hover:bg-blue-500/10 text-gray-200 hover:text-white text-base font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">My Events</Link>
            <Link to="/verify-certificate" className="px-4 py-2 rounded-lg border border-transparent hover:border-blue-400/50 hover:bg-blue-500/10 text-gray-200 hover:text-white text-base font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">Verify</Link>
            <Link to="/admin" className="px-4 py-2 ml-2 bg-purple-500/20 rounded-lg border border-purple-500/40 hover:border-purple-400 hover:bg-purple-500/30 text-purple-100 hover:text-white text-base font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]">Admin</Link>
          </nav>

          {/* Right: Mobile Hamburger Icon */}
          <button 
            className="md:hidden text-gray-200 hover:text-white focus:outline-none p-2 bg-white/5 rounded-lg border border-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <nav className="md:hidden absolute top-full left-0 w-full bg-[#050914]/95 backdrop-blur-xl border-b border-blue-500/20 px-4 py-4 flex flex-col gap-3 shadow-2xl">
            <Link to="/join" className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-gray-200 hover:text-white text-center font-semibold transition-all" onClick={() => setIsMenuOpen(false)}>Join Quiz</Link>
            <Link to="/student/dashboard" className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-gray-200 hover:text-white text-center font-semibold transition-all" onClick={() => setIsMenuOpen(false)}>My Events</Link>
            <Link to="/verify-certificate" className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 text-gray-200 hover:text-white text-center font-semibold transition-all" onClick={() => setIsMenuOpen(false)}>Verify</Link>
            <Link to="/admin" className="px-4 py-3 mt-2 bg-purple-500/20 rounded-lg border border-purple-500/40 text-purple-100 hover:text-white text-center font-bold transition-all" onClick={() => setIsMenuOpen(false)}>Admin</Link>
          </nav>
        )}
      </header>

      <main className="flex-grow flex items-center justify-center relative z-10 p-4 md:p-8">
        <div className="text-center px-4 max-w-5xl mx-auto flex flex-col justify-center items-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 md:mb-8 mt-4">
            Talk. Build. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2a9df4] to-blue-300">Innovate.</span>
          </h1>
          <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 md:mb-12">
            The official real-time platform for live engineering quizzes, polls, and certificates. 
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 w-full sm:w-auto">
            <Link to="/join" className="group relative w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-base md:text-lg font-bold shadow-lg hover:shadow-purple-500/50 transition-all hover:-translate-y-1 overflow-hidden flex justify-center items-center">
              <span className="relative z-10">Join a Quiz Now</span>
              <div className="absolute inset-0 h-full w-full bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
          </div>
        </div>
      </main>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="relative z-10 py-16 px-4 md:px-8 bg-white/5 backdrop-blur-md border-t border-blue-500/20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 drop-shadow-lg">
              Event Highlights
            </h2>
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
          </div>
        </section>
      )}

      <footer className="relative z-10 py-6 border-t border-white/10 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
        <a href="https://www.instagram.com/the_engg_circle?stkn=a3Rod3RmaW83cTV4" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-colors flex items-center gap-2 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          Follow us on Instagram
        </a>
        <p>&copy; {new Date().getFullYear()} The Engg Circle. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
