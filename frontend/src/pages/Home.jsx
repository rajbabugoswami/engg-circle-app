import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0b1320] flex flex-col font-sans text-white relative overflow-hidden">
      {/* Animated background blobs matching logo colors */}
      <div className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: "url('/logo.jpeg')" }}></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2a9df4] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <header className="relative z-10 glass-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
          <div className="flex items-center justify-center">
            <img src="/logo.jpeg" alt="The Engg Circle Logo" className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover shadow-[0_0_15px_rgba(59,130,246,0.3)] border-2 border-blue-400/30" />
          </div>
          <nav className="flex flex-wrap justify-center gap-1.5 md:gap-4 items-center mt-2 md:mt-0">
            <Link to="/join" className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-full border border-transparent hover:border-blue-400/50 hover:bg-blue-500/10 text-gray-300 hover:text-white text-sm md:text-base font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">Join Quiz</Link>
            <Link to="/student/dashboard" className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-full border border-transparent hover:border-blue-400/50 hover:bg-blue-500/10 text-gray-300 hover:text-white text-sm md:text-base font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">My Events</Link>
            <Link to="/verify-certificate" className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-full border border-transparent hover:border-blue-400/50 hover:bg-blue-500/10 text-gray-300 hover:text-white text-sm md:text-base font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">Verify</Link>
            <Link to="/admin" className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-full border border-purple-500/30 bg-purple-500/10 hover:border-purple-400 hover:bg-purple-500/20 text-purple-100 hover:text-white text-sm md:text-base font-bold tracking-wide transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative z-10">
        <div className="text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Talk. Build. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2a9df4] to-blue-300">Innovate.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            The official real-time platform for live engineering quizzes, polls, and certificates. 
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/join" className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg font-bold shadow-lg hover:shadow-purple-500/50 transition-all hover:-translate-y-1 overflow-hidden">
              <span className="relative z-10">Join a Quiz Now</span>
              <div className="absolute inset-0 h-full w-full bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
          </div>
        </div>
      </main>

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
