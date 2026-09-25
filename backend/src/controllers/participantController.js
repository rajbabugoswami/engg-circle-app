const pool = require('../config/db');

const joinQuiz = async (req, res) => {
  try {
    const { quizCode, name, email, college, phone } = req.body;
    
    // Check if event exists and is active
    const [events] = await pool.query('SELECT id, status FROM events WHERE quiz_code = ? AND is_active = TRUE', [quizCode]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Invalid or inactive quiz code' });
    }
    
    const event = events[0];
    if (event.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Quiz has already ended' });
    }
    
    // Check if participant already joined
    const [existing] = await pool.query('SELECT id FROM participants WHERE event_id = ? AND email = ?', [event.id, email]);
    
    let participantId;
    if (existing.length > 0) {
      participantId = existing[0].id;
    } else {
      const [result] = await pool.query(
        'INSERT INTO participants (event_id, name, email, college, phone) VALUES (?, ?, ?, ?, ?)',
        [event.id, name, email, college, phone]
      );
      participantId = result.insertId;
    }
    
    res.json({
      message: 'Joined successfully',
      participantId,
      eventId: event.id,
      quizCode
    });
  } catch (error) {
    console.error('Join Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { joinQuiz };
