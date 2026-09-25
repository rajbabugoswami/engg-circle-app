const express = require('express');
const router = express.Router();
const { joinQuiz, register } = require('../controllers/participantController');

router.post('/register', register);
router.post('/join', joinQuiz);

module.exports = router;
