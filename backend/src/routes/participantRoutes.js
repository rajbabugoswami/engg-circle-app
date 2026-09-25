const express = require('express');
const router = express.Router();
const { joinQuiz, register } = require('../controllers/participantController');

router.post('/register', register);
router.post('/join', joinQuiz);
router.get('/my-events', require('../controllers/participantController').getMyEvents);
router.get('/:id/certificate', require('../controllers/participantController').getParticipantCertificate);

module.exports = router;
