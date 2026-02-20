/**
 * Amazon Nova AI Routes
 * Amazon Nova AI Hackathon 2026 - Agentic AI Category
 * 
 * API endpoints for Nova AI integration including compatibility analysis,
 * campaign insights, and multimodal content processing.
 */

const express = require('express');
const router = express.Router();
const NovaAIService = require('../services/novaService');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const novaService = new NovaAIService();

/**
 * POST /api/nova/analyze-compatibility
 * Analyze brand-creator compatibility using Nova AI
 * Requires authentication
 */
router.post('/analyze-compatibility',
  authenticateToken,
  [
    body('brandData').isObject().notEmpty(),
    body('creatorData').isObject().notEmpty(),
    body('brandData.industry').isString().notEmpty(),
    body('brandData.targetAudience').isObject().notEmpty(),
    body('creatorData.category').isString().notEmpty(),
    body('creatorData.audience').isObject().notEmpty()
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { brandData, creatorData } = req.body;
      
      logger.info('Nova AI compatibility analysis requested', {
        userId: req.user.id,
        brandIndustry: brandData.industry,
        creatorCategory: creatorData.category
      });

      // Perform Nova AI analysis
      const analysis = await novaService.analyzeCompatibility(brandData, creatorData);
      
      logger.info('Nova AI compatibility analysis completed', {
        userId: req.user.id,
        compatibilityScore: analysis.compatibilityScore,
        modelUsed: analysis.modelUsed
      });

      res.json({
        success: true,
        message: 'Compatibility analysis completed successfully',
        data: {
          analysis,
          timestamp: new Date().toISOString(),
          modelInfo: {
            name: novaService.modelId,
            maxTokens: novaService.maxTokens,
            temperature: novaService.temperature
          }
        }
      });

    } catch (error) {
      logger.error('Nova AI compatibility analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze compatibility',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/nova/campaign-insights
 * Generate campaign insights using Nova AI
 * Requires authentication
 */
router.post('/campaign-insights',
  authenticateToken,
  [
    body('campaignData').isObject().notEmpty(),
    body('campaignData.performance').isObject().notEmpty(),
    body('campaignData.metrics').isObject().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { campaignData } = req.body;
      
      logger.info('Nova AI campaign insights requested', {
        userId: req.user.id,
        campaignId: campaignData.id
      });

      const insights = await novaService.generateCampaignInsights(campaignData);
      
      logger.info('Nova AI campaign insights generated', {
        userId: req.user.id,
        campaignId: campaignData.id,
        insightsCount: insights.recommendations?.length || 0
      });

      res.json({
        success: true,
        message: 'Campaign insights generated successfully',
        data: {
          insights,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Nova AI campaign insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate campaign insights',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/nova/analyze-content
 * Analyze multimodal content for brand alignment
 * Requires authentication
 */
router.post('/analyze-content',
  authenticateToken,
  [
    body('contentArray').isArray().notEmpty(),
    body('brandGuidelines').isObject().notEmpty(),
    body('contentArray.*.type').isIn(['text', 'image', 'video']),
    body('contentArray.*.content').isString().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { contentArray, brandGuidelines } = req.body;
      
      logger.info('Nova AI content analysis requested', {
        userId: req.user.id,
        contentItems: contentArray.length,
        brandId: brandGuidelines.id
      });

      const analysis = await novaService.analyzeMultimodalContent(contentArray, brandGuidelines);
      
      logger.info('Nova AI content analysis completed', {
        userId: req.user.id,
        alignmentScore: analysis.alignmentScore,
        contentItems: contentArray.length
      });

      res.json({
        success: true,
        message: 'Content analysis completed successfully',
        data: {
          analysis,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Nova AI content analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze content',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/nova/health
 * Health check for Nova AI service
 * Public endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const health = await novaService.healthCheck();
    
    res.json({
      success: true,
      message: 'Nova AI service health check completed',
      data: health
    });

  } catch (error) {
    logger.error('Nova AI health check error:', error);
    res.status(503).json({
      success: false,
      message: 'Nova AI service is unhealthy',
      error: error.message
    });
  }
});

/**
 * GET /api/nova/models
 * Get available Nova models and configuration
 * Requires authentication
 */
router.get('/models',
  authenticateToken,
  async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Nova models information retrieved',
        data: {
          currentModel: novaService.modelId,
          configuration: {
            maxTokens: novaService.maxTokens,
            temperature: novaService.temperature,
            topP: novaService.topP,
            region: process.env.AWS_REGION
          },
          availableModels: [
            'amazon.nova-lite-v1:0',
            'amazon.nova-pro-v1:0',
            'amazon.nova-micro-v1:0'
          ]
        }
      });

    } catch (error) {
      logger.error('Nova models info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve models information',
        error: error.message
      });
    }
  }
);

module.exports = router;