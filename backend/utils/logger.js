const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Enhanced JSON format for structured logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const logEntry = {
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      service: 'creator-agent-backend',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      pid: process.pid,
      hostname: require('os').hostname()
    };

    // Add correlation ID if present
    if (info.correlationId) {
      logEntry.correlationId = info.correlationId;
    }

    // Add request context if present
    if (info.requestId) logEntry.requestId = info.requestId;
    if (info.userId) logEntry.userId = info.userId;
    if (info.jobId) logEntry.jobId = info.jobId;
    if (info.workerId) logEntry.workerId = info.workerId;

    // Add error details if present
    if (info.error) {
      logEntry.error = {
        message: info.error.message || info.error,
        stack: info.error.stack,
        code: info.error.code
      };
    }

    // Add stack trace for errors
    if (info.stack) {
      logEntry.stack = info.stack;
    }

    // Add performance metrics if present
    if (info.duration !== undefined) logEntry.duration = info.duration;
    if (info.memoryUsage) logEntry.memoryUsage = info.memoryUsage;

    // Add any additional metadata
    const excludedKeys = [
      'timestamp', 'level', 'message', 'correlationId', 'requestId', 
      'userId', 'jobId', 'workerId', 'error', 'stack', 'duration', 
      'memoryUsage', 'service', 'environment', 'version', 'pid', 'hostname'
    ];
    
    const metadata = {};
    Object.keys(info).forEach(key => {
      if (!excludedKeys.includes(key) && info[key] !== undefined) {
        metadata[key] = info[key];
      }
    });

    if (Object.keys(metadata).length > 0) {
      logEntry.metadata = metadata;
    }

    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    let output = `${info.timestamp} ${info.level}: ${info.message}`;
    
    if (info.correlationId) {
      output += ` [${info.correlationId}]`;
    }
    
    if (info.duration !== undefined) {
      output += ` (${info.duration}ms)`;
    }
    
    if (info.stack) {
      output += `\n${info.stack}`;
    }
    
    // Add metadata if present
    const excludedKeys = [
      'timestamp', 'level', 'message', 'correlationId', 'stack', 'duration'
    ];
    const metadata = {};
    Object.keys(info).forEach(key => {
      if (!excludedKeys.includes(key) && info[key] !== undefined) {
        metadata[key] = info[key];
      }
    });
    
    if (Object.keys(metadata).length > 0) {
      output += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    return output;
  })
);

// Define transports
const transports = [
  // Console transport (formatted for readability in development)
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? jsonFormat : consoleFormat
  }),
  
  // File transport for errors (structured JSON)
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: jsonFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }),
  
  // File transport for all logs (structured JSON)
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: jsonFormat,
    maxsize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    tailable: true
  }),

  // File transport for HTTP requests
  new winston.transports.File({
    filename: path.join(logsDir, 'access.log'),
    level: 'http',
    format: jsonFormat,
    maxsize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5,
    tailable: true
  }),

  // File transport for job processing
  new winston.transports.File({
    filename: path.join(logsDir, 'jobs.log'),
    format: jsonFormat,
    maxsize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5,
    tailable: true,
    // Custom filter for job-related logs
    filter: (info) => {
      return info.jobId || info.workerId || 
             info.message.includes('job') || 
             info.message.includes('worker') ||
             info.message.includes('agent');
    }
  })
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: jsonFormat,
  transports,
  exitOnError: false,
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: jsonFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: jsonFormat
    })
  ]
});

// Enhanced logging methods with context
const createContextualLogger = (context = {}) => {
  return {
    error: (message, meta = {}) => logger.error(message, { ...context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { ...context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { ...context, ...meta }),
    http: (message, meta = {}) => logger.http(message, { ...context, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { ...context, ...meta })
  };
};

// Performance monitoring helper
const createPerformanceLogger = (operation, context = {}) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  return {
    finish: (message, meta = {}) => {
      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();
      const memoryDelta = {
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external
      };
      
      logger.info(message || `${operation} completed`, {
        ...context,
        ...meta,
        duration,
        memoryDelta,
        operation
      });
      
      return duration;
    },
    
    error: (message, error, meta = {}) => {
      const duration = Date.now() - startTime;
      logger.error(message || `${operation} failed`, {
        ...context,
        ...meta,
        duration,
        error,
        operation
      });
    }
  };
};

// Job monitoring helper
const createJobLogger = (jobId, workerId, jobType) => {
  const context = { jobId, workerId, jobType };
  return createContextualLogger(context);
};

// Request monitoring helper
const createRequestLogger = (req) => {
  const context = {
    correlationId: req.correlationId,
    requestId: req.id,
    userId: req.user?.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  return createContextualLogger(context);
};

// System metrics logging
const logSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  logger.info('System metrics', {
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(memUsage.external / 1024 / 1024) + 'MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: process.uptime(),
    pid: process.pid
  });
};

// Start periodic system metrics logging
if (process.env.NODE_ENV === 'production') {
  setInterval(logSystemMetrics, 5 * 60 * 1000); // Every 5 minutes
}

// Add utility methods to the logger instance
logger.createContextualLogger = createContextualLogger;
logger.createPerformanceLogger = createPerformanceLogger;
logger.createJobLogger = createJobLogger;
logger.createRequestLogger = createRequestLogger;
logger.logSystemMetrics = logSystemMetrics;

// Export the enhanced logger
module.exports = logger;