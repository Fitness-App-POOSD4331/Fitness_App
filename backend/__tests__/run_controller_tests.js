const runController = require('../controllers/runController');
const Run = require('../models/Run');
const User = require('../models/User');

jest.mock('../models/Run');
jest.mock('../models/User');

describe('Run Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { _id: 'user123' },
      body: {},
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('createRun', () => {
    it('should create a run successfully', async () => {
      const runData = {
        distance: 5.5,
        time: 30,
        averagePace: 5.45,
        caloriesBurned: 300,
        startTime: new Date(),
        finishTime: new Date()
      };

      const mockRun = {
        _id: 'run123',
        ...runData,
        userID: 'user123'
      };

      const mockUser = {
        _id: 'user123',
        totalDistance: 10,
        caloriesBurned: 500,
        runs: [],
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = runData;

      Run.create.mockResolvedValue(mockRun);
      User.findById.mockResolvedValue(mockUser);

      await runController.createRun(req, res);

      expect(Run.create).toHaveBeenCalledWith({
        ...runData,
        userID: 'user123'
      });
      expect(mockUser.totalDistance).toBe(15.5);
      expect(mockUser.caloriesBurned).toBe(800);
      expect(mockUser.runs).toContain('run123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Run created successfully',
        data: mockRun
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        distance: 5.5,
        time: 30
      };

      await runController.createRun(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all required fields'
      });
    });

    it('should return 401 if user not authenticated', async () => {
      req.user = null;
      req.body = {
        distance: 5.5,
        time: 30,
        averagePace: 5.45,
        caloriesBurned: 300,
        startTime: new Date(),
        finishTime: new Date()
      };

      await runController.createRun(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should return 404 if user not found', async () => {
      req.body = {
        distance: 5.5,
        time: 30,
        averagePace: 5.45,
        caloriesBurned: 300,
        startTime: new Date(),
        finishTime: new Date()
      };

      Run.create.mockResolvedValue({ _id: 'run123' });
      User.findById.mockResolvedValue(null);

      await runController.createRun(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle undefined initial values for user metrics', async () => {
      const runData = {
        distance: 5.5,
        time: 30,
        averagePace: 5.45,
        caloriesBurned: 300,
        startTime: new Date(),
        finishTime: new Date()
      };

      const mockRun = { _id: 'run123', ...runData };
      const mockUser = {
        _id: 'user123',
        totalDistance: undefined,
        caloriesBurned: undefined,
        runs: undefined,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = runData;

      Run.create.mockResolvedValue(mockRun);
      User.findById.mockResolvedValue(mockUser);

      await runController.createRun(req, res);

      expect(mockUser.totalDistance).toBe(5.5);
      expect(mockUser.caloriesBurned).toBe(300);
      expect(mockUser.runs).toEqual(['run123']);
    });

    it('should handle server errors', async () => {
      req.body = {
        distance: 5.5,
        time: 30,
        averagePace: 5.45,
        caloriesBurned: 300,
        startTime: new Date(),
        finishTime: new Date()
      };

      Run.create.mockRejectedValue(new Error('Database error'));

      await runController.createRun(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('getRuns', () => {
    it('should return all runs for user', async () => {
      const mockRuns = [
        { _id: 'run1', distance: 5, userID: 'user123' },
        { _id: 'run2', distance: 10, userID: 'user123' }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockRuns)
      };

      Run.find.mockReturnValue(mockQuery);

      await runController.getRuns(req, res);

      expect(Run.find).toHaveBeenCalledWith({ userID: 'user123' });
      expect(mockQuery.sort).toHaveBeenCalledWith({ startTime: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockRuns
      });
    });

    it('should return empty array when no runs found', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };

      Run.find.mockReturnValue(mockQuery);

      await runController.getRuns(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should handle server errors', async () => {
      Run.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await runController.getRuns(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getRunById', () => {
    it('should return run by id', async () => {
      const mockRun = {
        _id: 'run123',
        distance: 5,
        userID: 'user123'
      };

      req.params.id = 'run123';

      Run.findById.mockResolvedValue(mockRun);

      await runController.getRunById(req, res);

      expect(Run.findById).toHaveBeenCalledWith('run123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRun
      });
    });

    it('should return 404 if run not found', async () => {
      req.params.id = 'run123';

      Run.findById.mockResolvedValue(null);

      await runController.getRunById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Run not found'
      });
    });

    it('should return 403 if run belongs to different user', async () => {
      const mockRun = {
        _id: 'run123',
        userID: { toString: () => 'user456' }
      };

      req.params.id = 'run123';

      Run.findById.mockResolvedValue(mockRun);

      await runController.getRunById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this run'
      });
    });

    it('should handle server errors', async () => {
      req.params.id = 'run123';

      Run.findById.mockRejectedValue(new Error('Database error'));

      await runController.getRunById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateRun', () => {
    it('should update run successfully', async () => {
      const mockRun = {
        _id: 'run123',
        distance: 5,
        caloriesBurned: 300,
        userID: { toString: () => 'user123' }
      };

      const updatedRun = {
        _id: 'run123',
        distance: 10,
        caloriesBurned: 500,
        userID: 'user123'
      };

      const mockUser = {
        _id: 'user123',
        totalDistance: 50,
        caloriesBurned: 1000,
        save: jest.fn().mockResolvedValue(true)
      };

      req.params.id = 'run123';
      req.body = { distance: 10, caloriesBurned: 500 };

      Run.findById.mockResolvedValue(mockRun);
      Run.findByIdAndUpdate.mockResolvedValue(updatedRun);
      User.findById.mockResolvedValue(mockUser);

      await runController.updateRun(req, res);

      expect(mockUser.totalDistance).toBe(55);
      expect(mockUser.caloriesBurned).toBe(1200);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Run updated successfully',
        data: updatedRun
      });
    });

    it('should return 404 if run not found', async () => {
      req.params.id = 'run123';

      Run.findById.mockResolvedValue(null);

      await runController.updateRun(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if run belongs to different user', async () => {
      const mockRun = {
        _id: 'run123',
        userID: { toString: () => 'user456' }
      };

      req.params.id = 'run123';

      Run.findById.mockResolvedValue(mockRun);

      await runController.updateRun(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should handle server errors', async () => {
      req.params.id = 'run123';

      Run.findById.mockRejectedValue(new Error('Database error'));

      await runController.updateRun(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteRun', () => {
    it('should delete run successfully', async () => {
      const mockRun = {
        _id: { toString: () => 'run123' },
        distance: 5,
        caloriesBurned: 300,
        userID: { toString: () => 'user123' },
        deleteOne: jest.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: 'user123',
        totalDistance: 50,
        caloriesBurned: 1000,
        runs: ['run123', 'run456'],
        save: jest.fn().mockResolvedValue(true)
      };

      req.params.id = 'run123';

      Run.findById.mockResolvedValue(mockRun);
      User.findById.mockResolvedValue(mockUser);

      await runController.deleteRun(req, res);

      expect(mockUser.totalDistance).toBe(45);
      expect(mockUser.caloriesBurned).toBe(700);
      expect(mockUser.runs).toEqual(['run456']);
      expect(mockRun.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Run deleted successfully',
        data: {}
      });
    });

    it('should return 404 if run not found', async () => {
      req.params.id = 'run123';

      Run.findById.mockResolvedValue(null);

      await runController.deleteRun(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if run belongs to different user', async () => {
      const mockRun = {
        _id: 'run123',
        userID: { toString: () => 'user456' }
      };

      req.params.id = 'run123';

      Run.findById.mockResolvedValue(mockRun);

      await runController.deleteRun(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if user not found', async () => {
      const mockRun = {
        _id: 'run123',
        userID: { toString: () => 'user123' }
      };

      req.params.id = 'run123';

      Run.findById.mockResolvedValue(mockRun);
      User.findById.mockResolvedValue(null);

      await runController.deleteRun(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should not allow negative values when deleting', async () => {
      const mockRun = {
        _id: { toString: () => 'run123' },
        distance: 100,
        caloriesBurned: 500,
        userID: { toString: () => 'user123' },
        deleteOne: jest.fn().mockResolvedValue(true)
      };

      const mockUser = {
        _id: 'user123',
        totalDistance: 50,
        caloriesBurned: 300,
        runs: ['run123'],
        save: jest.fn().mockResolvedValue(true)
      };

      req.params.id = 'run123';

      Run.findById.mockResolvedValue(mockRun);
      User.findById.mockResolvedValue(mockUser);

      await runController.deleteRun(req, res);

      expect(mockUser.totalDistance).toBe(0);
      expect(mockUser.caloriesBurned).toBe(0);
    });

    it('should handle server errors', async () => {
      req.params.id = 'run123';

      Run.findById.mockRejectedValue(new Error('Database error'));

      await runController.deleteRun(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getRunStats', () => {
    it('should return run statistics', async () => {
      const mockRuns = [
        { distance: 5, time: 30, caloriesBurned: 300, averagePace: 6 },
        { distance: 10, time: 60, caloriesBurned: 600, averagePace: 6 },
        { distance: 3, time: 18, caloriesBurned: 180, averagePace: 6 }
      ];

      Run.find.mockResolvedValue(mockRuns);

      await runController.getRunStats(req, res);

      expect(Run.find).toHaveBeenCalledWith({ userID: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalRuns: 3,
          totalDistance: 18,
          totalTime: 108,
          totalCalories: 1080,
          averagePace: 6,
          averageDistance: 6
        }
      });
    });

    it('should return zero stats when no runs found', async () => {
      Run.find.mockResolvedValue([]);

      await runController.getRunStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
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
    });

    it('should handle server errors', async () => {
      Run.find.mockRejectedValue(new Error('Database error'));

      await runController.getRunStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});