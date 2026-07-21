const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads directory securely
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'IBM OnboardAI API Server'
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
