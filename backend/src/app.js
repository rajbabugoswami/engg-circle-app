const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const questionRoutes = require('./routes/questionRoutes');
const participantRoutes = require('./routes/participantRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const presentationRoutes = require('./routes/presentationRoutes');
const path = require('path');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api', presentationRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Backend is running as a standalone API
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

module.exports = app;
