const dotenv = require('dotenv');
dotenv.config();

// Now, require all other modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/runs', require('./routes/runRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

// Test Route
app.get('/', (req, res) => {
  res.send('Exercise App API is running');
});

// Test Email Route (for debugging)
app.get('/test-email', async (req, res) => {
  try {
    const emailService = require('./services/emailService');
    const testEmail = req.query.email || 'test@example.com';
    
    console.log('Testing email service...');
    console.log('Sending to:', testEmail);
    
    const result = await emailService.sendEmail(
      testEmail,
      'Test Email from Sky Run',
      '<h1>🎉 Test Email Successful!</h1><p>Your email service is working correctly.</p>'
    );
    
    res.json({ 
      success: result.success, 
      message: result.success ? 'Email sent successfully!' : 'Email failed to send',
      details: result 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('Request:', req.method, req.path);
  console.error('Body:', req.body);
  
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('=== UNHANDLED PROMISE REJECTION ===');
  console.error(err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error(err);
  process.exit(1);
});

// For production
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});