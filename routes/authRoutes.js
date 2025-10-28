const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  verifyEmail, 
  resendVerification 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// Protected routes
router.get('/profile', protect, getProfile);

module.exports = router;