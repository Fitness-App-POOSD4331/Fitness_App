const crypto = require('crypto');

// Mock the Resend module before requiring emailService
jest.mock('resend');
jest.mock('crypto');

const { Resend } = require('resend');

describe('EmailService', () => {
  let emailService;
  let mockResendInstance;
  let mockEmailsSend;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Clear the module cache to get a fresh instance
    jest.resetModules();
    
    // Reset environment variables
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.EMAIL_FROM = 'noreply@fitnessapp.com';
    process.env.CLIENT_URL = 'https://fitnessapp.com';

    // Setup mocks
    mockEmailsSend = jest.fn();
    mockResendInstance = {
      emails: {
        send: mockEmailsSend
      }
    };
    Resend.mockImplementation(() => mockResendInstance);

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock crypto.randomBytes
    crypto.randomBytes.mockReturnValue({
      toString: jest.fn().mockReturnValue('mock-token-hex-string')
    });

    // Require the service after mocks are set up
    emailService = require('../services/emailService');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('should initialize with RESEND_API_KEY set', () => {
      expect(Resend).toHaveBeenCalledWith('test-api-key');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Resend email service is ready');
    });

    test('should log error when RESEND_API_KEY is not set', () => {
      jest.resetModules();
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;
      
      consoleErrorSpy.mockClear();
      consoleLogSpy.mockClear();
      
      require('../emailService');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ RESEND_API_KEY is not set in .env file');
      expect(consoleLogSpy).not.toHaveBeenCalledWith('✅ Resend email service is ready');
      
      // Restore for next tests
      process.env.RESEND_API_KEY = originalKey;
    });
  });

  describe('generateToken', () => {
    test('should generate a token using crypto.randomBytes', () => {
      const token = emailService.generateToken();
      
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(token).toBe('mock-token-hex-string');
    });
  });

  describe('sendEmail', () => {
    test('should send email successfully', async () => {
      const mockData = { id: 'email-123' };
      mockEmailsSend.mockResolvedValue({ data: mockData, error: null });

      const result = await emailService.sendEmail(
        'test@example.com',
        'Test Subject',
        '<p>Test HTML</p>'
      );

      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: 'noreply@fitnessapp.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>'
      });
      expect(result).toEqual({ success: true, id: 'email-123' });
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Email sent via Resend:', 'email-123');
    });

    test('should handle Resend API error', async () => {
      const mockError = { message: 'Invalid API key' };
      mockEmailsSend.mockResolvedValue({ data: null, error: mockError });

      const result = await emailService.sendEmail(
        'test@example.com',
        'Test Subject',
        '<p>Test HTML</p>'
      );

      expect(result).toEqual({ success: false, error: 'Invalid API key' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Resend error:', mockError);
    });

    test('should handle exception during email send', async () => {
      const mockError = new Error('Network error');
      mockEmailsSend.mockRejectedValue(mockError);

      const result = await emailService.sendEmail(
        'test@example.com',
        'Test Subject',
        '<p>Test HTML</p>'
      );

      expect(result).toEqual({ success: false, error: 'Network error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error sending email:', mockError);
    });
  });

  describe('sendVerificationEmail', () => {
    beforeEach(() => {
      mockEmailsSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    });

    test('should send verification email with correct URL and template', async () => {
      const user = {
        email: 'user@example.com',
        displayName: 'John Doe'
      };
      const token = 'verification-token-123';

      const result = await emailService.sendVerificationEmail(user, token);

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@fitnessapp.com',
          to: 'user@example.com',
          subject: 'Verify Your Email - Fitness App'
        })
      );

      const htmlContent = mockEmailsSend.mock.calls[0][0].html;
      expect(htmlContent).toContain('John Doe');
      expect(htmlContent).toContain(`https://fitnessapp.com/verify-email?token=${token}`);
      expect(htmlContent).toContain('Verify Your Email');
      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Verification email sent to: user@example.com');
    });

    test('should return error result when email fails', async () => {
      mockEmailsSend.mockResolvedValue({ data: null, error: { message: 'API error' } });
      
      const user = { email: 'user@example.com', displayName: 'Test User' };
      const result = await emailService.sendVerificationEmail(user, 'token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });
  });

  describe('sendPasswordResetEmail', () => {
    beforeEach(() => {
      mockEmailsSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    });

    test('should send password reset email with correct URL and template', async () => {
      const user = {
        email: 'user@example.com',
        displayName: 'Jane Smith'
      };
      const token = 'reset-token-456';

      const result = await emailService.sendPasswordResetEmail(user, token);

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@fitnessapp.com',
          to: 'user@example.com',
          subject: 'Reset Your Password - Fitness App'
        })
      );

      const htmlContent = mockEmailsSend.mock.calls[0][0].html;
      expect(htmlContent).toContain('Jane Smith');
      expect(htmlContent).toContain(`https://fitnessapp.com/reset-password?token=${token}`);
      expect(htmlContent).toContain('Reset Your Password');
      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Password reset email sent to: user@example.com');
    });

    test('should return error result when email fails', async () => {
      mockEmailsSend.mockResolvedValue({ data: null, error: { message: 'API error' } });
      
      const user = { email: 'user@example.com', displayName: 'Test User' };
      const result = await emailService.sendPasswordResetEmail(user, 'token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });
  });

  describe('sendPasswordChangedEmail', () => {
    beforeEach(() => {
      mockEmailsSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    });

    test('should send password changed confirmation email', async () => {
      const user = {
        email: 'user@example.com',
        displayName: 'Bob Johnson'
      };

      const result = await emailService.sendPasswordChangedEmail(user);

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@fitnessapp.com',
          to: 'user@example.com',
          subject: 'Password Changed Successfully - Fitness App'
        })
      );

      const htmlContent = mockEmailsSend.mock.calls[0][0].html;
      expect(htmlContent).toContain('Bob Johnson');
      expect(htmlContent).toContain('Password Changed');
      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Password changed confirmation sent to: user@example.com');
    });

    test('should return error result when email fails', async () => {
      mockEmailsSend.mockResolvedValue({ data: null, error: { message: 'API error' } });
      
      const user = { email: 'user@example.com', displayName: 'Test User' };
      const result = await emailService.sendPasswordChangedEmail(user);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });
  });

  describe('sendAccountRecoveryEmail', () => {
    beforeEach(() => {
      mockEmailsSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    });

    test('should send account recovery email with correct URL and template', async () => {
      const user = {
        email: 'user@example.com',
        displayName: 'Alice Williams'
      };
      const token = 'recovery-token-789';

      const result = await emailService.sendAccountRecoveryEmail(user, token);

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@fitnessapp.com',
          to: 'user@example.com',
          subject: 'Account Recovery - Fitness App'
        })
      );

      const htmlContent = mockEmailsSend.mock.calls[0][0].html;
      expect(htmlContent).toContain('Alice Williams');
      expect(htmlContent).toContain(`https://fitnessapp.com/account-recovery?token=${token}`);
      expect(htmlContent).toContain('Account Recovery');
      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Account recovery email sent to: user@example.com');
    });
  });

  describe('sendWelcomeEmail', () => {
    beforeEach(() => {
      mockEmailsSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    });

    test('should send welcome email', async () => {
      const user = {
        email: 'user@example.com',
        displayName: 'Charlie Brown'
      };

      const result = await emailService.sendWelcomeEmail(user);

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@fitnessapp.com',
          to: 'user@example.com',
          subject: 'Welcome to Fitness App! 🎉'
        })
      );

      const htmlContent = mockEmailsSend.mock.calls[0][0].html;
      expect(htmlContent).toContain('Charlie Brown');
      expect(htmlContent).toContain('Welcome to Fitness App');
      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Welcome email sent to: user@example.com');
    });

    test('should return error result when email fails', async () => {
      mockEmailsSend.mockResolvedValue({ data: null, error: { message: 'API error' } });
      
      const user = { email: 'user@example.com', displayName: 'Test User' };
      const result = await emailService.sendWelcomeEmail(user);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API error');
    });
  });

  describe('sendSecurityAlert', () => {
    beforeEach(() => {
      mockEmailsSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });
    });

    test('should send security alert email with alert details', async () => {
      const user = {
        email: 'user@example.com',
        displayName: 'David Lee'
      };
      const alertType = 'Suspicious Login';
      const details = 'Login attempt from unknown location';

      const result = await emailService.sendSecurityAlert(user, alertType, details);

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@fitnessapp.com',
          to: 'user@example.com',
          subject: 'Security Alert - Suspicious Login'
        })
      );

      const htmlContent = mockEmailsSend.mock.calls[0][0].html;
      expect(htmlContent).toContain('David Lee');
      expect(htmlContent).toContain('Suspicious Login');
      expect(htmlContent).toContain('Login attempt from unknown location');
      expect(htmlContent).toContain('Security Alert');
      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Security alert sent to: user@example.com');
    });
  });

  describe('email template methods', () => {
    test('getVerificationTemplate should include all required elements', () => {
      const html = emailService.getVerificationTemplate('Test User', 'https://example.com/verify?token=abc');
      
      expect(html).toContain('Test User');
      expect(html).toContain('https://example.com/verify?token=abc');
      expect(html).toContain('Verify Your Email');
      expect(html).toContain('24 hours');
    });

    test('getPasswordResetTemplate should include all required elements', () => {
      const html = emailService.getPasswordResetTemplate('Test User', 'https://example.com/reset?token=xyz');
      
      expect(html).toContain('Test User');
      expect(html).toContain('https://example.com/reset?token=xyz');
      expect(html).toContain('Reset Your Password');
      expect(html).toContain('1 hour');
    });

    test('getPasswordChangedTemplate should include all required elements', () => {
      const html = emailService.getPasswordChangedTemplate('Test User');
      
      expect(html).toContain('Test User');
      expect(html).toContain('Password Changed');
      expect(html).toContain('Success');
    });

    test('getAccountRecoveryTemplate should include all required elements', () => {
      const html = emailService.getAccountRecoveryTemplate('Test User', 'https://example.com/recover?token=def');
      
      expect(html).toContain('Test User');
      expect(html).toContain('https://example.com/recover?token=def');
      expect(html).toContain('Account Recovery');
    });

    test('getWelcomeTemplate should include all required elements', () => {
      const html = emailService.getWelcomeTemplate('Test User');
      
      expect(html).toContain('Test User');
      expect(html).toContain('Welcome to Fitness App');
    });

    test('getSecurityAlertTemplate should include all required elements', () => {
      const html = emailService.getSecurityAlertTemplate('Test User', 'Login Alert', 'Unusual activity detected');
      
      expect(html).toContain('Test User');
      expect(html).toContain('Login Alert');
      expect(html).toContain('Unusual activity detected');
      expect(html).toContain('Security Alert');
    });
  });
});