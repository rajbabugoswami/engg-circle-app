import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

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
    <div className="min-h-screen bg-[#0b1320] flex flex-col items-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      
      <div className="w-full max-w-2xl relative z-10 mt-8">
        
        {quizState === 'WAITING' && (
          <div className="text-center p-8 glass-dark rounded-3xl border border-gray-700/50">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full mx-auto flex items-center justify-center mb-6 animate-pulse">
              <span className="text-4xl">⏳</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-4 text-white">Welcome, {session.name}!</h2>
            <div className="bg-purple-900/30 text-purple-300 p-4 rounded-xl border border-purple-500/30 font-semibold mb-6">
              You are in the waiting room. The event will begin shortly...
            </div>
            <p className="text-sm text-gray-400 font-mono">Connected to: {session.quizCode}</p>
          </div>
        )}

        {quizState === 'PRESENTATION' && (
          <div className="w-full h-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-white text-center">Presentation Broadcast</h2>
            <div className="w-full bg-white rounded-xl overflow-hidden shadow-2xl h-[60vh]">
              <iframe 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${presentationUrl}`} 
                title="Presentation" 
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {quizState === 'WAITING_FOR_QUESTION' && (
          <div className="text-center text-white">
            <h2 className="text-xl font-bold mb-2">Quiz is LIVE!</h2>
            <p className="text-gray-300">Get ready for the first question...</p>
          </div>
        )}

        {quizState === 'ACTIVE' && currentQuestion && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-gray-400">Q. {currentQuestion.order_num}</span>
              <span className={`text-xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-indigo-400'}`}>
                {timeLeft}s
              </span>
            </div>
            
            <h2 className="text-2xl font-bold mb-6 text-white">{currentQuestion.question_text}</h2>
            
            {currentQuestion.image_url && (
              <div className="mb-6 flex justify-center">
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${currentQuestion.image_url}`} alt="Question visual" className="max-h-48 rounded-lg shadow-md border border-gray-600" />
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optKey = `option_${opt.toLowerCase()}`;
                if (!currentQuestion[optKey]) return null;
                return (
                  <button 
                    key={opt}
                    onClick={() => !submitted && setSelectedAnswer(opt)}
                    className={`p-4 text-left border rounded-lg transition-colors ${
                      selectedAnswer === opt ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 
                      submitted ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <span className="font-bold mr-2 text-indigo-400">{opt}.</span> {currentQuestion[optKey]}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={submitAnswer}
              disabled={!selectedAnswer || submitted}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                !selectedAnswer || submitted ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-lg'
              }`}
            >
              {submitted ? 'Answer Submitted' : 'Submit Answer'}
            </button>
          </div>
        )}

        {quizState === 'LEADERBOARD' && (
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((l, i) => (
                  <div key={i} className={`p-3 rounded-md flex justify-between ${l.participantId === session.participantId ? 'bg-indigo-900 font-bold border border-indigo-400 text-white' : 'bg-gray-800 border border-gray-700 text-gray-300'}`}>
                    <span>{i + 1}. {l.name}</span>
                    <span>{l.score} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Calculating scores... Get ready for the next question!</p>
            )}
          </div>
        )}

        {quizState === 'ENDED' && (
          <div className="text-center glass-dark p-8 rounded-3xl border border-gray-700/50">
            <div className="w-24 h-24 bg-green-500/20 rounded-full mx-auto flex items-center justify-center mb-6">
              <span className="text-5xl">🏆</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              Quiz Ended!
            </h2>
            <p className="text-gray-300 mb-8 text-lg">Thank you for participating.</p>
            
            {finalRank && (
              <div className="bg-white/10 border border-white/20 p-6 rounded-2xl">
                <h3 className="text-xl text-gray-400 mb-2">Your Final Rank</h3>
                <div className="text-6xl font-black text-white mb-4">#{finalRank}</div>
                <div className="text-xl font-bold text-blue-400">Score: {finalScore} pts</div>
              </div>
            )}
            
            <p className="mt-8 text-sm text-gray-500">Keep an eye on your email for your certificate!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizInterface;
