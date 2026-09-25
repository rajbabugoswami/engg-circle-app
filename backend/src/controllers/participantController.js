const pool = require('../config/db');

const register = async (req, res) => {
  try {
    const { quizCode, name, email, college, phone, course, year, roll_number } = req.body;
    
    // Check if event exists
    const [events] = await pool.query('SELECT * FROM events WHERE quiz_code = ?', [quizCode]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Invalid quiz code' });
    }
    
    const event = events[0];
    
    // Check if participant already registered
    const [existing] = await pool.query('SELECT id FROM participants WHERE event_id = ? AND email = ?', [event.id, email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already registered for this event with this email.' });
    } else {
      await pool.query(
        'INSERT INTO participants (event_id, name, email, college, phone, course, year, roll_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [event.id, name, email, college, phone, course, year, roll_number]
      );
      
      // Send Registration Email in the background
      const { sendRegistrationEmail } = require('../utils/emailService');
      sendRegistrationEmail(email, name, event).catch(console.error);
    }
    
    res.json({
      message: 'Registration successful. Check your email for details.',
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const joinQuiz = async (req, res) => {
  try {
    const { quizCode, email } = req.body;
    
    // Check if event exists and is active
    const [events] = await pool.query('SELECT * FROM events WHERE quiz_code = ? AND is_active = TRUE', [quizCode]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Invalid or inactive quiz code' });
    }
    
    const event = events[0];
    if (event.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Quiz has already ended' });
    }
    
    // Find participant
    const [existing] = await pool.query('SELECT id, name FROM participants WHERE event_id = ? AND email = ?', [event.id, email]);
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'You are not registered for this quiz. Please register first.' });
    }
    
    res.json({
      message: 'Joined successfully',
      participantId: existing[0].id,
      eventId: event.id,
      quizCode,
      name: existing[0].name
    });
  } catch (error) {
    console.error('Join Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, joinQuiz };
