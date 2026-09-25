const express = require('express');
const router = express.Router();
const { joinQuiz } = require('../controllers/participantController');

router.post('/join', joinQuiz);

module.exports = router;
