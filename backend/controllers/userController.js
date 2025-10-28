const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, userName, weight, height, age, sex } = req.body;

    const user = await User.findById(req.user.id);

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
  try {
    const user = await User.findById(req.user.id)
      .select('totalDistance caloriesBurned runs weight height bmi')
      .populate('runs');

    res.status(200).json({
      success: true,
      data: {
        totalDistance: user.totalDistance,
        caloriesBurned: user.caloriesBurned,
        totalRuns: user.runs.length,
        weight: user.weight,
        height: user.height,
        bmi: user.bmi,
        runs: user.runs
      }
    });
  } catch (error) {
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
  try {
    const { distance, calories } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (distance !== undefined) {
      user.totalDistance += distance;
    }

    if (calories !== undefined) {
      user.caloriesBurned += calories;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Metrics updated successfully',
      data: {
        totalDistance: user.totalDistance,
        caloriesBurned: user.caloriesBurned
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};