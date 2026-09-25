const pool = require('../config/db');

const getQuestions = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await pool.query('SELECT * FROM questions WHERE event_id = ? ORDER BY order_num ASC, created_at ASC', [eventId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, marks, negative_marks, time_limit } = req.body;
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/questions/${req.file.filename}`;
    }
    
    // Check if event belongs to admin
    const [events] = await pool.query('SELECT id FROM events WHERE id = ? AND admin_id = ?', [eventId, req.admin.id]);
    if (events.length === 0) return res.status(403).json({ message: 'Unauthorized' });

    const [result] = await pool.query(
      `INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, negative_marks, time_limit, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventId, question_text, option_a, option_b, option_c, option_d, correct_option, marks || 10, negative_marks || 0, time_limit || 30, image_url]
    );

    res.status(201).json({ id: result.insertId, message: 'Question added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getQuestions, addQuestion };
