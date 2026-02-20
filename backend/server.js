/**
 * Main Server - Basic Backend Structure
 * 
 * This server includes the essential backend features:
 * - User authentication (signup, login, logout)
 * - Email verification
 * - Google OAuth
 * - Password reset
 * - Health check endpoints
 * 
 * This is a basic backend skeleton with authentication and core infrastructure.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const novaRoutes = require('./routes/nova'); // Amazon Nova AI integration
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 8000;

// Enhanced request logging middleware with performance tracking
app.use((req, res, next) => {
  req.correlationId = uuidv4();
  req.startTime = Date.now();

  // Log request
  logger.info('Request received', {
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info('Request completed', {
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: duration
    });
  });

  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cloudinary.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/nova', novaRoutes); // Amazon Nova AI endpoints

// Basic error handling
app.use((error, req, res, next) => {
  logger.error('Server error', {
    correlationId: req.correlationId,
    error: error.message,
    stack: error.stack
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    }
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

console.log('🔌 Connecting to MongoDB...');
// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME
})
  .then(() => {
    logger.info('Connected to MongoDB', {
      database: process.env.DB_NAME,
      url: process.env.MONGO_URL?.replace(/\/\/.*:.*@/, '//***:***@') // Hide credentials in logs
    });

    console.log('✅ Connected to MongoDB, Starting Express...');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version
      });

      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error', { error: error.message });
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error);
    logger.error('Failed to connect to MongoDB', { error: error.message });
    process.exit(1);
  });