const authController = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

jest.mock('../models/User');
jest.mock('jsonwebtoken');
jest.mock('../services/emailService');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      query: {},
      user: { id: 'user123' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    process.env.JWT_SECRET = 'test-secret';
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        displayName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        userName: 'johndoe',
        weight: 70,
        height: 175,
        age: 25,
        sex: 'male'
      };

      const mockUser = {
        _id: 'user123',
        ID: 'ID123',
        ...userData,
        isEmailVerified: false,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = userData;

      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockUser);
      emailService.generateToken.mockReturnValue('token123');
      emailService.sendVerificationEmail.mockResolvedValue(true);
      jwt.sign.mockReturnValue('jwt-token-123');

      await authController.register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'john@example.com' }, { userName: 'johndoe' }]
      });
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: expect.objectContaining({
          email: 'john@example.com',
          token: 'jwt-token-123'
        })
      });
    });

    it('should return 400 if email already exists', async () => {
      const existingUser = {
        email: 'john@example.com',
        userName: 'othername'
      };

      req.body = {
        email: 'john@example.com',
        userName: 'johndoe'
      };

      User.findOne.mockResolvedValue(existingUser);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email already registered'
      });
    });

    it('should return 400 if username already exists', async () => {
      const existingUser = {
        email: 'other@example.com',
        userName: 'johndoe'
      };

      req.body = {
        email: 'john@example.com',
        userName: 'johndoe'
      };

      User.findOne.mockResolvedValue(existingUser);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username already taken'
      });
    });

    it('should handle server errors', async () => {
      req.body = { email: 'test@test.com' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Registration failed',
        error: 'Database error'
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        emailVerificationToken: 'token123',
        emailVerificationExpires: new Date(Date.now() + 10000),
        isEmailVerified: false,
        save: jest.fn().mockResolvedValue(true)
      };

      req.query.token = 'token123';

      User.findOne.mockResolvedValue(mockUser);
      emailService.sendWelcomeEmail.mockResolvedValue(true);

      await authController.verifyEmail(req, res);

      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.emailVerificationToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Email verified successfully! Welcome aboard!',
        data: {
          email: 'john@example.com',
          isEmailVerified: true
        }
      });
    });

    it('should return 400 if token is missing', async () => {
      req.query.token = undefined;

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Verification token is required'
      });
    });

    it('should return 400 if token is invalid or expired', async () => {
      req.query.token = 'token123';

      User.findOne.mockResolvedValue(null);

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired verification token'
      });
    });

    it('should return 400 if email already verified', async () => {
      const mockUser = {
        isEmailVerified: true
      };

      req.query.token = 'token123';

      User.findOne.mockResolvedValue(mockUser);

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email already verified'
      });
    });

    it('should handle server errors', async () => {
      req.query.token = 'token123';
      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        isEmailVerified: false,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body.email = 'john@example.com';

      User.findOne.mockResolvedValue(mockUser);
      emailService.generateToken.mockReturnValue('newtoken123');
      emailService.sendVerificationEmail.mockResolvedValue(true);

      await authController.resendVerification(req, res);

      expect(mockUser.emailVerificationToken).toBe('newtoken123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Verification email resent successfully'
      });
    });

    it('should return 404 if user not found', async () => {
      req.body.email = 'nonexistent@example.com';

      User.findOne.mockResolvedValue(null);

      await authController.resendVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if email already verified', async () => {
      const mockUser = {
        isEmailVerified: true
      };

      req.body.email = 'john@example.com';

      User.findOne.mockResolvedValue(mockUser);

      await authController.resendVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        _id: 'user123',
        ID: 'ID123',
        email: 'john@example.com',
        displayName: 'John',
        userName: 'john',
        isEmailVerified: true,
        loginAttempts: 0,
        isLocked: jest.fn().mockReturnValue(false),
        comparePassword: jest.fn().mockResolvedValue(true),
        resetLoginAttempts: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        email: 'john@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('jwt-token-123');

      await authController.login(req, res);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: expect.objectContaining({
          email: 'john@example.com',
          token: 'jwt-token-123'
        })
      });
    });

    it('should return 401 if user not found', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should return 423 if account is locked', async () => {
      const mockUser = {
        isLocked: jest.fn().mockReturnValue(true)
      };

      req.body = {
        email: 'john@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(mockUser);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(423);
    });

    it('should return 401 and increment login attempts on wrong password', async () => {
      const mockUser = {
        isLocked: jest.fn().mockReturnValue(false),
        comparePassword: jest.fn().mockResolvedValue(false),
        incLoginAttempts: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      User.findOne.mockResolvedValue(mockUser);

      await authController.login(req, res);

      expect(mockUser.incLoginAttempts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 403 if email not verified', async () => {
      const mockUser = {
        isEmailVerified: false,
        isLocked: jest.fn().mockReturnValue(false),
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        email: 'john@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(mockUser);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please verify your email before logging in'
      });
    });

    it('should handle server errors', async () => {
      req.body = { email: 'test@test.com', password: 'test' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      req.body.email = 'john@example.com';

      User.findOne.mockResolvedValue(mockUser);
      emailService.generateToken.mockReturnValue('resettoken123');
      emailService.sendPasswordResetEmail.mockResolvedValue(true);

      await authController.forgotPassword(req, res);

      expect(mockUser.passwordResetToken).toBe('resettoken123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    });

    it('should not reveal if user does not exist', async () => {
      req.body.email = 'nonexistent@example.com';

      User.findOne.mockResolvedValue(null);

      await authController.forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    });

    it('should handle server errors', async () => {
      req.body.email = 'test@test.com';
      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockUser = {
        _id: 'user123',
        passwordResetToken: 'token123',
        passwordResetExpires: new Date(Date.now() + 10000),
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        token: 'token123',
        newPassword: 'newpassword123'
      };

      User.findOne.mockResolvedValue(mockUser);
      emailService.sendPasswordChangedEmail.mockResolvedValue(true);

      await authController.resetPassword(req, res);

      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.loginAttempts).toBe(0);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset successfully'
      });
    });

    it('should return 400 if token or password missing', async () => {
      req.body = { token: 'token123' };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if token is invalid', async () => {
      req.body = {
        token: 'invalidtoken',
        newPassword: 'newpassword123'
      };

      User.findOne.mockResolvedValue(null);

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle server errors', async () => {
      req.body = { token: 'token', newPassword: 'pass' };
      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        _id: 'user123',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };

      User.findById.mockResolvedValue(mockUser);
      emailService.sendPasswordChangedEmail.mockResolvedValue(true);

      await authController.changePassword(req, res);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('oldpassword');
      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password changed successfully'
      });
    });

    it('should return 404 if user not found', async () => {
      req.body = {
        currentPassword: 'old',
        newPassword: 'new'
      };

      User.findById.mockResolvedValue(null);

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 401 if current password is incorrect', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      req.body = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword'
      };

      User.findById.mockResolvedValue(mockUser);

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle server errors', async () => {
      req.body = { currentPassword: 'old', newPassword: 'new' };
      User.findById.mockRejectedValue(new Error('Database error'));

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('requestAccountRecovery', () => {
    it('should send account recovery email', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      req.body.email = 'john@example.com';

      User.findOne.mockResolvedValue(mockUser);
      emailService.generateToken.mockReturnValue('recoverytoken123');
      emailService.sendAccountRecoveryEmail.mockResolvedValue(true);

      await authController.requestAccountRecovery(req, res);

      expect(mockUser.accountRecoveryToken).toBe('recoverytoken123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'If an account with that email exists, a recovery link has been sent'
      });
    });

    it('should not reveal if user does not exist', async () => {
      req.body.email = 'nonexistent@example.com';

      User.findOne.mockResolvedValue(null);

      await authController.requestAccountRecovery(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'If an account with that email exists, a recovery link has been sent'
      });
    });
  });

  describe('verifyAccountRecovery', () => {
    it('should recover account successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        accountRecoveryToken: 'token123',
        accountRecoveryExpires: new Date(Date.now() + 10000),
        save: jest.fn().mockResolvedValue(true)
      };

      req.query.token = 'token123';

      User.findOne.mockResolvedValue(mockUser);

      await authController.verifyAccountRecovery(req, res);

      expect(mockUser.accountStatus).toBe('active');
      expect(mockUser.loginAttempts).toBe(0);
      expect(mockUser.accountRecoveryToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Account recovered successfully! You can now log in.',
        data: {
          email: 'john@example.com',
          accountStatus: 'active'
        }
      });
    });

    it('should return 400 if token missing', async () => {
      req.query.token = undefined;

      await authController.verifyAccountRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if token invalid', async () => {
      req.query.token = 'invalidtoken';

      User.findOne.mockResolvedValue(null);

      await authController.verifyAccountRecovery(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        displayName: 'John'
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };

      User.findById.mockReturnValue(mockQuery);

      await authController.getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should return 404 if user not found', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };

      User.findById.mockReturnValue(mockQuery);

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle server errors', async () => {
      User.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});