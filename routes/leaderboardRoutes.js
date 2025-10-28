const express = require('express');
const router = express.Router();
const {
  getDistanceLeaderboard,
  getCaloriesLeaderboard,
  getMyRank,
  getTopPerformers
} = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/distance', getDistanceLeaderboard);
router.get('/calories', getCaloriesLeaderboard);
router.get('/top', getTopPerformers);

// Protected route (requires authentication)
router.get('/myrank', protect, getMyRank);

module.exports = router;