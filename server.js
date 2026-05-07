const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import routes
const studioRoutes = require('./routes/studios');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const amlRoutes = require('./routes/aml');
const gdprRoutes = require('./routes/gdpr');
const taskRoutes = require('./routes/tasks');

// Use routes
app.use('/api/studios', studioRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/aml', amlRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Compliance Dashboard Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Compliance Dashboard Backend running on http://localhost:${PORT}`);
});

module.exports = app;
