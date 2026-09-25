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
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="The Engg Circle Logo" className="h-12 w-auto object-contain" />
            <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
              The Engg Circle
            </div>
          </div>
          <nav className="space-x-6">
            <Link to="/join" className="text-gray-300 hover:text-white font-medium transition-colors">Join Quiz</Link>
            <Link to="/verify-certificate" className="text-gray-300 hover:text-white font-medium transition-colors">Verify</Link>
            <Link to="/admin" className="text-gray-300 hover:text-white font-medium transition-colors">Admin</Link>
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

      <footer className="relative z-10 py-6 border-t border-white/10 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} The Engg Circle. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
