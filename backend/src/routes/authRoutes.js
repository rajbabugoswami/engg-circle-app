const express = require('express');
const router = express.Router();
const { login, updateCredentials } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.put('/update', protect, updateCredentials);

module.exports = router;
