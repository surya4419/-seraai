const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
  constructor() {
    // Initialize transporter lazily to ensure env vars are loaded
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
    return this.transporter;
  }

  async sendEmail(to, subject, html, text = null) {
    try {
      // Check if email configuration exists
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        logger.error('Email configuration missing', {
          hasEmailUser: !!process.env.EMAIL_USER,
          hasEmailPassword: !!process.env.EMAIL_PASSWORD,
          hasEmailFrom: !!process.env.EMAIL_FROM
        });
        throw new Error('Email service not configured. Please check EMAIL_USER and EMAIL_PASSWORD environment variables.');
      }

      const transporter = this.getTransporter();

      // Verify transporter before sending
      try {
        await transporter.verify();
        logger.info('SMTP connection verified successfully');
      } catch (verifyError) {
        logger.error('SMTP verification failed', {
          error: verifyError.message,
          code: verifyError.code,
          command: verifyError.command
        });
        throw new Error(`Email service connection failed: ${verifyError.message}`);
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      logger.info('Attempting to send email', {
        to,
        subject,
        from: mailOptions.from,
        host: 'smtp.gmail.com'
      });

      const result = await transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: result.messageId,
        response: result.response
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Failed to send email', {
        to,
        subject,
        error: error.message,
        stack: error.stack,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode
      });

      // Return error object instead of throwing to prevent application crash
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async sendVerificationEmail(email, token, userName = '') {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      const subject = 'Verify Your Email Address';
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our Platform!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName || 'there'}!</h2>
            <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

      const result = await this.sendEmail(email, subject, html);
      if (!result.success) {
        logger.warn('Verification email failed to send but user creation succeeded', {
          email,
          error: result.error
        });
      }
      return result;
    } catch (error) {
      logger.error('Error in sendVerificationEmail', { email, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(email, token, userName = '') {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const subject = 'Reset Your Password';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #dc3545; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName || 'there'}!</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
    const result = await this.sendEmail(email, subject, html);
    if (!result.success) {
      logger.warn('Password reset email failed to send', { email, error: result.error });
    }
    return result
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendWelcomeEmail(email, userName = '') {
    const subject = 'Welcome to Our Platform!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #28a745; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName || 'there'}!</h2>
            <p>Your email has been successfully verified and your account is now active!</p>
            
            <p>You can now access all features of our platform. Get started by exploring your dashboard:</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>
            
            <p>If you have any questions or need help getting started, don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for joining us!</p>
          </div>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();