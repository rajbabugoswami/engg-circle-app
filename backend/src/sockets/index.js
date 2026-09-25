const { Server } = require('socket.io');
const pool = require('../config/db');
const { triggerBulkCertificateGeneration } = require('../controllers/certificateController');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"]
    }
  });

  const activeQuizzes = {}; // quiz_code => state
  const connectedParticipants = {}; // quiz_code => Set of participantId

  io.on('connection', (socket) => {
    
    socket.on('admin_join', ({ quizCode }) => {
      socket.join(`admin_${quizCode}`);
      if (connectedParticipants[quizCode]) {
        socket.emit('participant_update', { connectedList: Array.from(connectedParticipants[quizCode]) });
      }
    });

    socket.on('participant_join', ({ quizCode, participantId }) => {
      socket.join(quizCode);
      socket.quizCode = quizCode;
      socket.participantId = participantId;
      
      if (!connectedParticipants[quizCode]) connectedParticipants[quizCode] = new Set();
      connectedParticipants[quizCode].add(participantId);

      io.to(`admin_${quizCode}`).emit('participant_update', { 
        connectedList: Array.from(connectedParticipants[quizCode]) 
      });
    });

    socket.on('disconnect', () => {
      if (socket.quizCode && socket.participantId) {
        if (connectedParticipants[socket.quizCode]) {
          connectedParticipants[socket.quizCode].delete(socket.participantId);
          io.to(`admin_${socket.quizCode}`).emit('participant_update', { 
            connectedList: Array.from(connectedParticipants[socket.quizCode])
          });
        }
      }
    });

    socket.on('admin_action', async ({ action, quizCode, presentationUrl }) => {
      if (action === 'start_quiz') {
        io.to(quizCode).emit('quiz_started');
      } else if (action === 'show_presentation') {
        io.to(quizCode).emit('show_presentation', { presentationUrl });
      } else if (action === 'end_quiz') {
        try {
          const [eventRows] = await pool.query('SELECT id FROM events WHERE quiz_code = ?', [quizCode]);
          if (eventRows.length > 0) {
            const eventId = eventRows[0].id;
            const [leaderboard] = await pool.query(`
              SELECT p.id as participantId, p.name, p.score, COALESCE(SUM(a.time_taken), 0) as total_time
              FROM participants p 
              LEFT JOIN answers a ON p.id = a.participant_id
              WHERE p.event_id = ? 
              GROUP BY p.id
              ORDER BY p.score DESC, total_time ASC, p.joined_at ASC
            `, [eventId]);
            
            // Add rank
            const ranked = leaderboard.map((p, index) => ({ ...p, rank: index + 1 }));
            io.to(quizCode).emit('quiz_ended', { finalLeaderboard: ranked });
            
            // Trigger background certificate generation
            triggerBulkCertificateGeneration(eventId);
          } else {
            io.to(quizCode).emit('quiz_ended', { finalLeaderboard: [] });
          }
        } catch (err) {
          console.error(err);
          io.to(quizCode).emit('quiz_ended', { finalLeaderboard: [] });
        }
      }
    });

    socket.on('start_question', ({ quizCode, question, timeLimit }) => {
      const endTime = Date.now() + timeLimit * 1000;
      activeQuizzes[quizCode] = { currentQuestion: question, endTime };
      
      io.to(quizCode).emit('question_started', { question, timeLimit, endTime });
      
      // Server-side authoritative timer
      setTimeout(async () => {
        io.to(quizCode).emit('question_ended', { questionId: question.id });
        io.to(`admin_${quizCode}`).emit('question_ended', { questionId: question.id });
        
        // Calculate Leaderboard
        try {
          const [eventRows] = await pool.query('SELECT id FROM events WHERE quiz_code = ?', [quizCode]);
          if (eventRows.length > 0) {
            const eventId = eventRows[0].id;
            
            // Get top participants for this event
            const [leaderboard] = await pool.query(`
              SELECT p.id as participantId, p.name, p.score, COALESCE(SUM(a.time_taken), 0) as total_time
              FROM participants p 
              LEFT JOIN answers a ON p.id = a.participant_id
              WHERE p.event_id = ? 
              GROUP BY p.id
              ORDER BY p.score DESC, total_time ASC, p.joined_at ASC 
              LIMIT 10
            `, [eventId]);
            
            // Broadcast leaderboard
            io.to(quizCode).emit('leaderboard_updated', { leaderboard });
            io.to(`admin_${quizCode}`).emit('leaderboard_updated', { leaderboard });
          }
        } catch (err) {
          console.error("Leaderboard calculation error", err);
        }

      }, timeLimit * 1000);
    });

    socket.on('submit_answer', async ({ quizCode, participantId, questionId, answer }) => {
      const quiz = activeQuizzes[quizCode];
      if (quiz && quiz.currentQuestion && quiz.currentQuestion.id === questionId) {
        const timeTaken = Math.floor((Date.now() - (quiz.endTime - quiz.currentQuestion.time_limit * 1000)) / 1000);
        
        if (Date.now() <= quiz.endTime) {
          try {
            // Check if already submitted
            const [existing] = await pool.query('SELECT id FROM answers WHERE participant_id = ? AND question_id = ?', [participantId, questionId]);
            if (existing.length > 0) return; // Prevent duplicate
            
            const isCorrect = answer === quiz.currentQuestion.correct_option;
            const marksObtained = isCorrect ? quiz.currentQuestion.marks : -quiz.currentQuestion.negative_marks;
            
            await pool.query(
              'INSERT INTO answers (participant_id, question_id, selected_option, is_correct, time_taken, marks_obtained) VALUES (?, ?, ?, ?, ?, ?)',
              [participantId, questionId, answer, isCorrect, timeTaken, marksObtained]
            );
            
            // Update total score
            await pool.query('UPDATE participants SET score = score + ? WHERE id = ?', [marksObtained, participantId]);
            
            // Notify Admin live view
            io.to(`admin_${quizCode}`).emit('answer_received', { participantId, questionId, answer });
            
          } catch (error) {
            console.error('Submit answer error', error);
          }
        }
      }
    });

  });
};

module.exports = { initSocket };
