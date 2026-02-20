const jwtManager = require('../utils/jwt');
const User = require('../models/User');
const Session = require('../models/Session');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Authentication middleware
const authenticate = async (req, res, next) => {
  const correlationId = uuidv4();
  req.correlationId = correlationId;

  try {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      logger.warn('Missing access token', { 
        correlationId,
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization token required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Find session by access token
    const session = await Session.findByAccessToken(token);
    
    if (!session || !session.isValid()) {
      logger.warn('Invalid or expired session', { 
        correlationId,
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    const user = session.userId;

    // Update session activity
    await session.updateActivity();

    // Attach user and session to request
    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;
    req.session = session;

    logger.debug('Authentication successful', { 
      correlationId,
      userId: user._id.toString(),
      role: user.role,
      sessionId: session._id.toString(),
      path: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error', { 
      correlationId,
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
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
};

// Authorization middleware factory
const authorize = (...roles) => {
  return (req, res, next) => {
    const correlationId = req.correlationId || uuidv4();

    if (!req.user) {
      logger.warn('Authorization check without authentication', { 
        correlationId,
        path: req.path,
        method: req.method
      });
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (roles.length > 0 && !roles.includes(req.userRole)) {
      logger.warn('Insufficient permissions', { 
        correlationId,
        userId: req.userId,
        userRole: req.userRole,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      });
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions',
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }

    logger.debug('Authorization successful', { 
      correlationId,
      userId: req.userId,
      userRole: req.userRole,
      requiredRoles: roles,
      path: req.path,
      method: req.method
    });

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const correlationId = uuidv4();
  req.correlationId = correlationId;

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwtManager.verifyToken(token);
      const user = await User.findById(decoded.sub);
      
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
        req.userRole = user.role;
        
        logger.debug('Optional authentication successful', { 
          correlationId,
          userId: user._id.toString(),
          role: user.role,
          path: req.path,
          method: req.method
        });
      }
    } catch (error) {
      // Invalid token, but we don't fail - just continue without auth
      logger.debug('Optional authentication failed', { 
        correlationId,
        error: error.message,
        path: req.path,
        method: req.method
      });
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error', { 
      correlationId,
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });
    // Don't fail on error in optional auth
    next();
  }
};

// Create convenience functions with expected names
const authenticateToken = authenticate;
const requireRole = (role) => authorize(role);

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  authenticateToken,
  requireRole
};