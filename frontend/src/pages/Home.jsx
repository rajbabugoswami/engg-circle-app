import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-white relative overflow-hidden" style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
          @import url('https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css');
        `}
      </style>

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/summit-hero-1.mp4" type="video/mp4" />
      </video>
      {/* Dark Vignette Gradient */}
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full px-6 md:px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt="The Engg Circle Logo" className="h-12 w-12 rounded-full object-cover border-2 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 bg-black/20 backdrop-blur-md px-8 py-3 rounded-full border border-white/10">
          <Link to="/join" className="text-sm font-medium text-white/80 hover:text-white transition-colors relative group">
            Join Quiz
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#F4BA3B] transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/student/dashboard" className="text-sm font-medium text-white/80 hover:text-white transition-colors relative group">
            My Events
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#F4BA3B] transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/verify-certificate" className="text-sm font-medium text-white/80 hover:text-white transition-colors relative group">
            Verify
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#F4BA3B] transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <Link to="/admin" className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-sm font-bold tracking-wide transition-all">
            Admin <i className="ri-arrow-right-up-line"></i>
          </Link>
          {/* Simple Mobile Menu Layout */}
          <nav className="flex md:hidden items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Link to="/join" className="text-xs font-medium text-white">Join</Link>
            <Link to="/student/dashboard" className="text-xs font-medium text-white">Events</Link>
            <Link to="/admin" className="text-xs font-medium text-[#F4BA3B]">Admin</Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="flex-grow flex flex-col justify-center relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] lg:text-[6.5rem] xl:text-[7.2rem] font-extrabold leading-[1.05] tracking-tight mb-6">
          Talk.<br />
          Build.<br />
          <span className="text-[#F4BA3B] drop-shadow-[0_0_30px_rgba(244,186,59,0.4)]">Innovate.</span>
        </h1>
        <p className="text-lg md:text-2xl text-white/80 max-w-2xl font-light mb-10 leading-relaxed">
          The official real-time platform for live engineering quizzes, polls, and certificates.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link to="/join" className="group flex items-center justify-center gap-3 px-8 py-4 bg-[#F4BA3B] hover:bg-[#e0a730] text-black rounded-full text-lg font-bold shadow-[0_0_20px_rgba(244,186,59,0.3)] transition-all hover:shadow-[0_0_35px_rgba(244,186,59,0.5)]">
            Start Your Journey <i className="ri-arrow-right-up-line text-xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"></i>
          </Link>
        </div>
      </main>

      {/* Bottom Bar */}
      <div className="relative z-10 w-full px-6 md:px-12 py-8 flex justify-between items-end">
        {/* Scroll Indicator */}
        <div className="flex flex-col items-center gap-3 w-8">
          <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 rotate-[-90deg] origin-center -translate-y-6">SCROLL</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-white/50 animate-pulse"></div>
          <i className="ri-arrow-down-line text-white/50"></i>
        </div>

        {/* Socials */}
        <div className="flex gap-3">
          <a href="https://www.instagram.com/the_engg_circle" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all hover:scale-110 backdrop-blur-sm">
             <i className="ri-instagram-line text-lg"></i>
          </a>
          <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all hover:scale-110 backdrop-blur-sm">
             <i className="ri-global-line text-lg"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
