const Run = require('../models/Run');
const User = require('../models/User');

// @desc    Create a new run
// @route   POST /api/runs
// @access  Private
exports.createRun = async (req, res) => {
  try {
    const { 
      distance, 
      time, 
      averagePace, 
      caloriesBurned, 
      startTime, 
      finishTime 
    } = req.body;

    // Validation
    if (!distance || !time || !averagePace || !caloriesBurned || !startTime || !finishTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Create run
    const run = await Run.create({
      distance,
      time,
      averagePace,
      caloriesBurned,
      startTime,
      finishTime,
      user: req.user.id
    });

    // Update user's total distance and calories
    const user = await User.findById(req.user.id);
    user.totalDistance += distance;
    user.caloriesBurned += caloriesBurned;
    user.runs.push(run._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Run created successfully',
      data: run
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get all runs for logged-in user
// @route   GET /api/runs
// @access  Private
exports.getRuns = async (req, res) => {
  try {
    const runs = await Run.find({ user: req.user.id }).sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      count: runs.length,
      data: runs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get single run by ID
// @route   GET /api/runs/:id
// @access  Private
exports.getRunById = async (req, res) => {
  try {
    const run = await Run.findById(req.params.id);

    if (!run) {
      return res.status(404).json({ 
        success: false, 
        message: 'Run not found' 
      });
    }

    // Check if run belongs to user
    if (run.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this run' 
      });
    }

    res.status(200).json({
      success: true,
      data: run
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update run
// @route   PUT /api/runs/:id
// @access  Private
exports.updateRun = async (req, res) => {
  try {
    let run = await Run.findById(req.params.id);

    if (!run) {
      return res.status(404).json({ 
        success: false, 
        message: 'Run not found' 
      });
    }

    // Check if run belongs to user
    if (run.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this run' 
      });
    }

    // Store old values for updating user totals
    const oldDistance = run.distance;
    const oldCalories = run.caloriesBurned;

    // Update run
    run = await Run.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update user totals if distance or calories changed
    if (req.body.distance || req.body.caloriesBurned) {
      const user = await User.findById(req.user.id);
      
      if (req.body.distance) {
        user.totalDistance = user.totalDistance - oldDistance + run.distance;
      }
      
      if (req.body.caloriesBurned) {
        user.caloriesBurned = user.caloriesBurned - oldCalories + run.caloriesBurned;
      }
      
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Run updated successfully',
      data: run
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Delete run
// @route   DELETE /api/runs/:id
// @access  Private
exports.deleteRun = async (req, res) => {
  try {
    const run = await Run.findById(req.params.id);

    if (!run) {
      return res.status(404).json({ 
        success: false, 
        message: 'Run not found' 
      });
    }

    // Check if run belongs to user
    if (run.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this run' 
      });
    }

    // Update user totals
    const user = await User.findById(req.user.id);
    user.totalDistance -= run.distance;
    user.caloriesBurned -= run.caloriesBurned;
    user.runs = user.runs.filter(runId => runId.toString() !== run._id.toString());
    await user.save();

    // Delete run
    await run.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Run deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get run statistics
// @route   GET /api/runs/stats/summary
// @access  Private
exports.getRunStats = async (req, res) => {
  try {
    const runs = await Run.find({ user: req.user.id });

    if (runs.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalRuns: 0,
          totalDistance: 0,
          totalTime: 0,
          totalCalories: 0,
          averagePace: 0,
          averageDistance: 0
        }
      });
    }

    const stats = {
      totalRuns: runs.length,
      totalDistance: runs.reduce((sum, run) => sum + run.distance, 0),
      totalTime: runs.reduce((sum, run) => sum + run.time, 0),
      totalCalories: runs.reduce((sum, run) => sum + run.caloriesBurned, 0),
      averagePace: runs.reduce((sum, run) => sum + run.averagePace, 0) / runs.length,
      averageDistance: runs.reduce((sum, run) => sum + run.distance, 0) / runs.length
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};