const Joi = require('joi');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../utils/logger');

// Common validation schemas
const schemas = {
  // MongoDB ObjectId validation
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId format'),
  
  // Email validation
  email: Joi.string().email().lowercase().trim().max(255),
  
  // Password validation
  password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message('Password must contain at least 8 characters with uppercase, lowercase, number and special character'),
  
  // Social media handle validation
  socialHandle: Joi.string().trim().min(1).max(100).pattern(/^[a-zA-Z0-9._-]+$/)
    .message('Handle must contain only letters, numbers, dots, underscores and hyphens'),
  
  // Platform validation
  platform: Joi.string().valid('instagram', 'tiktok', 'youtube', 'twitter', 'linkedin'),
  
  // URL validation
  url: Joi.string().uri({ scheme: ['http', 'https'] }).max(2048),
  
  // Pagination
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  },
  
  // Rate validation
  rate: Joi.number().positive().max(1000000).precision(2),
  
  // Text content validation
  text: {
    short: Joi.string().trim().max(255),
    medium: Joi.string().trim().max(1000),
    long: Joi.string().trim().max(5000)
  }
};

// Validation schemas for different endpoints
const validationSchemas = {
  // Auth endpoints
  auth: {
    signup: Joi.object({
      email: schemas.email.required(),
      password: schemas.password.required(),
      role: Joi.string().valid('creator', 'brand').required()
    }),
    
    login: Joi.object({
      email: schemas.email.required(),
      password: Joi.string().required()
    }),
    
    refresh: Joi.object({
      refreshToken: Joi.string().required()
    })
  },
  
  // Preview endpoints
  preview: {
    create: Joi.object({
      handles: Joi.array().items(
        Joi.object({
          platform: schemas.platform.required(),
          handle: schemas.socialHandle.required()
        })
      ).min(1).max(3).required()
    })
  },
  
  // Creator endpoints
  creator: {
    analyze: Joi.object({
      handles: Joi.array().items(
        Joi.object({
          platform: schemas.platform.required(),
          handle: schemas.socialHandle.required()
        })
      ).min(1).max(5).required()
    }),
    
    apply: Joi.object({
      campaignId: schemas.objectId.required(),
      proposedRate: schemas.rate.required(),
      message: schemas.text.medium.allow('').default(''),
      portfolio: Joi.array().items(schemas.url).max(10).default([])
    }),
    
    updateProfile: Joi.object({
      displayName: schemas.text.short.allow(''),
      bio: schemas.text.medium.allow(''),
      avatarUrl: schemas.url.allow(''),
      website: schemas.url.allow('')
    })
  },
  
  // Brand endpoints
  brand: {
    create: Joi.object({
      name: schemas.text.short.required(),
      website: schemas.url.allow(''),
      description: schemas.text.long.allow(''),
      logoUrl: schemas.url.allow(''),
      industry: schemas.text.short.allow(''),
      targetAudience: Joi.object({
        ageRange: Joi.object({
          min: Joi.number().integer().min(13).max(100),
          max: Joi.number().integer().min(13).max(100)
        }),
        genders: Joi.array().items(Joi.string().valid('male', 'female', 'non-binary', 'all')),
        locations: Joi.array().items(schemas.text.short),
        interests: Joi.array().items(schemas.text.short)
      })
    }),
    
    update: Joi.object({
      name: schemas.text.short,
      website: schemas.url.allow(''),
      description: schemas.text.long.allow(''),
      logoUrl: schemas.url.allow(''),
      industry: schemas.text.short.allow(''),
      targetAudience: Joi.object({
        ageRange: Joi.object({
          min: Joi.number().integer().min(13).max(100),
          max: Joi.number().integer().min(13).max(100)
        }),
        genders: Joi.array().items(Joi.string().valid('male', 'female', 'non-binary', 'all')),
        locations: Joi.array().items(schemas.text.short),
        interests: Joi.array().items(schemas.text.short)
      })
    })
  },
  
  // Campaign endpoints
  campaign: {
    create: Joi.object({
      title: schemas.text.short.required(),
      description: schemas.text.long.allow(''),
      budget: Joi.number().positive().max(10000000).required(),
      platforms: Joi.array().items(schemas.platform).min(1).required(),
      deliverables: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('post', 'reel', 'story', 'video').required(),
          quantity: Joi.number().integer().min(1).max(100).required(),
          requirements: schemas.text.medium.allow('')
        })
      ).min(1).required(),
      targetAudience: Joi.object({
        minFollowers: Joi.number().integer().min(0).max(100000000),
        maxFollowers: Joi.number().integer().min(0).max(100000000),
        minEngagementRate: Joi.number().min(0).max(1),
        locations: Joi.array().items(schemas.text.short),
        languages: Joi.array().items(Joi.string().length(2))
      })
    }),
    
    update: Joi.object({
      title: schemas.text.short,
      description: schemas.text.long.allow(''),
      budget: Joi.number().positive().max(10000000),
      platforms: Joi.array().items(schemas.platform).min(1),
      deliverables: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('post', 'reel', 'story', 'video').required(),
          quantity: Joi.number().integer().min(1).max(100).required(),
          requirements: schemas.text.medium.allow('')
        })
      ).min(1),
      targetAudience: Joi.object({
        minFollowers: Joi.number().integer().min(0).max(100000000),
        maxFollowers: Joi.number().integer().min(0).max(100000000),
        minEngagementRate: Joi.number().min(0).max(1),
        locations: Joi.array().items(schemas.text.short),
        languages: Joi.array().items(Joi.string().length(2))
      }),
      status: Joi.string().valid('draft', 'active', 'paused', 'completed', 'cancelled')
    })
  },
  
  // Payment endpoints
  payment: {
    createIntent: Joi.object({
      campaignId: schemas.objectId.required(),
      amount: Joi.number().positive().max(10000000).required()
    }),
    
    confirmPayment: Joi.object({
      paymentIntentId: Joi.string().required(),
      campaignId: schemas.objectId.required()
    })
  },
  
  // Common query parameters
  query: {
    pagination: Joi.object({
      page: schemas.pagination.page,
      limit: schemas.pagination.limit
    }),
    
    search: Joi.object({
      q: schemas.text.short.allow(''),
      status: Joi.string().valid('active', 'inactive', 'pending', 'completed', 'cancelled'),
      platform: schemas.platform,
      sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'budget', 'followers'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  },
  
  // Parameters validation
  params: {
    objectId: Joi.object({
      id: schemas.objectId.required()
    }),
    
    profileId: Joi.object({
      profileId: schemas.objectId.required()
    }),
    
    campaignId: Joi.object({
      campaignId: schemas.objectId.required()
    }),
    
    brandId: Joi.object({
      brandId: schemas.objectId.required()
    })
  }
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const correlationId = req.correlationId;
    
    // Sanitize MongoDB operators before validation
    if (source === 'body' && req.body) {
      req.body = mongoSanitize.sanitize(req.body);
    } else if (source === 'query' && req.query) {
      req.query = mongoSanitize.sanitize(req.query);
    } else if (source === 'params' && req.params) {
      req.params = mongoSanitize.sanitize(req.params);
    }
    
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      logger.warn('Validation failed', {
        correlationId,
        source,
        errors: validationErrors,
        path: req.path,
        method: req.method
      });
      
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: validationErrors,
          correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Replace the original data with validated and sanitized data
    req[source] = value;
    next();
  };
};

// Convenience functions for common validations
const validateBody = (schema) => validate(schema, 'body');
const validateQuery = (schema) => validate(schema, 'query');
const validateParams = (schema) => validate(schema, 'params');

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize all input sources
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }
  if (req.query) {
    req.query = mongoSanitize.sanitize(req.query);
  }
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params);
  }
  
  next();
};

// File upload validation
const validateFileUpload = (options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxFiles = 1
  } = options;
  
  return (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }
    
    if (req.files.length > maxFiles) {
      return res.status(400).json({
        error: {
          code: 'TOO_MANY_FILES',
          message: `Maximum ${maxFiles} files allowed`,
          correlationId: req.correlationId,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    for (const file of req.files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
            correlationId: req.correlationId,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_FILE_TYPE',
            message: `File type ${file.mimetype} not allowed`,
            correlationId: req.correlationId,
            timestamp: new Date().toISOString()
          }
        });
      }
    }
    
    next();
  };
};

module.exports = {
  schemas,
  validationSchemas,
  validate,
  validateBody,
  validateQuery,
  validateParams,
  sanitizeInput,
  validateFileUpload
};