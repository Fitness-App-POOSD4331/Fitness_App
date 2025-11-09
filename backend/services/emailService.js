const { Resend } = require('resend');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.initialize();
  }

  initialize() {
    // Verify API key is set
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not set in .env file');
      return;
    }

    console.log('✅ Resend email service is ready');
  }

  // Generate secure token
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Helper method to send email
  async sendEmail(to, subject, html) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email sent via Resend:', data.id);
      return { success: true, id: data.id };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // 1. EMAIL VERIFICATION
  async sendVerificationEmail(user, token) {
// Line 50 - CORRECT (points to frontend)
const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;    
    const subject = 'Verify Your Email - Fitness App';
    const html = this.getVerificationTemplate(user.displayName, verificationUrl);

    const result = await this.sendEmail(user.email, subject, html);
    
    if (result.success) {
      console.log(`✅ Verification email sent to: ${user.email}`);
    }
    
    return result;
  }

  // 2. PASSWORD RESET
  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    
    const subject = 'Reset Your Password - Fitness App';
    const html = this.getPasswordResetTemplate(user.displayName, resetUrl);

    const result = await this.sendEmail(user.email, subject, html);
    
    if (result.success) {
      console.log(`✅ Password reset email sent to: ${user.email}`);
    }
    
    return result;
  }

  // 3. PASSWORD CHANGED CONFIRMATION
  async sendPasswordChangedEmail(user) {
    const subject = 'Password Changed Successfully - Fitness App';
    const html = this.getPasswordChangedTemplate(user.displayName);

    const result = await this.sendEmail(user.email, subject, html);
    
    if (result.success) {
      console.log(`✅ Password changed confirmation sent to: ${user.email}`);
    }
    
    return result;
  }

  // 4. ACCOUNT RECOVERY
  async sendAccountRecoveryEmail(user, token) {
    const recoveryUrl = `${process.env.CLIENT_URL}/account-recovery?token=${token}`;
    
    const subject = 'Account Recovery - Fitness App';
    const html = this.getAccountRecoveryTemplate(user.displayName, recoveryUrl);

    const result = await this.sendEmail(user.email, subject, html);
    
    if (result.success) {
      console.log(`✅ Account recovery email sent to: ${user.email}`);
    }
    
    return result;
  }

  // 5. WELCOME EMAIL
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Fitness App! 🎉';
    const html = this.getWelcomeTemplate(user.displayName);

    const result = await this.sendEmail(user.email, subject, html);
    
    if (result.success) {
      console.log(`✅ Welcome email sent to: ${user.email}`);
    }
    
    return result;
  }

  // 6. SECURITY ALERT
  async sendSecurityAlert(user, alertType, details) {
    const subject = `Security Alert - ${alertType}`;
    const html = this.getSecurityAlertTemplate(user.displayName, alertType, details);

    const result = await this.sendEmail(user.email, subject, html);
    
    if (result.success) {
      console.log(`✅ Security alert sent to: ${user.email}`);
    }
    
    return result;
  }

  // EMAIL TEMPLATES (Keep all your existing templates!)
  
  getVerificationTemplate(userName, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for registering with Fitness App. Please verify your email address to complete your registration.</p>
            <p>Click the button below to verify your email:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Fitness App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #FF9800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your Fitness App account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p><strong>If you didn't request this,</strong> please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Fitness App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordChangedTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <div class="success">
              <strong>Success!</strong> Your password was changed successfully.
            </div>
            <p>This email confirms that your Fitness App account password was recently changed.</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Fitness App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAccountRecoveryTemplate(userName, recoveryUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Recovery</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Recovery</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to recover your Fitness App account.</p>
            <p>Click the button below to recover your account:</p>
            <p style="text-align: center;">
              <a href="${recoveryUrl}" class="button">Recover Account</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${recoveryUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Fitness App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Fitness App</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Fitness App!</h1>
            <p>Your fitness journey starts here</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for verifying your email! Your account is now active and ready to use.</p>
            <p>Start tracking your fitness journey today!</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Fitness App. All rights reserved.</p>
            <p>Happy running! 🏃‍♂️💪</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getSecurityAlertTemplate(userName, alertType, details) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .alert { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Security Alert</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <div class="alert">
              <strong>Alert Type:</strong> ${alertType}<br>
              <strong>Details:</strong> ${details}<br>
              <strong>Date:</strong> ${new Date().toLocaleString()}
            </div>
            <p>We detected unusual activity on your Fitness App account.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Fitness App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();