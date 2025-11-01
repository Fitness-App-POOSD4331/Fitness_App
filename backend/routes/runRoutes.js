const express = require('express');
const router = express.Router();
const {
  createRun,
  getRuns,
  getRunById,
  updateRun,
  deleteRun,
  getRunStats
} = require('../controllers/runController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

router.route('/')
  .get(getRuns)
  .post(createRun);

router.get('/stats/summary', getRunStats);

router.route('/:id')
  .get(getRunById)
  .put(updateRun)
  .delete(deleteRun);

module.exports = router;