const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Enhanced error handling middleware with structured error responses
 * and comprehensive logging
 */

// Error classification and mapping
const ERROR_TYPES = {
  // Validation errors
  VALIDATION_ERROR: {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: 'Validation failed'
  },
  INVALID_INPUT: {
    statusCode: 400,
    code: 'INVALID_INPUT',
    message: 'Invalid input provided'
  },
  
  // Authentication/Authorization errors
  AUTHENTICATION_ERROR: {
    statusCode: 401,
    code: 'AUTHENTICATION_ERROR',
    message: 'Authentication required'
  },
  INVALID_TOKEN: {
    statusCode: 401,
    code: 'INVALID_TOKEN',
    message: 'Invalid or expired token'
  },
  ACCESS_DENIED: {
    statusCode: 403,
    code: 'ACCESS_DENIED',
    message: 'Access denied'
  },
  
  // Resource errors
  NOT_FOUND: {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: 'Resource not found'
  },
  DUPLICATE_ENTRY: {
    statusCode: 409,
    code: 'DUPLICATE_ENTRY',
    message: 'Resource already exists'
  },
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: {
    statusCode: 429,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded'
  },
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: {
    statusCode: 502,
    code: 'EXTERNAL_SERVICE_ERROR',
    message: 'External service error'
  },
  SERVICE_UNAVAILABLE: {
    statusCode: 503,
    code: 'SERVICE_UNAVAILABLE',
    message: 'Service temporarily unavailable'
  },
  
  // Internal errors
  INTERNAL_ERROR: {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error'
  },
  DATABASE_ERROR: {
    statusCode: 500,
    code: 'DATABASE_ERROR',
    message: 'Database operation failed'
  }
};

/**
 * Classify error based on error properties
 */
function classifyError(error) {
  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    return {
      ...ERROR_TYPES.VALIDATION_ERROR,
      details: Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    };
  }

  // Mongoose cast errors (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return {
      statusCode: 400,
      code: 'INVALID_ID',
      message: 'Invalid ID format',
      details: {
        field: error.path,
        value: error.value,
        expectedType: error.kind
      }
    };
  }

  // MongoDB duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return {
      ...ERROR_TYPES.DUPLICATE_ENTRY,
      details: {
        field,
        message: `${field} already exists`
      }
    };
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ERROR_TYPES.INVALID_TOKEN;
  }

  if (error.name === 'TokenExpiredError') {
    return {
      ...ERROR_TYPES.INVALID_TOKEN,
      message: 'Token has expired'
    };
  }

  // Rate limiting errors
  if (error.type === 'entity.too.large') {
    return {
      statusCode: 413,
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Request payload too large'
    };
  }

  // Custom application errors
  if (error.statusCode || error.status) {
    return {
      statusCode: error.statusCode || error.status,
      code: error.code || 'APPLICATION_ERROR',
      message: error.message || 'Application error',
      details: error.details
    };
  }

  // Network/timeout errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return ERROR_TYPES.SERVICE_UNAVAILABLE;
  }

  // Default to internal error
  return ERROR_TYPES.INTERNAL_ERROR;
}

/**
 * Sanitize error details for production
 */
function sanitizeErrorDetails(error, isDevelopment) {
  const sanitized = {
    message: error.message,
    code: error.code
  };

  if (isDevelopment) {
    sanitized.stack = error.stack;
    sanitized.details = error.details;
  }

  return sanitized;
}

/**
 * Log error with appropriate level and context
 */
function logError(error, req, errorInfo) {
  const correlationId = req.correlationId || uuidv4();
  const requestLogger = logger.createRequestLogger(req);
  
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
      headers: {
        'user-agent': req.get('User-Agent'),
        'content-type': req.get('Content-Type'),
        'authorization': req.get('Authorization') ? '[REDACTED]' : undefined
      }
    },
    response: {
      statusCode: errorInfo.statusCode,
      errorCode: errorInfo.code
    },
    correlationId
  };

  // Log at appropriate level based on status code
  if (errorInfo.statusCode >= 500) {
    requestLogger.error('Server error occurred', logData);
  } else if (errorInfo.statusCode >= 400) {
    requestLogger.warn('Client error occurred', logData);
  } else {
    requestLogger.info('Request completed with error', logData);
  }
}

/**
 * Main error handling middleware
 */
function errorHandler(error, req, res, next) {
  const correlationId = req.correlationId || uuidv4();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Classify the error
  const errorInfo = classifyError(error);
  
  // Log the error
  logError(error, req, errorInfo);
  
  // Prepare error response
  const errorResponse = {
    error: {
      code: errorInfo.code,
      message: errorInfo.message,
      correlationId,
      timestamp: new Date().toISOString()
    }
  };

  // Add details if available
  if (errorInfo.details) {
    errorResponse.error.details = errorInfo.details;
  }

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  // Add request ID for debugging
  if (req.id) {
    errorResponse.error.requestId = req.id;
  }

  // Set appropriate headers
  res.set({
    'X-Correlation-ID': correlationId,
    'X-Error-Code': errorInfo.code
  });

  // Send error response
  res.status(errorInfo.statusCode).json(errorResponse);
}

/**
 * Async error wrapper for route handlers
 */
function asyncErrorHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler for unmatched routes
 */
function notFoundHandler(req, res) {
  const correlationId = req.correlationId || uuidv4();
  
  logger.warn('Route not found', {
    correlationId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'Route not found',
      path: req.originalUrl,
      method: req.method,
      correlationId,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Create custom error with specific type
 */
function createError(type, message, details) {
  const errorType = ERROR_TYPES[type] || ERROR_TYPES.INTERNAL_ERROR;
  const error = new Error(message || errorType.message);
  
  error.statusCode = errorType.statusCode;
  error.code = errorType.code;
  error.details = details;
  
  return error;
}

/**
 * Validation error helper
 */
function createValidationError(field, message, value) {
  return createError('VALIDATION_ERROR', 'Validation failed', {
    field,
    message,
    value
  });
}

/**
 * Authentication error helper
 */
function createAuthError(message = 'Authentication required') {
  return createError('AUTHENTICATION_ERROR', message);
}

/**
 * Authorization error helper
 */
function createAuthzError(message = 'Access denied') {
  return createError('ACCESS_DENIED', message);
}

/**
 * Not found error helper
 */
function createNotFoundError(resource = 'Resource') {
  return createError('NOT_FOUND', `${resource} not found`);
}

/**
 * Rate limit error helper
 */
function createRateLimitError(message = 'Rate limit exceeded') {
  return createError('RATE_LIMIT_EXCEEDED', message);
}

/**
 * External service error helper
 */
function createExternalServiceError(service, message) {
  return createError('EXTERNAL_SERVICE_ERROR', 
    message || `${service} service error`);
}

module.exports = {
  errorHandler,
  asyncErrorHandler,
  notFoundHandler,
  createError,
  createValidationError,
  createAuthError,
  createAuthzError,
  createNotFoundError,
  createRateLimitError,
  createExternalServiceError,
  ERROR_TYPES
};