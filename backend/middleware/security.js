const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../utils/logger');

// Enhanced rate limiting configurations
const rateLimitConfigs = {
  // General API rate limiting
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later',
        retryAfter: '15 minutes'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' || req.path === '/api';
    }
  },
  
  // Strict rate limiting for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per window
    message: {
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later',
        retryAfter: '15 minutes'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    skipFailedRequests: false // Count failed requests
  },
  
  // Very strict rate limiting for password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: {
      error: {
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
        message: 'Too many password reset attempts, please try again later',
        retryAfter: '1 hour'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Moderate rate limiting for preview endpoints (public)
  preview: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // 10 previews per window
    message: {
      error: {
        code: 'PREVIEW_RATE_LIMIT_EXCEEDED',
        message: 'Too many preview requests, please try again later',
        retryAfter: '10 minutes'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Rate limiting for job creation
  jobCreation: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 jobs per window
    message: {
      error: {
        code: 'JOB_CREATION_RATE_LIMIT_EXCEEDED',
        message: 'Too many job creation requests, please try again later',
        retryAfter: '5 minutes'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Rate limiting for file uploads
  upload: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // 50 uploads per window
    message: {
      error: {
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'Too many upload requests, please try again later',
        retryAfter: '10 minutes'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  }
};

// Create rate limiter with custom handler
const createRateLimiter = (config) => {
  return rateLimit({
    ...config,
    handler: (req, res) => {
      const correlationId = req.correlationId;
      
      logger.warn('Rate limit exceeded', {
        correlationId,
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
      });
      
      res.status(429).json({
        ...config.message,
        correlationId,
        timestamp: new Date().toISOString()
      });
    }
  });
};

// Rate limiters
const rateLimiters = {
  general: createRateLimiter(rateLimitConfigs.general),
  auth: createRateLimiter(rateLimitConfigs.auth),
  passwordReset: createRateLimiter(rateLimitConfigs.passwordReset),
  preview: createRateLimiter(rateLimitConfigs.preview),
  jobCreation: createRateLimiter(rateLimitConfigs.jobCreation),
  upload: createRateLimiter(rateLimitConfigs.upload)
};

// User-specific rate limiting (requires authentication)
const createUserRateLimit = (windowMs, max, message) => {
  const store = new Map();
  
  return (req, res, next) => {
    if (!req.user?.id) {
      return next();
    }
    
    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (store.has(userId)) {
      const userRequests = store.get(userId).filter(time => time > windowStart);
      store.set(userId, userRequests);
    }
    
    const userRequests = store.get(userId) || [];
    
    if (userRequests.length >= max) {
      logger.warn('User rate limit exceeded', {
        correlationId: req.correlationId,
        userId,
        path: req.path,
        method: req.method,
        requestCount: userRequests.length
      });
      
      return res.status(429).json({
        error: {
          code: 'USER_RATE_LIMIT_EXCEEDED',
          message,
          correlationId: req.correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    userRequests.push(now);
    store.set(userId, userRequests);
    next();
  };
};

// User-specific rate limiters
const userRateLimiters = {
  // Daily application limit
  dailyApplications: createUserRateLimit(
    24 * 60 * 60 * 1000, // 24 hours
    5, // 5 applications per day
    'Daily application limit exceeded (5 per day)'
  ),
  
  // Hourly job creation limit
  hourlyJobs: createUserRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 jobs per hour
    'Hourly job creation limit exceeded (10 per hour)'
  )
};

// MongoDB injection protection
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('MongoDB injection attempt detected', {
      correlationId: req.correlationId,
      ip: req.ip,
      path: req.path,
      method: req.method,
      sanitizedKey: key,
      userAgent: req.get('User-Agent')
    });
  }
});

// XSS protection middleware
const xssProtection = (req, res, next) => {
  const correlationId = req.correlationId;
  
  // Check for common XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ];
  
  const checkForXSS = (obj, path = '') => {
    if (typeof obj === 'string') {
      for (const pattern of xssPatterns) {
        if (pattern.test(obj)) {
          logger.warn('XSS attempt detected', {
            correlationId,
            ip: req.ip,
            path: req.path,
            method: req.method,
            field: path,
            pattern: pattern.toString(),
            userAgent: req.get('User-Agent')
          });
          
          return res.status(400).json({
            error: {
              code: 'XSS_DETECTED',
              message: 'Potentially malicious content detected',
              field: path,
              correlationId,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const result = checkForXSS(value, path ? `${path}.${key}` : key);
        if (result) return result;
      }
    }
    return null;
  };
  
  // Check body, query, and params
  const xssResult = checkForXSS(req.body, 'body') || 
                   checkForXSS(req.query, 'query') || 
                   checkForXSS(req.params, 'params');
  
  if (xssResult) {
    return xssResult;
  }
  
  next();
};

// SQL injection protection (for any raw queries)
const sqlInjectionProtection = (req, res, next) => {
  const correlationId = req.correlationId;
  
  // Common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\'|\\\'|;|\\;|\||%|\*|<|>|\^|\[|\]|\{|\}|\(|\))/gi,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/gi,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi
  ];
  
  const checkForSQL = (obj, path = '') => {
    if (typeof obj === 'string') {
      for (const pattern of sqlPatterns) {
        if (pattern.test(obj)) {
          logger.warn('SQL injection attempt detected', {
            correlationId,
            ip: req.ip,
            path: req.path,
            method: req.method,
            field: path,
            pattern: pattern.toString(),
            userAgent: req.get('User-Agent')
          });
          
          return res.status(400).json({
            error: {
              code: 'SQL_INJECTION_DETECTED',
              message: 'Potentially malicious SQL content detected',
              field: path,
              correlationId,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const result = checkForSQL(value, path ? `${path}.${key}` : key);
        if (result) return result;
      }
    }
    return null;
  };
  
  // Check body, query, and params
  const sqlResult = checkForSQL(req.body, 'body') || 
                   checkForSQL(req.query, 'query') || 
                   checkForSQL(req.params, 'params');
  
  if (sqlResult) {
    return sqlResult;
  }
  
  next();
};

// Request size limiting
const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxBytes = typeof maxSize === 'string' ? 
      parseInt(maxSize.replace(/mb/i, '')) * 1024 * 1024 : maxSize;
    
    if (contentLength > maxBytes) {
      logger.warn('Request size limit exceeded', {
        correlationId: req.correlationId,
        ip: req.ip,
        path: req.path,
        method: req.method,
        contentLength,
        maxBytes,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(413).json({
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `Request size exceeds limit of ${maxSize}`,
          correlationId: req.correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    next();
  };
};

// Security headers middleware (additional to helmet)
const additionalSecurityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

module.exports = {
  rateLimiters,
  userRateLimiters,
  mongoSanitizeMiddleware,
  xssProtection,
  sqlInjectionProtection,
  requestSizeLimit,
  additionalSecurityHeaders,
  createRateLimiter,
  createUserRateLimit
};