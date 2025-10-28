const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { 
      displayName, 
      email, 
      password, 
      userName, 
      weight, 
      height, 
      age, 
      sex 
    } = req.body;

    // Validation
    if (!displayName || !email || !password || !userName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide displayName, email, password, and userName' 
      });
    }

    // Check if user exists (email or username)
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const userNameExists = await User.findOne({ userName });
    if (userNameExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Calculate BMI if height and weight provided
    let bmi = 0;
    if (weight && height) {
      // BMI = weight(kg) / (height(cm) / 100)^2
      bmi = weight / Math.pow(height / 100, 2);
      bmi = Math.round(bmi * 10) / 10; // Round to 1 decimal
    }

    // Create user
    const user = await User.create({
      displayName,
      email,
      password: hashedPassword,
      userName,
      weight: weight || 0,
      height: height || 0,
      age: age || 0,
      sex: sex || 'male',
      bmi
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
        token: generateToken(user._id)
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
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
        token: generateToken(user._id)
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

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('runs');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};