const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const router = express.Router();

// Health check cache to avoid expensive operations on every request
let healthCache = {
  lastCheck: 0,
  data: null,
  ttl: 30000 // 30 seconds
};

// Basic health check endpoint
router.get('/', async (req, res) => {
  const correlationId = req.correlationId || uuidv4();
  const startTime = Date.now();
  
  try {
    // Use cached health data if available and fresh
    const now = Date.now();
    if (healthCache.data && (now - healthCache.lastCheck) < healthCache.ttl) {
      return res.status(healthCache.data.status === 'healthy' ? 200 : 503)
        .json({
          ...healthCache.data,
          cached: true,
          correlationId,
          responseTime: Date.now() - startTime
        });
    }

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      pid: process.pid,
      hostname: require('os').hostname(),
      services: {},
      checks: {}
    };

    // Database connectivity check
    try {
      const dbState = mongoose.connection.readyState;
      const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      health.services.database = {
        status: dbState === 1 ? 'healthy' : 'unhealthy',
        state: dbStates[dbState] || 'unknown',
        host: mongoose.connection.host,
        name: mongoose.connection.name
      };

      if (dbState === 1) {
        // Test database with a simple query
        const dbCheck = await mongoose.connection.db.admin().ping();
        health.checks.databasePing = {
          status: 'passed',
          responseTime: Date.now() - startTime
        };
      } else {
        health.checks.databasePing = {
          status: 'failed',
          error: 'Database not connected'
        };
        health.status = 'unhealthy';
      }
    } catch (error) {
      health.services.database = {
        status: 'unhealthy',
        error: error.message
      };
      health.checks.databasePing = {
        status: 'failed',
        error: error.message
      };
      health.status = 'unhealthy';
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memoryMB = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    };

    health.services.memory = {
      status: memoryMB.heapUsed < 1000 ? 'healthy' : 'warning', // Warning if > 1GB
      usage: memoryMB,
      unit: 'MB'
    };

    health.checks.memoryUsage = {
      status: memoryMB.heapUsed < 1500 ? 'passed' : 'warning', // Critical if > 1.5GB
      heapUsedMB: memoryMB.heapUsed,
      threshold: 1500
    };


    // External services check (basic connectivity)
    health.services.external = {
      gemini: {
        status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
      },
      stripe: {
        status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured'
      },
      cloudinary: {
        status: process.env.CLOUDINARY_URL ? 'configured' : 'not_configured'
      }
    };

    // Overall status determination
    const hasUnhealthyServices = Object.values(health.services).some(
      service => service.status === 'unhealthy'
    );
    const hasFailedChecks = Object.values(health.checks).some(
      check => check.status === 'failed'
    );

    if (hasUnhealthyServices || hasFailedChecks) {
      health.status = 'unhealthy';
    } else if (health.status !== 'degraded') {
      const hasWarnings = Object.values(health.services).some(
        service => service.status === 'warning'
      ) || Object.values(health.checks).some(
        check => check.status === 'warning'
      );
      
      if (hasWarnings) {
        health.status = 'degraded';
      }
    }

    // Cache the result
    healthCache = {
      lastCheck: now,
      data: health,
      ttl: 30000
    };

    const responseTime = Date.now() - startTime;
    health.responseTime = responseTime;

    // Log health check results
    logger.info('Health check completed', {
      correlationId,
      status: health.status,
      responseTime,
      services: Object.keys(health.services).reduce((acc, key) => {
        acc[key] = health.services[key].status;
        return acc;
      }, {})
    });

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      ...health,
      correlationId
    });

  } catch (error) {
    logger.error('Health check failed', {
      correlationId,
      error: error.message,
      stack: error.stack
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      correlationId,
      responseTime: Date.now() - startTime
    });
  }
});

// Detailed health check endpoint (more comprehensive)
router.get('/detailed', async (req, res) => {
  const correlationId = req.correlationId || uuidv4();
  const startTime = Date.now();
  
  try {
    // Get basic health first
    const basicHealthResponse = await new Promise((resolve) => {
      const mockReq = { correlationId };
      const mockRes = {
        status: (code) => mockRes,
        json: (data) => resolve({ statusCode: code, data })
      };
      
      // Call the basic health check
      router.stack[0].route.stack[0].handle(mockReq, mockRes);
    });

    const health = basicHealthResponse.data;

    // Add detailed system information
    health.system = {
      platform: process.platform,
      arch: process.arch,
      cpus: require('os').cpus().length,
      totalMemory: Math.round(require('os').totalmem() / 1024 / 1024 / 1024) + 'GB',
      freeMemory: Math.round(require('os').freemem() / 1024 / 1024 / 1024) + 'GB',
      loadAverage: require('os').loadavg(),
      uptime: require('os').uptime()
    };


    // Add environment variables (sanitized)
    health.configuration = {
      nodeEnv: process.env.NODE_ENV,
      logLevel: process.env.LOG_LEVEL,
      port: process.env.PORT,
      mongoConnected: !!mongoose.connection.host,
      corsOrigins: process.env.CORS_ORIGINS ? 'configured' : 'default',
      externalServices: {
        gemini: !!process.env.GEMINI_API_KEY,
        stripe: !!process.env.STRIPE_SECRET_KEY,
        cloudinary: !!process.env.CLOUDINARY_URL
      }
    };

    health.responseTime = Date.now() - startTime;

    logger.info('Detailed health check completed', {
      correlationId,
      status: health.status,
      responseTime: health.responseTime
    });

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      ...health,
      correlationId
    });

  } catch (error) {
    logger.error('Detailed health check failed', {
      correlationId,
      error: error.message,
      stack: error.stack
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        code: 'DETAILED_HEALTH_CHECK_FAILED',
        message: 'Detailed health check failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      correlationId,
      responseTime: Date.now() - startTime
    });
  }
});

// Readiness probe (for Kubernetes/container orchestration)
router.get('/ready', async (req, res) => {
  const correlationId = req.correlationId || uuidv4();
  
  try {
    // Check if essential services are ready
    const isDbReady = mongoose.connection.readyState === 1;
    const hasRequiredEnvVars = !!(
      process.env.MONGO_URL && 
      process.env.JWT_SECRET
    );

    const ready = isDbReady && hasRequiredEnvVars;

    const response = {
      ready,
      timestamp: new Date().toISOString(),
      checks: {
        database: isDbReady,
        environment: hasRequiredEnvVars
      },
      correlationId
    };

    logger.debug('Readiness check', {
      correlationId,
      ready,
      checks: response.checks
    });

    res.status(ready ? 200 : 503).json(response);

  } catch (error) {
    logger.error('Readiness check failed', {
      correlationId,
      error: error.message
    });

    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      correlationId
    });
  }
});

// Liveness probe (for Kubernetes/container orchestration)
router.get('/live', (req, res) => {
  const correlationId = req.correlationId || uuidv4();
  
  // Simple liveness check - if we can respond, we're alive
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
    correlationId
  });
});

module.exports = router;