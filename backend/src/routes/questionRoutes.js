const express = require('express');
const router = express.Router({ mergeParams: true });
const { getQuestions, addQuestion } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

// Since questions are nested under events (/api/events/:eventId/questions), we need mergeParams: true in router
// But we mounted it at /api/questions and /api/events/:eventId/questions
// Let's modify app.js slightly or handle the route here.

// For direct /api/questions/:id operations
router.use(protect);

module.exports = router;
