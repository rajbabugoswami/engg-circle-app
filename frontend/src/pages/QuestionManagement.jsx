import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const QuestionManagement = () => {
  const { eventId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    marks: 10,
    time_limit: 30
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [eventId]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    Object.keys(newQuestion).forEach(key => formData.append(key, newQuestion[key]));
    if (imageFile) formData.append('image', imageFile);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/questions`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchQuestions();
      setNewQuestion({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', marks: 10, time_limit: 30 });
      setImageFile(null);
    } catch (error) {
      console.error('Error adding question', error);
      alert('Failed to add question');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
          <Link to="/admin/dashboard" className="text-indigo-600 hover:underline">Back to Dashboard</Link>
        </div>

        {/* Add Question Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8 border-t-4 border-indigo-600">
          <h2 className="text-xl font-bold mb-4">Add New Question</h2>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Question Text</label>
              <textarea required className="mt-1 block w-full border border-gray-300 rounded p-2" rows="3"
                value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})}></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Question Image (Optional)</label>
              <input type="file" accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                onChange={e => setImageFile(e.target.files[0])} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map(opt => (
                <div key={opt}>
                  <label className="block text-sm font-medium text-gray-700">Option {opt}</label>
                  <input type="text" required className="mt-1 block w-full border border-gray-300 rounded p-2"
                    value={newQuestion[`option_${opt.toLowerCase()}`]} onChange={e => setNewQuestion({...newQuestion, [`option_${opt.toLowerCase()}`]: e.target.value})} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Correct Option</label>
                <select className="mt-1 block w-full border border-gray-300 rounded p-2"
                  value={newQuestion.correct_option} onChange={e => setNewQuestion({...newQuestion, correct_option: e.target.value})}>
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Points (Marks)</label>
                <input type="number" required className="mt-1 block w-full border border-gray-300 rounded p-2"
                  value={newQuestion.marks} onChange={e => setNewQuestion({...newQuestion, marks: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Limit (Sec)</label>
                <input type="number" required className="mt-1 block w-full border border-gray-300 rounded p-2"
                  value={newQuestion.time_limit} onChange={e => setNewQuestion({...newQuestion, time_limit: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition">
              Add Question
            </button>
          </form>
        </div>

        {/* Existing Questions List */}
        <div>
          <h2 className="text-xl font-bold mb-4">Current Questions ({questions.length})</h2>
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between">
                  <h3 className="font-bold text-lg">Q{idx + 1}. {q.question_text}</h3>
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold">{q.marks} pts | {q.time_limit}s</span>
                </div>
                {q.image_url && <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${q.image_url}`} alt="Q Img" className="mt-2 max-h-32 rounded border border-gray-300" />}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <div key={opt} className={`p-2 rounded ${q.correct_option === opt ? 'bg-green-100 border border-green-400 font-bold' : 'bg-gray-50 border border-gray-200'}`}>
                      {opt}. {q[`option_${opt.toLowerCase()}`]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionManagement;
