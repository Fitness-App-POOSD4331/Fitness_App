const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Standard authentication middleware (unchanged)
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }
  }

  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token' 
    });
  }
};

// NEW: Middleware that requires email verification
exports.requireEmailVerification = async (req, res, next) => {
  try {
    // User should already be authenticated via protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!req.user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before accessing this resource',
        requiresVerification: true,
        email: req.user.email
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// USAGE EXAMPLE:
// For routes that require email verification, use both middlewares:
// router.post('/sensitive-action', protect, requireEmailVerification, controller);