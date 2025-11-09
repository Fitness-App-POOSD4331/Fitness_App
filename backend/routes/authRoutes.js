const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/account-recovery', authController.requestAccountRecovery);
router.get('/verify-recovery', authController.verifyAccountRecovery);

// Protected routes (require authentication)
router.get('/profile', protect, authController.getProfile);
router.post('/change-password', protect, authController.changePassword);

module.exports = router;