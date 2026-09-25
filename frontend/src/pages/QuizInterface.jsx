import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

const QuizInterface = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [quizState, setQuizState] = useState('WAITING'); // WAITING, ACTIVE, LEADERBOARD, ENDED
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [presentationUrl, setPresentationUrl] = useState(null);
  const [finalRank, setFinalRank] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  
  const [certUrl, setCertUrl] = useState(null);
  const [isCheckingCert, setIsCheckingCert] = useState(false);
  const [certError, setCertError] = useState('');

  const checkCertificate = async () => {
    setIsCheckingCert(true);
    setCertError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/participants/${session.participantId}/certificate`);
      if (res.data && res.data.pdf_url) {
        setCertUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${res.data.pdf_url}`);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setCertError('Your certificate is still generating or you did not qualify. Please try again in a moment.');
      } else {
        setCertError('Error checking certificate. Please try again later.');
      }
    } finally {
      setIsCheckingCert(false);
    }
  };

  useEffect(() => {
    const s = localStorage.getItem('participantSession');
    if (!s) {
      navigate('/join');
      return;
    }
    const sessionData = JSON.parse(s);
    setSession(sessionData);

    socket.emit('participant_join', { quizCode: sessionData.quizCode, participantId: sessionData.participantId });

    socket.on('quiz_started', () => {
      setQuizState('WAITING_FOR_QUESTION');
    });

    socket.on('question_started', (data) => {
      setCurrentQuestion(data.question);
      setQuizState('ACTIVE');
      setSelectedAnswer(null);
      setSubmitted(false);
      
      // Calculate exact time left based on server endTime
      const calculateRemaining = () => {
        const remaining = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining > 0) {
          setTimeout(calculateRemaining, 1000);
        }
      };
      calculateRemaining();
    });

    socket.on('question_ended', () => {
      setQuizState('LEADERBOARD');
    });

    socket.on('leaderboard_updated', (data) => {
      setLeaderboard(data.leaderboard);
    });

    socket.on('show_presentation', (data) => {
      setPresentationUrl(data.presentationUrl);
      setQuizState('PRESENTATION');
    });

    socket.on('quiz_ended', (data) => {
      setQuizState('ENDED');
      if (data && data.finalLeaderboard) {
        const myRankData = data.finalLeaderboard.find(p => p.participantId === sessionData.participantId);
        if (myRankData) {
          setFinalRank(myRankData.rank);
          setFinalScore(myRankData.score);
        }
      }
    });

    return () => {
      socket.off('quiz_started');
      socket.off('show_presentation');
      socket.off('question_started');
      socket.off('question_ended');
      socket.off('leaderboard_updated');
      socket.off('quiz_ended');
    };
  }, [navigate]);

  const submitAnswer = () => {
    if (!selectedAnswer || submitted) return;
    setSubmitted(true);
    socket.emit('submit_answer', {
      quizCode: session.quizCode,
      participantId: session.participantId,
      questionId: currentQuestion.id,
      answer: selectedAnswer
    });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 relative overflow-hidden">
      
      <div className="w-full max-w-2xl relative z-10 mt-4 md:mt-8">
        
        {quizState === 'WAITING' && (
          <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full mx-auto flex items-center justify-center mb-6 animate-pulse">
              <span className="text-4xl">⏳</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-4 text-gray-900">Welcome, {session.name}!</h2>
            <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-100 font-semibold mb-6">
              You are in the waiting room. The event will begin shortly...
            </div>
            <p className="text-sm text-gray-500 font-mono bg-gray-100 py-2 px-4 rounded-full inline-block">Connected to: {session.quizCode}</p>
          </div>
        )}

        {quizState === 'PRESENTATION' && (
          <div className="w-full h-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Presentation Broadcast</h2>
            <div className="w-full bg-white rounded-xl overflow-hidden shadow-2xl h-[60vh] border border-gray-200">
              <iframe 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${presentationUrl}`} 
                title="Presentation" 
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {quizState === 'WAITING_FOR_QUESTION' && (
          <div className="text-center bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Quiz is LIVE!</h2>
            <p className="text-gray-600 text-lg">Get ready for the first question...</p>
          </div>
        )}

        {quizState === 'ACTIVE' && currentQuestion && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Question {currentQuestion.order_num}</span>
              <div className={`px-4 py-1 rounded-full font-bold text-lg ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-700'}`}>
                {timeLeft}s
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-gray-900 leading-tight">{currentQuestion.question_text}</h2>
            
            {currentQuestion.image_url && (
              <div className="mb-6 flex justify-center">
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${currentQuestion.image_url}`} alt="Question visual" className="max-h-56 rounded-xl shadow-sm border border-gray-200" />
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-3 md:gap-4 mb-6">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optKey = `option_${opt.toLowerCase()}`;
                if (!currentQuestion[optKey]) return null;
                return (
                  <button 
                    key={opt}
                    onClick={() => !submitted && setSelectedAnswer(opt)}
                    className={`p-4 md:p-5 text-left border-2 rounded-xl transition-all duration-200 ${
                      selectedAnswer === opt 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : submitted 
                          ? 'bg-gray-50 text-gray-400 border-gray-200' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className={`font-bold mr-3 ${selectedAnswer === opt ? 'text-indigo-200' : 'text-indigo-600'}`}>{opt}.</span>
                      <span className="text-lg font-medium">{currentQuestion[optKey]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button 
              onClick={submitAnswer}
              disabled={!selectedAnswer || submitted}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-200 ${
                !selectedAnswer || submitted 
                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              {submitted ? 'Answer Submitted ✓' : 'Submit Answer'}
            </button>
          </div>
        )}

        {quizState === 'LEADERBOARD' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
            <h2 className="text-3xl font-black mb-6 text-gray-900 border-b pb-4">Live Leaderboard</h2>
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((l, i) => (
                  <div key={i} className={`p-4 rounded-xl flex justify-between items-center ${l.participantId === session.participantId ? 'bg-indigo-50 font-bold border-2 border-indigo-500 text-indigo-900' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
                    <span className="text-lg flex items-center gap-3">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-700'}`}>
                        {i + 1}
                      </span>
                      {l.name}
                    </span>
                    <span className="text-lg font-black">{l.score} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Calculating scores... Get ready for the next question!</p>
              </div>
            )}
          </div>
        )}

        {quizState === 'ENDED' && (
          <div className="text-center bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner">
              <span className="text-5xl">🏆</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">
              Quiz Ended!
            </h2>
            <p className="text-gray-600 mb-8 text-lg font-medium">Thank you for participating in this event.</p>
            
            {finalRank && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-8 rounded-2xl shadow-sm inline-block min-w-[250px]">
                <h3 className="text-lg font-bold text-indigo-800 mb-2 uppercase tracking-wide">Your Final Rank</h3>
                <div className="text-7xl font-black text-indigo-600 mb-4 drop-shadow-sm">#{finalRank}</div>
                <div className="text-2xl font-black text-blue-700 bg-white inline-block px-6 py-2 rounded-full shadow-sm">Score: {finalScore}</div>
              </div>
            )}
            
            <div className="mt-10 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Your Certificate</h3>
              {certUrl ? (
                <a 
                  href={certUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg inline-block text-lg transform transition-transform hover:-translate-y-1 hover:shadow-xl"
                >
                  ↓ Download My Certificate
                </a>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-indigo-700 mb-4 font-medium">Your digital certificate with a unique QR code is being prepared.</p>
                  <button 
                    onClick={checkCertificate}
                    disabled={isCheckingCert}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {isCheckingCert ? 'Checking...' : 'Check For Certificate'}
                  </button>
                  {certError && <p className="text-red-500 mt-3 font-medium text-sm">{certError}</p>}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizInterface;
