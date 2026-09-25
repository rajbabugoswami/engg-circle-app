const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/presentations');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/events/:eventId/presentation', protect, upload.single('presentation'), async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = `/uploads/presentations/${req.file.filename}`;
    
    // Save to DB
    await pool.query('INSERT INTO presentations (event_id, file_url) VALUES (?, ?)', [eventId, fileUrl]);
    
    res.json({ message: 'Presentation uploaded', fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/events/:eventId/presentation', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await pool.query('SELECT file_url FROM presentations WHERE event_id = ? ORDER BY created_at DESC LIMIT 1', [eventId]);
    if (rows.length === 0) return res.status(404).json({ message: 'No presentation found' });
    res.json({ fileUrl: rows[0].file_url });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
