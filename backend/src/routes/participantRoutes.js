const express = require('express');
const router = express.Router();
const { joinQuiz, register } = require('../controllers/participantController');

router.post('/register', register);
router.post('/join', joinQuiz);
router.get('/my-events', require('../controllers/participantController').getMyEvents);

module.exports = router;
