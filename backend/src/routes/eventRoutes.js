const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getResults, uploadTemplate } = require('../controllers/eventController');
const { getQuestions, addQuestion, generateQuestionsWithAI, deleteQuestion, updateQuestion } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/questions');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `cert-template-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.use(protect);

router.route('/')
  .get(getEvents)
  .post(createEvent);

router.route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

router.post('/:id/duplicate', require('../controllers/eventController').duplicateEvent);

router.post('/:eventId/questions/ai-generate', generateQuestionsWithAI);

router.route('/:eventId/questions')
  .get(getQuestions)
  .post(upload.single('image'), addQuestion);

router.route('/:eventId/questions/:questionId')
  .delete(deleteQuestion)
  .put(upload.single('image'), updateQuestion);

router.post('/:eventId/template', upload.single('template'), uploadTemplate);
router.post('/:eventId/template/ai-generate', require('../controllers/eventController').generateTemplateWithAI);
router.put('/:eventId/template-config', require('../controllers/eventController').saveTemplateConfig);

router.route('/:eventId/results')
  .get(getResults);

router.get('/:eventId/participants', require('../controllers/eventController').getParticipants);

module.exports = router;
