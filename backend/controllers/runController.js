const Run = require('../models/Run');
const User = require('../models/User');

// @desc    Create a new run
// @route   POST /api/runs
// @access  Private
// @desc    Create a new run
// @route   POST /api/runs
// @access  Private
exports.createRun = async (req, res) => {
  console.log('=== createRun called ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('req.user exists:', !!req.user);
  console.log('req.user._id:', req.user?._id);
  
  try {
    const { 
      distance, 
      time, 
      averagePace, 
      caloriesBurned, 
      startTime, 
      finishTime 
    } = req.body;

    console.log('Parsed fields:', {
      distance,
      time,
      averagePace,
      caloriesBurned,
      startTime,
      finishTime
    });

    // Validation
    if (!distance || !time || !averagePace || !caloriesBurned || !startTime || !finishTime) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    if (!req.user || !req.user._id) {
      console.log('No user found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('Creating run with userID:', req.user._id);

    // Create run
    const run = await Run.create({
      distance,
      time,
      averagePace,
      caloriesBurned,
      startTime,
      finishTime,
      userID: req.user._id
    });

    console.log('Run created:', run._id);

    // Update user's total distance and calories
    console.log('Updating user totals...');
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.error('User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User before update:', {
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned,
      runsCount: user.runs?.length || 0
    });

    user.totalDistance = (user.totalDistance || 0) + distance;
    user.caloriesBurned = (user.caloriesBurned || 0) + caloriesBurned;
    user.runs = user.runs || [];
    user.runs.push(run._id);
    await user.save();

    console.log('User after update:', {
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned,
      runsCount: user.runs.length
    });

    console.log('=== createRun success ===');

    res.status(201).json({
      success: true,
      message: 'Run created successfully',
      data: run
    });
  } catch (error) {
    console.error('=== createRun ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
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
    console.log('=== GET /api/runs called ===');
    console.log('req.user:', req.user);
    console.log('req.user._id:', req.user?._id);
    console.log('req.user type:', typeof req.user);
    
    const runs = await Run.find({ userID: req.user._id }).sort({ startTime: -1 });
    
    console.log('Runs found:', runs.length);
    console.log('First run:', runs[0]);

    res.status(200).json({
      success: true,
      count: runs.length,
      data: runs
    });
  } catch (error) {
    console.error('=== GET /api/runs ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
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

    // Check if run belongs to user - CHANGED
    if (run.userID.toString() !== req.user._id.toString()) {  // FIXED
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

    // Check if run belongs to user - CHANGED
    if (run.userID.toString() !== req.user._id.toString()) {  // FIXED
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
      const user = await User.findById(req.user._id);  // FIXED
      
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
// @desc    Delete run
// @route   DELETE /api/runs/:id
// @access  Private
exports.deleteRun = async (req, res) => {
  console.log('=== deleteRun called ===');
  console.log('Run ID:', req.params.id);
  console.log('User ID:', req.user?._id);
  
  try {
    const run = await Run.findById(req.params.id);

    console.log('Run found:', !!run);
    
    if (!run) {
      console.log('Run not found in database');
      return res.status(404).json({ 
        success: false, 
        message: 'Run not found' 
      });
    }

    console.log('Run userID:', run.userID);
    console.log('Request user ID:', req.user._id);
    console.log('Match:', run.userID.toString() === req.user._id.toString());

    // Check if run belongs to user
    if (run.userID.toString() !== req.user._id.toString()) {
      console.log('Authorization failed - run belongs to different user');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this run' 
      });
    }

    console.log('Finding user...');
    // Update user totals
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.error('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User before update:', {
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned,
      runsCount: user.runs?.length || 0
    });

    // Safely subtract values
    user.totalDistance = Math.max(0, (user.totalDistance || 0) - (run.distance || 0));
    user.caloriesBurned = Math.max(0, (user.caloriesBurned || 0) - (run.caloriesBurned || 0));
    user.runs = (user.runs || []).filter(runId => runId.toString() !== run._id.toString());
    
    console.log('Saving user...');
    await user.save();

    console.log('User after update:', {
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned,
      runsCount: user.runs.length
    });

    // Delete run
    console.log('Deleting run...');
    await run.deleteOne();

    console.log('=== deleteRun success ===');

    return res.status(200).json({
      success: true,
      message: 'Run deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('=== deleteRun ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};
// @desc    Get run statistics
// @route   GET /api/runs/stats/summary
// @access  Private
// @desc    Get run statistics
// @route   GET /api/runs/stats/summary
// @access  Private
exports.getRunStats = async (req, res) => {
  console.log('=== getRunStats called ===');
  console.log('User ID:', req.user?._id);
  
  try {
    const runs = await Run.find({ userID: req.user._id });

    console.log('Total runs found:', runs.length);

    if (runs.length === 0) {
      console.log('No runs found, returning zero stats');
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

    console.log('Calculated stats:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('=== getRunStats ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};