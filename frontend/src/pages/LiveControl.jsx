import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

const LiveControl = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(-1);
  const [quizState, setQuizState] = useState('PENDING'); // PENDING, LIVE, QUESTION_ACTIVE, LEADERBOARD, COMPLETED, PRESENTATION
  const [participantsCount, setParticipantsCount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [answersCount, setAnswersCount] = useState({ A: 0, B: 0, C: 0, D: 0 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [presentationUrl, setPresentationUrl] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const resEvent = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setEvent(resEvent.data);
      
      const resQ = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}/questions`, { headers: { Authorization: `Bearer ${token}` } });
      setQuestions(resQ.data);

      const resP = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}/participants`, { headers: { Authorization: `Bearer ${token}` } });
      setParticipants(resP.data);

      try {
        const resPres = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}/presentation`, { headers: { Authorization: `Bearer ${token}` } });
        setPresentationUrl(resPres.data.fileUrl);
      } catch (e) {}

      socket.emit('admin_join', { quizCode: resEvent.data.quiz_code });

      socket.on('participant_update', ({ connectedList }) => {
        setConnectedIds(new Set(connectedList));
        setParticipantsCount(connectedList.length);
      });

      socket.on('answer_received', (data) => {
        setAnswersCount(prev => ({ ...prev, [data.answer]: prev[data.answer] + 1 }));
      });

      socket.on('question_ended', () => {
        setQuizState('LEADERBOARD');
      });

    } catch (error) {
      console.error(error);
    }
  };

  const startQuiz = async () => {
    // API call to set status to LIVE
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}`, { status: 'LIVE' }, { headers: { Authorization: `Bearer ${token}` } });
      setQuizState('LIVE');
      socket.emit('admin_action', { action: 'start_quiz', quizCode: event.quiz_code });
    } catch (error) {
      console.error(error);
    }
  };

  const startNextQuestion = () => {
    const nextIndex = currentQIndex + 1;
    if (nextIndex >= questions.length) {
      alert('No more questions!');
      return;
    }
    setCurrentQIndex(nextIndex);
    const q = questions[nextIndex];
    setAnswersCount({ A: 0, B: 0, C: 0, D: 0 });
    
    const timeLimit = q.time_limit || event.default_time;
    socket.emit('start_question', { quizCode: event.quiz_code, question: q, timeLimit });
    
    setQuizState('QUESTION_ACTIVE');
    
    // Admin local timer
    let time = timeLimit;
    setTimeLeft(time);
    const timer = setInterval(() => {
      time -= 1;
      setTimeLeft(time);
      if (time <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  };

  const showPresentation = () => {
    if (!presentationUrl) {
      alert('No presentation uploaded for this event.');
      return;
    }
    setQuizState('PRESENTATION');
    socket.emit('admin_action', { action: 'show_presentation', quizCode: event.quiz_code, presentationUrl });
  };

  const endQuiz = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}`, { status: 'COMPLETED' }, { headers: { Authorization: `Bearer ${token}` } });
      socket.emit('admin_action', { action: 'end_quiz', quizCode: event.quiz_code });
      setQuizState('COMPLETED');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <p className="text-gray-500 mt-1">Quiz Code: <span className="font-bold text-indigo-600">{event.quiz_code}</span></p>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-green-600">{participantsCount}</span>
            <span className="text-sm text-gray-500">Connected Participants</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            {quizState === 'PENDING' && (
              <div className="text-center py-12">
                <button onClick={startQuiz} className="bg-indigo-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-indigo-700 shadow-lg transition-transform transform hover:scale-105">
                  START EVENT
                </button>
              </div>
            )}

            {(quizState === 'LIVE' || quizState === 'LEADERBOARD' || quizState === 'PRESENTATION') && (
              <div className="text-center py-12 flex flex-col items-center gap-4">
                {presentationUrl && quizState !== 'PRESENTATION' && (
                  <button onClick={showPresentation} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-blue-700 shadow w-full max-w-md">
                    BROADCAST PRESENTATION
                  </button>
                )}
                
                <button onClick={startNextQuestion} className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-green-700 shadow w-full max-w-md">
                  START {currentQIndex === -1 ? 'FIRST' : 'NEXT'} QUESTION
                </button>
              </div>
            )}

            {quizState === 'QUESTION_ACTIVE' && questions[currentQIndex] && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-500">Question {currentQIndex + 1} of {questions.length}</h2>
                  <span className="text-2xl font-bold text-red-600">{timeLeft}s remaining</span>
                </div>
                <div className="mb-4 flex gap-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">Answered: {Object.values(answersCount).reduce((a, b) => a + b, 0)} / {participantsCount}</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">Not Answered: {Math.max(0, participantsCount - Object.values(answersCount).reduce((a, b) => a + b, 0))}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{questions[currentQIndex].question_text}</h3>
                
                {questions[currentQIndex].image_url && (
                  <div className="mb-6">
                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${questions[currentQIndex].image_url}`} alt="Q Img" className="max-h-48 rounded border shadow" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-6">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <div key={opt} className="bg-gray-50 p-4 rounded-lg border flex justify-between items-center">
                      <span className="font-bold">{opt}. {questions[currentQIndex][`option_${opt.toLowerCase()}`]}</span>
                      <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full font-bold">{answersCount[opt]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow flex flex-col h-full max-h-[800px]">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Live Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Registered:</span>
                <span className="font-bold">{participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Connected:</span>
                <span className="font-bold text-green-600">{participantsCount} / {participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Answers:</span>
                <span className="font-bold">{Object.values(answersCount).reduce((a, b) => a + b, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-bold ${quizState === 'QUESTION_ACTIVE' ? 'text-green-600' : 'text-orange-500'}`}>{quizState}</span>
              </div>
            </div>

            <div className="mt-6 border-t pt-4 flex-1 overflow-y-auto">
               <h4 className="text-sm font-bold text-gray-500 mb-3 sticky top-0 bg-white pb-2">Participant List</h4>
               <ul className="space-y-2">
                 {participants.map(p => (
                   <li key={p.id} className="flex justify-between items-center text-sm border-b pb-1">
                     <span className="font-medium text-gray-700 truncate mr-2" title={p.name}>{p.name}</span>
                     {connectedIds.has(p.id) 
                       ? <span className="text-xs text-green-600 whitespace-nowrap">🟢 Connected</span> 
                       : <span className="text-xs text-gray-400 whitespace-nowrap">⚪ Not Joined</span>}
                   </li>
                 ))}
               </ul>
            </div>

            <div className="mt-4 border-t pt-4">
              <button onClick={endQuiz} className="w-full bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded font-bold transition-colors">
                END QUIZ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveControl;
