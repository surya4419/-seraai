const express = require('express');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Session = require('../models/Session');
const jwtManager = require('../utils/jwt');
const passwordManager = require('../utils/password');
const emailService = require('../utils/emailService');
const googleAuth = require('../utils/googleAuth');
const logger = require('../utils/logger');
const { validateBody, validationSchemas } = require('../middleware/validation');

const router = express.Router();

// Email verification route
router.get('/verify-email', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Verification token is required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Find user by verification token (including already verified users)
    let user = await User.findOne({
      emailVerificationToken: token
    });

    if (!user) {
      logger.warn('Invalid verification token', { correlationId, token });
      return res.status(400).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid verification token. Please request a new verification email.',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      logger.info('User already verified', {
        correlationId,
        userId: user._id.toString(),
        email: user.email
      });
      return res.json({
        success: true,
        message: 'Email already verified. You can now log in.',
        alreadyVerified: true,
        correlationId,
        timestamp: new Date().toISOString()
      });
    }

    // Check if token is expired
    if (user.emailVerificationExpires < new Date()) {
      logger.warn('Expired verification token', { correlationId, token });
      return res.status(400).json({
        error: {
          code: 'EXPIRED_TOKEN',
          message: 'Verification token has expired. Please request a new verification email.',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Verify email
    await user.verifyEmail();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email);
    } catch (emailError) {
      logger.error('Failed to send welcome email', {
        correlationId,
        userId: user._id.toString(),
        error: emailError.message
      });
    }

    logger.info('Email verification successful', {
      correlationId,
      userId: user._id.toString(),
      email: user.email
    });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Email verification error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Resend verification email route
router.post('/resend-verification', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email is required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists and is unverified, a verification email has been sent.',
        correlationId,
        timestamp: new Date().toISOString()
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_VERIFIED',
          message: 'Email is already verified',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken);
      logger.info('Verification email resent', {
        correlationId,
        userId: user._id.toString(),
        email
      });
    } catch (emailError) {
      logger.error('Failed to resend verification email', {
        correlationId,
        error: emailError.message
      });
      return res.status(500).json({
        error: {
          code: 'EMAIL_SEND_FAILED',
          message: 'Failed to send verification email',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully.',
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Resend verification error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email is required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
        correlationId,
        timestamp: new Date().toISOString()
      });
    }

    if (!user.passwordHash) {
      // OAuth-only user
      return res.status(400).json({
        error: {
          code: 'OAUTH_ONLY_USER',
          message: 'This account uses Google sign-in. Please sign in with Google.',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
      logger.info('Password reset email sent', {
        correlationId,
        userId: user._id.toString(),
        email
      });
    } catch (emailError) {
      logger.error('Failed to send password reset email', {
        correlationId,
        error: emailError.message
      });
      return res.status(500).json({
        error: {
          code: 'EMAIL_SEND_FAILED',
          message: 'Failed to send password reset email',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent successfully.',
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Forgot password error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Token and password are required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      logger.warn('Invalid or expired password reset token', { correlationId, token });
      return res.status(400).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired password reset token',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Update password
    user.passwordHash = password; // Will be hashed by pre-save middleware
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Invalidate all existing sessions for security
    await Session.invalidateAllUserSessions(user._id);

    logger.info('Password reset successful', {
      correlationId,
      userId: user._id.toString(),
      email: user.email
    });

    res.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Reset password error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Google OAuth routes
router.get('/google', (req, res) => {
  const { state } = req.query;
  const authUrl = googleAuth.getAuthUrl(state);
  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const { code, error, state } = req.query;

    if (error) {
      logger.warn('Google OAuth error', { correlationId, error });
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
    }

    if (!code) {
      logger.warn('Missing Google OAuth code', { correlationId });
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=missing_code`);
    }

    // Parse state parameter to get user type
    let userType = 'creator'; // Default
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        userType = stateData.userType || 'creator';
      } catch (e) {
        logger.warn('Invalid state parameter', { correlationId, state });
      }
    }

    // Exchange code for user info
    const googleUser = await googleAuth.exchangeCodeForTokens(code);

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.googleId }
      ]
    });

    let isNewUser = false;
    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.profilePicture = googleUser.picture;
        user.isEmailVerified = true; // Google emails are pre-verified
        await user.save();
      }
    } else {
      isNewUser = true;
      // Create new user with selected role
      user = new User({
        email: googleUser.email,
        googleId: googleUser.googleId,
        profilePicture: googleUser.picture,
        role: userType, // Use the selected user type
        isEmailVerified: true // Google emails are pre-verified
      });
      await user.save();
    }

    // Create session
    const { accessToken, refreshToken, sessionId } = await createSession(
      user._id.toString(),
      user.role,
      req
    );

    logger.info('Google OAuth login successful', {
      correlationId,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: sessionId.toString()
    });

    // Set cookies and redirect to frontend
    res.cookie('accessToken', accessToken, getCookieOptions(90 * 24 * 60 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, getCookieOptions(90 * 24 * 60 * 60 * 1000));

    // Redirect to appropriate dashboard or onboarding based on user role and profile status
    let dashboardUrl = user.role === 'creator' ? '/creator' : '/brand';

    // For new users, redirect to onboarding
    if (isNewUser) {
      dashboardUrl = user.role === 'creator' ? '/creator/onboarding' : '/brand/onboarding';
    }

    res.redirect(`${process.env.FRONTEND_URL}${dashboardUrl}?login=success`);
  } catch (error) {
    logger.error('Google OAuth callback error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// Google OAuth token verification (for frontend-initiated OAuth)
router.post('/google/verify', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const { token, userType } = req.body;

    if (!token) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Google token is required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Verify Google token
    const googleUser = await googleAuth.verifyToken(token);

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.googleId }
      ]
    });

    const selectedRole = userType || 'creator';
    let isNewUser = false;

    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
        user.profilePicture = googleUser.picture;
        user.isEmailVerified = true; // Google emails are pre-verified
        await user.save();
      }
    } else {
      isNewUser = true;
      // Create new user with selected role
      user = new User({
        email: googleUser.email,
        googleId: googleUser.googleId,
        profilePicture: googleUser.picture,
        role: selectedRole,
        isEmailVerified: true // Google emails are pre-verified
      });
      await user.save();
    }

    // Create session
    const { accessToken, refreshToken, sessionId } = await createSession(
      user._id.toString(),
      user.role,
      req
    );

    logger.info('Google token verification successful', {
      correlationId,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: sessionId.toString()
    });

    // Set HTTP-only cookies for tokens
    res.cookie('accessToken', accessToken, getCookieOptions(90 * 24 * 60 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, getCookieOptions(90 * 24 * 60 * 60 * 1000));

    res.json({
      success: true,
      sessionId: sessionId.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Google token verification error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Helper function to get cookie options
// Helper function to get cookie options
const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = process.env.FRONTEND_URL.startsWith('https://');

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax', // Allow cross-site cookies if secure (HTTPS)
    maxAge,
    path: '/'
  };
};

// Helper function to extract device info from request
const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  return {
    userAgent,
    ip: req.ip || req.connection.remoteAddress,
    browser: userAgent.split('/')[0] || 'Unknown',
    os: userAgent.includes('Windows') ? 'Windows' :
      userAgent.includes('Mac') ? 'MacOS' :
        userAgent.includes('Linux') ? 'Linux' : 'Unknown',
    device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
  };
};

// Helper function to generate token pair and create session
const createSession = async (userId, userRole, req) => {
  const payload = {
    sub: userId,
    role: userRole,
    iat: Math.floor(Date.now() / 1000)
  };

  const accessToken = jwtManager.generateAccessToken(payload);
  const refreshToken = jwtManager.generateRefreshToken(payload);

  // Create session in database
  const session = new Session({
    userId,
    accessToken,
    refreshToken,
    deviceInfo: getDeviceInfo(req),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  });

  await session.save();

  return { accessToken, refreshToken, sessionId: session._id };
};

// Signup route
router.post('/signup', validateBody(validationSchemas.auth.signup), async (req, res) => {
  const correlationId = req.correlationId || uuidv4();

  try {
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        logger.warn('Signup attempt with existing verified email', {
          correlationId,
          email
        });
        return res.status(400).json({
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered and verified',
            correlationId,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // Resend verification email for unverified user
        const verificationToken = existingUser.generateEmailVerificationToken();
        await existingUser.save();

        try {
          await emailService.sendVerificationEmail(email, verificationToken);
          logger.info('Verification email resent', {
            correlationId,
            userId: existingUser._id.toString(),
            email
          });
        } catch (emailError) {
          logger.error('Failed to resend verification email', {
            correlationId,
            error: emailError.message
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Verification email sent. Please check your email to verify your account.',
          requiresVerification: true,
          correlationId,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Create new user (unverified)
    const user = new User({
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      role,
      isEmailVerified: false
    });

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken);
      logger.info('User signup successful, verification email sent', {
        correlationId,
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });
    } catch (emailError) {
      logger.error('Failed to send verification email', {
        correlationId,
        userId: user._id.toString(),
        error: emailError.message
      });
      // Don't fail the signup if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      requiresVerification: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Signup error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Login route
router.post('/login', validateBody(validationSchemas.auth.login), async (req, res) => {
  const correlationId = req.correlationId || uuidv4();

  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login attempt with non-existent email', {
        correlationId,
        email
      });
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.passwordHash) {
      logger.warn('Login attempt for OAuth-only user', {
        correlationId,
        userId: user._id.toString(),
        email
      });
      return res.status(401).json({
        error: {
          code: 'OAUTH_ONLY_USER',
          message: 'Please sign in with Google',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', {
        correlationId,
        userId: user._id.toString(),
        email
      });
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      logger.warn('Login attempt with unverified email', {
        correlationId,
        userId: user._id.toString(),
        email
      });
      return res.status(401).json({
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email address before logging in',
          correlationId,
          timestamp: new Date().toISOString(),
          requiresVerification: true
        }
      });
    }

    // Cleanup expired sessions
    await Session.cleanupExpired();

    // Create new session
    const { accessToken, refreshToken, sessionId } = await createSession(
      user._id.toString(),
      user.role,
      req
    );

    logger.info('User login successful', {
      correlationId,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: sessionId.toString()
    });

    // Set HTTP-only cookies for tokens
    res.cookie('accessToken', accessToken, getCookieOptions(90 * 24 * 60 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, getCookieOptions(90 * 24 * 60 * 60 * 1000));

    res.json({
      success: true,
      sessionId: sessionId.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Login error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  const correlationId = req.correlationId || uuidv4();

  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Refresh token required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Find session by refresh token
    const session = await Session.findByRefreshToken(refreshToken);

    if (!session || !session.isValid()) {
      logger.warn('Invalid or expired refresh token', { correlationId });
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const user = session.userId;

    // Invalidate old session
    await session.invalidate();

    // Create new session
    const { accessToken, refreshToken: newRefreshToken, sessionId } = await createSession(
      user._id.toString(),
      user.role,
      req
    );

    logger.info('Token refresh successful', {
      correlationId,
      userId: user._id.toString(),
      oldSessionId: session._id.toString(),
      newSessionId: sessionId.toString()
    });

    // Set new cookies
    res.cookie('accessToken', accessToken, getCookieOptions(90 * 24 * 60 * 60 * 1000));
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(90 * 24 * 60 * 60 * 1000));

    res.json({
      success: true,
      sessionId: sessionId.toString()
    });
  } catch (error) {
    logger.error('Token refresh error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  const correlationId = uuidv4();

  try {
    // Get tokens from cookies or body
    const accessToken = req.cookies.accessToken || req.body.accessToken;
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (accessToken) {
      // Find and invalidate session by access token
      const session = await Session.findByAccessToken(accessToken);
      if (session) {
        await session.invalidate();
        logger.info('User logout successful', {
          correlationId,
          userId: session.userId.toString(),
          sessionId: session._id.toString()
        });
      }
    } else if (refreshToken) {
      // Find and invalidate session by refresh token
      const session = await Session.findByRefreshToken(refreshToken);
      if (session) {
        await session.invalidate();
        logger.info('User logout successful', {
          correlationId,
          userId: session.userId.toString(),
          sessionId: session._id.toString()
        });
      }
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully',
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Logout error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Logout from all devices
router.post('/logout-all', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const accessToken = req.cookies.accessToken || req.body.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const session = await Session.findByAccessToken(accessToken);

    if (!session) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid session',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Invalidate all user sessions
    await Session.invalidateAllUserSessions(session.userId);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    logger.info('User logged out from all devices', {
      correlationId,
      userId: session.userId.toString()
    });

    res.json({
      success: true,
      message: 'Logged out from all devices',
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Logout all error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Get active sessions
router.get('/sessions', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const session = await Session.findByAccessToken(accessToken);

    if (!session) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid session',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Get all active sessions for user
    const sessions = await Session.getUserActiveSessions(session.userId);

    res.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s._id.toString(),
        deviceInfo: s.deviceInfo,
        lastActivity: s.lastActivity,
        createdAt: s.createdAt,
        isCurrent: s._id.toString() === session._id.toString()
      })),
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get sessions error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Revoke specific session
router.delete('/sessions/:sessionId', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const { sessionId } = req.params;
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const currentSession = await Session.findByAccessToken(accessToken);

    if (!currentSession) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid session',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Find session to revoke
    const sessionToRevoke = await Session.findById(sessionId);

    if (!sessionToRevoke) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Verify ownership
    if (sessionToRevoke.userId.toString() !== currentSession.userId.toString()) {
      return res.status(403).json({
        error: {
          code: 'ACCESS_DENIED',
          message: 'Cannot revoke another user\'s session',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    await sessionToRevoke.invalidate();

    logger.info('Session revoked', {
      correlationId,
      userId: currentSession.userId.toString(),
      revokedSessionId: sessionId
    });

    res.json({
      success: true,
      message: 'Session revoked successfully',
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Revoke session error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Not authenticated',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const session = await Session.findByAccessToken(accessToken);

    if (!session || !session.isValid()) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid session',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const user = session.userId;

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        googleId: user.googleId ? true : false, // Don't expose actual Google ID
        createdAt: user.createdAt
      },
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get current user error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Update user profile
router.put('/update-profile', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Not authenticated',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const session = await Session.findByAccessToken(accessToken);

    if (!session || !session.isValid()) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid session',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const { name, email, timezone, location } = req.body;
    const user = await User.findById(session.userId._id);

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Update user fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (timezone !== undefined) user.timezone = timezone;
    if (location !== undefined) user.location = location;

    await user.save();

    logger.info('User profile updated', {
      correlationId,
      userId: user._id.toString()
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        timezone: user.timezone,
        location: user.location,
        createdAt: user.createdAt
      },
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Update profile error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Update password
router.put('/update-password', async (req, res) => {
  const correlationId = uuidv4();

  try {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Not authenticated',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const session = await Session.findByAccessToken(accessToken);

    if (!session || !session.isValid()) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid session',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password and new password are required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password must be at least 6 characters long',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const user = await User.findById(session.userId._id);

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await passwordManager.verifyPassword(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Hash new password
    const hashedNewPassword = await passwordManager.hashPassword(newPassword);
    user.passwordHash = hashedNewPassword;
    await user.save();

    logger.info('User password updated', {
      correlationId,
      userId: user._id.toString()
    });

    res.json({
      success: true,
      message: 'Password updated successfully',
      correlationId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Update password error', {
      correlationId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update password',
        correlationId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;