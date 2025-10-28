const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
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
      bmi = weight / Math.pow(height / 100, 2);
      bmi = Math.round(bmi * 10) / 10;
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
      bmi,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      lastVerificationEmailSent: new Date()
    });

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
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
        isEmailVerified: user.isEmailVerified,
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

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email already verified'
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      data: {
        email: user.email,
        isEmailVerified: user.isEmailVerified
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

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Rate limiting: check if email was sent in last 5 minutes
    if (user.lastVerificationEmailSent) {
      const timeSinceLastEmail = Date.now() - user.lastVerificationEmailSent.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeSinceLastEmail < fiveMinutes) {
        const remainingTime = Math.ceil((fiveMinutes - timeSinceLastEmail) / 1000 / 60);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingTime} minute(s) before requesting another verification email`
        });
      }
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    user.lastVerificationEmailSent = new Date();
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
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

    // OPTIONAL: Uncomment to require email verification before login
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Please verify your email before logging in',
    //     requiresVerification: true
    //   });
    // }

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
        isEmailVerified: user.isEmailVerified,
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