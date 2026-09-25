const express = require('express');
const router = express.Router();
const { generateCertificate, verifyCertificate, sendCertificateEmail, resendCertificate, resendAllFailed, downloadZip } = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for template uploads if needed later
const upload = multer({ dest: 'uploads/' });

const triggerBulk = async (req, res) => {
  const { eventId } = req.params;
  require('../controllers/certificateController').triggerBulkCertificateGeneration(eventId);
  res.json({ message: 'Bulk generation started' });
};

router.get('/verify/:certificateId', verifyCertificate);
router.get('/download/:certificateId', require('../controllers/certificateController').downloadCertificate);
router.post('/generate', protect, generateCertificate);
router.post('/send', protect, sendCertificateEmail);
router.post('/resend/:participantId', protect, resendCertificate);
router.post('/resend-all-failed/:eventId', protect, resendAllFailed);
router.post('/generate-all/:eventId', protect, triggerBulk);
router.get('/zip/:eventId', protect, downloadZip);

module.exports = router;
