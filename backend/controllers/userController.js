const User = require('../models/User');
const Run = require('../models/Run');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, userName, weight, height, age, sex } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if username is being changed and if it's already taken
    if (userName && userName !== user.userName) {
      const userNameExists = await User.findOne({ userName });
      if (userNameExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already taken' 
        });
      }
    }

    // Update fields
    if (displayName) user.displayName = displayName;
    if (userName) user.userName = userName;
    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;
    if (age !== undefined) user.age = age;
    if (sex) user.sex = sex;

    // Recalculate BMI if weight or height changed
    if (user.weight && user.height) {
      user.bmi = user.weight / Math.pow(user.height / 100, 2);
      user.bmi = Math.round(user.bmi * 10) / 10;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        ID: user.ID,
        displayName: user.displayName,
        userName: user.userName,
        email: user.email,
        weight: user.weight,
        height: user.height,
        age: user.age,
        sex: user.sex,
        bmi: user.bmi
      }
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  console.log('=== getUserStats called ===');
  console.log('User ID:', req.user._id);
  
  try {
    const user = await User.findById(req.user._id)
      .select('totalDistance caloriesBurned runs weight height bmi');

    if (!user) {
      console.log('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User data:', {
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned,
      runsCount: user.runs?.length || 0,
      weight: user.weight,
      height: user.height,
      bmi: user.bmi
    });

    // Get actual run count from Run collection
    const runs = await Run.find({ userID: req.user._id });
    console.log('Runs found:', runs.length);

    res.status(200).json({
      success: true,
      data: {
        totalDistance: user.totalDistance || 0,
        caloriesBurned: user.caloriesBurned || 0,
        totalRuns: runs.length,
        weight: user.weight || 0,
        height: user.height || 0,
        bmi: user.bmi || 0,
        runs: runs
      }
    });
  } catch (error) {
    console.error('=== getUserStats ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  console.log('=== getUserProfile called ===');
  console.log('User ID:', req.user._id);
  
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      console.log('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User profile found:', user.email);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        ID: user.ID,
        displayName: user.displayName,
        userName: user.userName,
        email: user.email,
        weight: user.weight,
        height: user.height,
        age: user.age,
        sex: user.sex,
        bmi: user.bmi,
        totalDistance: user.totalDistance,
        caloriesBurned: user.caloriesBurned,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('=== getUserProfile ERROR ===');
    console.error('Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// @desc    Update fitness metrics (distance, calories)
// @route   PUT /api/users/metrics
// @access  Private
exports.updateMetrics = async (req, res) => {
  console.log('=== updateMetrics called ===');
  console.log('User ID:', req.user._id);
  console.log('Request body:', req.body);
  
  try {
    const { distance, calories } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('User before update:', {
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned
    });

    if (distance !== undefined) {
      user.totalDistance = (user.totalDistance || 0) + distance;
    }

    if (calories !== undefined) {
      user.caloriesBurned = (user.caloriesBurned || 0) + calories;
    }

    await user.save();

    console.log('User after update:', {
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned
    });

    res.status(200).json({
      success: true,
      message: 'Metrics updated successfully',
      data: {
        totalDistance: user.totalDistance,
        caloriesBurned: user.caloriesBurned
      }
    });
  } catch (error) {
    console.error('=== updateMetrics ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};