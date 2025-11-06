const userController = require('../controllers/userController');
const User = require('../models/User');
const Run = require('../models/Run');

// Mock the models
jest.mock('../models/User');
jest.mock('../models/Run');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default request and response objects
    req = {
      user: { _id: 'user123' },
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock console methods to keep test output clean
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = {
        _id: 'user123',
        ID: 'ID123',
        displayName: 'Old Name',
        userName: 'oldusername',
        email: 'test@example.com',
        weight: 70,
        height: 175,
        age: 25,
        sex: 'male',
        bmi: 22.9,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        displayName: 'New Name',
        userName: 'newusername',
        weight: 75,
        height: 180,
        age: 26,
        sex: 'male'
      };

      User.findById.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null); // Username not taken

      await userController.updateProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(User.findOne).toHaveBeenCalledWith({ userName: 'newusername' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: expect.objectContaining({
          displayName: 'New Name',
          userName: 'newusername',
          weight: 75,
          height: 180
        })
      });
    });

    it('should calculate BMI when weight and height are provided', async () => {
      const mockUser = {
        _id: 'user123',
        weight: 0,
        height: 0,
        bmi: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        weight: 80,
        height: 180
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.updateProfile(req, res);

      // BMI = 80 / (1.8)^2 = 24.7
      expect(mockUser.bmi).toBe(24.7);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await userController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should return 400 if username is already taken', async () => {
      const mockUser = {
        _id: 'user123',
        userName: 'oldusername'
      };

      const existingUser = {
        _id: 'user456',
        userName: 'newusername'
      };

      req.body = {
        userName: 'newusername'
      };

      User.findById.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(existingUser);

      await userController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username already taken'
      });
    });

    it('should allow keeping the same username', async () => {
      const mockUser = {
        _id: 'user123',
        userName: 'existingusername',
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        userName: 'existingusername',
        displayName: 'New Display Name'
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.updateProfile(req, res);

      expect(User.findOne).not.toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle server errors', async () => {
      User.findById.mockRejectedValue(new Error('Database error'));

      await userController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('getUserStats', () => {
    it('should return user stats successfully', async () => {
      const mockUser = {
        _id: 'user123',
        totalDistance: 100,
        caloriesBurned: 500,
        weight: 70,
        height: 175,
        bmi: 22.9,
        runs: []
      };

      const mockRuns = [
        { _id: 'run1', distance: 5 },
        { _id: 'run2', distance: 10 }
      ];

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      Run.find.mockResolvedValue(mockRuns);

      await userController.getUserStats(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Run.find).toHaveBeenCalledWith({ userID: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalDistance: 100,
          caloriesBurned: 500,
          totalRuns: 2,
          weight: 70,
          height: 175,
          bmi: 22.9,
          runs: mockRuns
        }
      });
    });

    it('should return default values for undefined metrics', async () => {
      const mockUser = {
        _id: 'user123',
        totalDistance: undefined,
        caloriesBurned: undefined,
        weight: undefined,
        height: undefined,
        bmi: undefined
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      Run.find.mockResolvedValue([]);

      await userController.getUserStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalDistance: 0,
          caloriesBurned: 0,
          totalRuns: 0,
          weight: 0,
          height: 0,
          bmi: 0,
          runs: []
        }
      });
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await userController.getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await userController.getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        _id: 'user123',
        ID: 'ID123',
        displayName: 'John Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        weight: 70,
        height: 175,
        age: 25,
        sex: 'male',
        bmi: 22.9,
        totalDistance: 100,
        caloriesBurned: 500,
        isEmailVerified: true
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await userController.getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          _id: 'user123',
          ID: 'ID123',
          displayName: 'John Doe',
          userName: 'johndoe',
          email: 'john@example.com',
          weight: 70,
          height: 175,
          age: 25,
          sex: 'male',
          bmi: 22.9,
          totalDistance: 100,
          caloriesBurned: 500,
          isEmailVerified: true
        }
      });
    });

    it('should exclude password from response', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com'
      };

      const selectMock = jest.fn().mockResolvedValue(mockUser);
      User.findById.mockReturnValue({ select: selectMock });

      await userController.getUserProfile(req, res);

      expect(selectMock).toHaveBeenCalledWith('-password');
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await userController.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await userController.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('updateMetrics', () => {
    it('should update distance and calories successfully', async () => {
      const mockUser = {
        _id: 'user123',
        totalDistance: 50,
        caloriesBurned: 200,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        distance: 10,
        calories: 100
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.updateMetrics(req, res);

      expect(mockUser.totalDistance).toBe(60);
      expect(mockUser.caloriesBurned).toBe(300);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Metrics updated successfully',
        data: {
          totalDistance: 60,
          caloriesBurned: 300
        }
      });
    });

    it('should handle undefined initial values', async () => {
      const mockUser = {
        _id: 'user123',
        totalDistance: undefined,
        caloriesBurned: undefined,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        distance: 10,
        calories: 100
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.updateMetrics(req, res);

      expect(mockUser.totalDistance).toBe(10);
      expect(mockUser.caloriesBurned).toBe(100);
    });

    it('should update only distance when calories not provided', async () => {
      const mockUser = {
        _id: 'user123',
        totalDistance: 50,
        caloriesBurned: 200,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        distance: 10
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.updateMetrics(req, res);

      expect(mockUser.totalDistance).toBe(60);
      expect(mockUser.caloriesBurned).toBe(200);
    });

    it('should update only calories when distance not provided', async () => {
      const mockUser = {
        _id: 'user123',
        totalDistance: 50,
        caloriesBurned: 200,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        calories: 100
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.updateMetrics(req, res);

      expect(mockUser.totalDistance).toBe(50);
      expect(mockUser.caloriesBurned).toBe(300);
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      req.body = {
        distance: 10,
        calories: 100
      };

      await userController.updateMetrics(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      User.findById.mockRejectedValue(new Error('Database error'));

      req.body = {
        distance: 10,
        calories: 100
      };

      await userController.updateMetrics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error',
        error: 'Database error'
      });
    });

    it('should handle zero values correctly', async () => {
      const mockUser = {
        _id: 'user123',
        totalDistance: 50,
        caloriesBurned: 200,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        distance: 0,
        calories: 0
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.updateMetrics(req, res);

      expect(mockUser.totalDistance).toBe(50);
      expect(mockUser.caloriesBurned).toBe(200);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});