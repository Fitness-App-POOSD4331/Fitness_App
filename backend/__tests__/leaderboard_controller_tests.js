const leaderboardController = require('../controllers/leaderboardController');
const User = require('../models/User');

jest.mock('../models/User');

describe('Leaderboard Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: {},
      user: { id: 'user123', _id: 'user123' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getDistanceLeaderboard', () => {
    it('should return distance leaderboard with pagination', async () => {
      const mockUsers = [
        { _id: 'user1', displayName: 'John', userName: 'john', totalDistance: 100, caloriesBurned: 500 },
        { _id: 'user2', displayName: 'Jane', userName: 'jane', totalDistance: 90, caloriesBurned: 450 }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers)
      };

      User.find.mockReturnValue(mockQuery);
      User.countDocuments.mockResolvedValue(2);

      req.query = { limit: '10', page: '1' };

      await leaderboardController.getDistanceLeaderboard(req, res);

      expect(User.find).toHaveBeenCalledWith({ totalDistance: { $gt: 0 } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          leaderboard: [
            { rank: 1, userId: 'user1', displayName: 'John', userName: 'john', totalDistance: 100, caloriesBurned: 500 },
            { rank: 2, userId: 'user2', displayName: 'Jane', userName: 'jane', totalDistance: 90, caloriesBurned: 450 }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalUsers: 2,
            usersPerPage: 10
          }
        }
      });
    });

    it('should handle pagination correctly for page 2', async () => {
      const mockUsers = [
        { _id: 'user3', displayName: 'Bob', userName: 'bob', totalDistance: 80, caloriesBurned: 400 }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers)
      };

      User.find.mockReturnValue(mockQuery);
      User.countDocuments.mockResolvedValue(11);

      req.query = { limit: '10', page: '2' };

      await leaderboardController.getDistanceLeaderboard(req, res);

      expect(mockQuery.skip).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          leaderboard: [
            { rank: 11, userId: 'user3', displayName: 'Bob', userName: 'bob', totalDistance: 80, caloriesBurned: 400 }
          ]
        })
      });
    });

    it('should use default values when limit and page not provided', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      User.find.mockReturnValue(mockQuery);
      User.countDocuments.mockResolvedValue(0);

      await leaderboardController.getDistanceLeaderboard(req, res);

      expect(mockQuery.limit).toHaveBeenCalledWith(100);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });

    it('should handle server errors', async () => {
      User.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await leaderboardController.getDistanceLeaderboard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('getCaloriesLeaderboard', () => {
    it('should return calories leaderboard with pagination', async () => {
      const mockUsers = [
        { _id: 'user1', displayName: 'John', userName: 'john', totalDistance: 100, caloriesBurned: 500 },
        { _id: 'user2', displayName: 'Jane', userName: 'jane', totalDistance: 90, caloriesBurned: 450 }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers)
      };

      User.find.mockReturnValue(mockQuery);
      User.countDocuments.mockResolvedValue(2);

      req.query = { limit: '10', page: '1' };

      await leaderboardController.getCaloriesLeaderboard(req, res);

      expect(User.find).toHaveBeenCalledWith({ caloriesBurned: { $gt: 0 } });
      expect(mockQuery.sort).toHaveBeenCalledWith({ caloriesBurned: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle server errors', async () => {
      User.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await leaderboardController.getCaloriesLeaderboard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getMyRank', () => {
    it('should return user rank and nearby users for distance', async () => {
      const currentUser = {
        _id: 'user123',
        displayName: 'Current User',
        userName: 'current',
        totalDistance: 50,
        caloriesBurned: 250
      };

      const usersAbove = [
        { _id: 'user1', displayName: 'Top User', userName: 'top', totalDistance: 100, caloriesBurned: 500 }
      ];

      const usersBelow = [
        { _id: 'user2', displayName: 'Below User', userName: 'below', totalDistance: 30, caloriesBurned: 150 }
      ];

      const mockQueryCurrent = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(currentUser)
      };

      const mockQueryAbove = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(usersAbove)
      };

      const mockQueryBelow = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(usersBelow)
      };

      User.findById.mockReturnValue(mockQueryCurrent);
      User.countDocuments
        .mockResolvedValueOnce(1) // rank calculation
        .mockResolvedValueOnce(10); // total users
      
      User.find
        .mockReturnValueOnce(mockQueryAbove)
        .mockReturnValueOnce(mockQueryBelow);

      req.query = { type: 'distance', range: '5' };

      await leaderboardController.getMyRank(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          myRank: 2,
          totalUsers: 10,
          leaderboard: expect.arrayContaining([
            expect.objectContaining({ isCurrentUser: true, userId: 'user123' })
          ])
        }
      });
    });

    it('should return user rank for calories', async () => {
      const currentUser = {
        _id: 'user123',
        displayName: 'Current User',
        userName: 'current',
        totalDistance: 50,
        caloriesBurned: 250
      };

      const mockQueryCurrent = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(currentUser)
      };

      const mockQueryAbove = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      const mockQueryBelow = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      User.findById.mockReturnValue(mockQueryCurrent);
      User.countDocuments.mockResolvedValue(5);
      User.find
        .mockReturnValueOnce(mockQueryAbove)
        .mockReturnValueOnce(mockQueryBelow);

      req.query = { type: 'calories', range: '3' };

      await leaderboardController.getMyRank(req, res);

      expect(User.find).toHaveBeenCalledWith({ caloriesBurned: { $gt: 250 } });
    });

    it('should return 404 if user not found', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null)
      };

      User.findById.mockReturnValue(mockQuery);

      await leaderboardController.getMyRank(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      User.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      await leaderboardController.getMyRank(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getTopPerformers', () => {
    it('should return top 10 performers for both distance and calories', async () => {
      const topDistanceUsers = [
        { _id: 'user1', displayName: 'Top Distance', userName: 'topdist', totalDistance: 100 }
      ];

      const topCaloriesUsers = [
        { _id: 'user2', displayName: 'Top Calories', userName: 'topcal', caloriesBurned: 500 }
      ];

      const mockQueryDistance = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(topDistanceUsers)
      };

      const mockQueryCalories = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(topCaloriesUsers)
      };

      User.find
        .mockReturnValueOnce(mockQueryDistance)
        .mockReturnValueOnce(mockQueryCalories);

      await leaderboardController.getTopPerformers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          topDistance: [
            { rank: 1, userId: 'user1', displayName: 'Top Distance', userName: 'topdist', totalDistance: 100 }
          ],
          topCalories: [
            { rank: 1, userId: 'user2', displayName: 'Top Calories', userName: 'topcal', caloriesBurned: 500 }
          ]
        }
      });
    });

    it('should handle empty results', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      User.find.mockReturnValue(mockQuery);

      await leaderboardController.getTopPerformers(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          topDistance: [],
          topCalories: []
        }
      });
    });

    it('should handle server errors', async () => {
      User.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await leaderboardController.getTopPerformers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});