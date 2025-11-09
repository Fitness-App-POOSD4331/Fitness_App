const express = require('express');
const router = express.Router();
const { 
  updateProfile, 
  getUserStats, 
  updateMetrics,
  getUserProfile  // ADD THIS
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);  // ADD THIS - GET route
router.put('/profile', protect, updateProfile);   // Existing PUT route
router.get('/stats', protect, getUserStats);
router.put('/metrics', protect, updateMetrics);

module.exports = router;