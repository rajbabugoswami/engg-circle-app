const pool = require('../config/db');

const getEvents = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events WHERE admin_id = ? ORDER BY created_at DESC', [req.admin.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getEvent = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ? AND admin_id = ?', [req.params.id, req.admin.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Event not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { name, description, event_date, start_time, duration, default_time, max_participants, marks_per_q, negative_marks, cert_generation_enabled, auto_email_enabled } = req.body;
    const quiz_code = `QUIZ-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const [result] = await pool.query(
      `INSERT INTO events (admin_id, quiz_code, name, description, event_date, start_time, duration, default_time, max_participants, marks_per_q, negative_marks, cert_generation_enabled, auto_email_enabled, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [req.admin.id, quiz_code, name, description, event_date, start_time, duration, default_time, max_participants, marks_per_q, negative_marks, cert_generation_enabled !== false, auto_email_enabled !== false]
    );
    
    res.status(201).json({ id: result.insertId, quiz_code, message: 'Event created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEvent = async (req, res) => {
  // Implementation...
  res.json({ message: 'Updated' });
};

const deleteEvent = async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = ? AND admin_id = ?', [req.params.id, req.admin.id]);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getResults = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [events] = await pool.query('SELECT name FROM events WHERE id = ? AND admin_id = ?', [eventId, req.admin.id]);
    if (events.length === 0) return res.status(403).json({ message: 'Unauthorized' });

    const [results] = await pool.query(`
      SELECT p.id, p.name, p.email, p.score, c.certificate_id, c.pdf_url, c.email_status 
      FROM participants p 
      LEFT JOIN certificates c ON p.id = c.participant_id
      WHERE p.event_id = ? 
      ORDER BY p.score DESC, p.joined_at ASC
    `, [eventId]);
    
    res.json({ eventName: events[0].name, results });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadTemplate = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/questions/${req.file.filename}`; // Stored in same dir for now
    
    await pool.query('UPDATE events SET cert_template_url = ? WHERE id = ? AND admin_id = ?', [fileUrl, eventId, req.admin.id]);
    
    res.json({ message: 'Template uploaded successfully', fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getResults, uploadTemplate };
