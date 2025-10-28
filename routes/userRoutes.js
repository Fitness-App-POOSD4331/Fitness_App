const express = require('express');
const router = express.Router();
const { 
  updateProfile, 
  getUserStats, 
  updateMetrics 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/stats', protect, getUserStats);
router.put('/metrics', protect, updateMetrics);

module.exports = router;