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
    const { name, description, event_date, start_time, duration, default_time, max_participants, marks_per_q, negative_marks, cert_generation_enabled, auto_email_enabled, organizer_name, institute_name, certificate_rank_limit } = req.body;
    const quiz_code = `QUIZ-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const [result] = await pool.query(
      `INSERT INTO events (admin_id, quiz_code, name, description, event_date, start_time, duration, default_time, max_participants, marks_per_q, negative_marks, cert_generation_enabled, auto_email_enabled, is_active, organizer_name, institute_name, certificate_rank_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)`,
      [req.admin.id, quiz_code, name, description, event_date, start_time, duration, default_time, max_participants, marks_per_q, negative_marks, cert_generation_enabled !== false, auto_email_enabled !== false, organizer_name, institute_name, certificate_rank_limit || 3]
    );
    
    res.status(201).json({ id: result.insertId, quiz_code, message: 'Event created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { cert_generation_enabled, auto_email_enabled, certificate_rank_limit } = req.body;
    
    await pool.query(
      'UPDATE events SET cert_generation_enabled = ?, auto_email_enabled = ?, certificate_rank_limit = ? WHERE id = ? AND admin_id = ?',
      [cert_generation_enabled, auto_email_enabled, certificate_rank_limit, id, req.admin.id]
    );
    
    res.json({ message: 'Event settings updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = ? AND admin_id = ?', [req.params.id, req.admin.id]);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const duplicateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [events] = await pool.query('SELECT * FROM events WHERE id = ? AND admin_id = ?', [id, req.admin.id]);
    if (events.length === 0) return res.status(404).json({ message: 'Event not found' });
    
    const ev = events[0];
    const newQuizCode = ev.quiz_code + '_COPY_' + Math.floor(Math.random() * 1000);
    
    const [result] = await pool.query(
      'INSERT INTO events (admin_id, name, description, event_date, start_time, quiz_code, cert_generation_enabled, auto_email_enabled, certificate_rank_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.admin.id, ev.name + ' (Copy)', ev.description, ev.event_date, ev.start_time, newQuizCode, ev.cert_generation_enabled, ev.auto_email_enabled, ev.certificate_rank_limit]
    );
    
    // Duplicate questions
    const [questions] = await pool.query('SELECT * FROM questions WHERE event_id = ?', [id]);
    for (const q of questions) {
      await pool.query(
        'INSERT INTO questions (event_id, text, option_a, option_b, option_c, option_d, correct_option, time_limit, marks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [result.insertId, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.time_limit, q.marks]
      );
    }
    
    res.json({ message: 'Event duplicated', newEventId: result.insertId });
  } catch (error) {
    console.error('Duplicate event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResults = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [events] = await pool.query('SELECT name FROM events WHERE id = ? AND admin_id = ?', [eventId, req.admin.id]);
    if (events.length === 0) return res.status(403).json({ message: 'Unauthorized' });

    const [results] = await pool.query(`
      SELECT p.id, p.name, p.email, p.score, p.rank_pos, c.certificate_id, c.pdf_url, c.email_status,
             COALESCE(SUM(a.time_taken), 0) as total_time
      FROM participants p 
      LEFT JOIN certificates c ON p.id = c.participant_id
      LEFT JOIN answers a ON p.id = a.participant_id
      WHERE p.event_id = ? 
      GROUP BY p.id, p.name, p.email, p.score, p.rank_pos, p.joined_at, c.certificate_id, c.pdf_url, c.email_status
      ORDER BY p.score DESC, total_time ASC, p.joined_at ASC
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

const saveTemplateConfig = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { config } = req.body; // should be a JS object
    
    await pool.query('UPDATE events SET cert_template_config = ? WHERE id = ? AND admin_id = ?', [JSON.stringify(config), eventId, req.admin.id]);
    
    res.json({ message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Save template config error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await pool.query('SELECT id, name, email, joined_at FROM participants WHERE event_id = ? ORDER BY joined_at DESC', [eventId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, duplicateEvent, getResults, uploadTemplate, saveTemplateConfig, getParticipants };
