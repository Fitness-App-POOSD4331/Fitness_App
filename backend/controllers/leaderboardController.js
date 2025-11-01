const User = require('../models/User');

// @desc    Get leaderboard by total distance
// @route   GET /api/leaderboard/distance
// @access  Public
exports.getDistanceLeaderboard = async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // Get users sorted by totalDistance, excluding those with 0 distance
    const users = await User.find({ totalDistance: { $gt: 0 } })
      .select('displayName userName totalDistance caloriesBurned')
      .sort({ totalDistance: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalUsers = await User.countDocuments({ totalDistance: { $gt: 0 } });

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      displayName: user.displayName,
      userName: user.userName,
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalUsers / limitNum),
          totalUsers,
          usersPerPage: limitNum
        }
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

// @desc    Get leaderboard by calories burned
// @route   GET /api/leaderboard/calories
// @access  Public
exports.getCaloriesLeaderboard = async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find({ caloriesBurned: { $gt: 0 } })
      .select('displayName userName totalDistance caloriesBurned')
      .sort({ caloriesBurned: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalUsers = await User.countDocuments({ caloriesBurned: { $gt: 0 } });

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      userId: user._id,
      displayName: user.displayName,
      userName: user.userName,
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalUsers / limitNum),
          totalUsers,
          usersPerPage: limitNum
        }
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

// @desc    Get user's rank and nearby users
// @route   GET /api/leaderboard/myrank
// @access  Private
exports.getMyRank = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'distance', range = 5 } = req.query;
    const rangeNum = parseInt(range);

    // Determine sorting field
    const sortField = type === 'calories' ? 'caloriesBurned' : 'totalDistance';
    
    // Get user's data
    const currentUser = await User.findById(userId)
      .select('displayName userName totalDistance caloriesBurned')
      .lean();

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userValue = currentUser[sortField];

    // Count users with higher values to get rank
    const rank = await User.countDocuments({
      [sortField]: { $gt: userValue }
    }) + 1;

    // Get users above current user
    const usersAbove = await User.find({
      [sortField]: { $gt: userValue }
    })
      .select('displayName userName totalDistance caloriesBurned')
      .sort({ [sortField]: 1 })
      .limit(rangeNum)
      .lean();

    // Get users below current user
    const usersBelow = await User.find({
      [sortField]: { $lt: userValue }
    })
      .select('displayName userName totalDistance caloriesBurned')
      .sort({ [sortField]: -1 })
      .limit(rangeNum)
      .lean();

    // Combine and sort all users
    const allUsers = [...usersAbove, currentUser, ...usersBelow];
    allUsers.sort((a, b) => b[sortField] - a[sortField]);

    // Add ranks
    const leaderboard = allUsers.map((user, index) => ({
      rank: rank - usersAbove.length + index,
      userId: user._id,
      displayName: user.displayName,
      userName: user.userName,
      totalDistance: user.totalDistance,
      caloriesBurned: user.caloriesBurned,
      isCurrentUser: user._id.toString() === userId
    }));

    // Get total count
    const totalUsers = await User.countDocuments({
      [sortField]: { $gt: 0 }
    });

    res.status(200).json({
      success: true,
      data: {
        myRank: rank,
        totalUsers,
        leaderboard
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

// @desc    Get top performers (top 10 by distance and calories)
// @route   GET /api/leaderboard/top
// @access  Public
exports.getTopPerformers = async (req, res) => {
  try {
    const topDistance = await User.find({ totalDistance: { $gt: 0 } })
      .select('displayName userName totalDistance')
      .sort({ totalDistance: -1 })
      .limit(10)
      .lean();

    const topCalories = await User.find({ caloriesBurned: { $gt: 0 } })
      .select('displayName userName caloriesBurned')
      .sort({ caloriesBurned: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        topDistance: topDistance.map((user, index) => ({
          rank: index + 1,
          userId: user._id,
          displayName: user.displayName,
          userName: user.userName,
          totalDistance: user.totalDistance
        })),
        topCalories: topCalories.map((user, index) => ({
          rank: index + 1,
          userId: user._id,
          displayName: user.displayName,
          userName: user.userName,
          caloriesBurned: user.caloriesBurned
        }))
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