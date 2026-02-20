/**
 * Amazon Nova AI Frontend Service
 * Amazon Nova AI Hackathon 2026 - Agentic AI Category
 * 
 * Frontend service for integrating Amazon Nova Foundation Models
 * with React components for brand-creator matching and analytics.
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';

class NovaAIFrontendService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Analyze brand-creator compatibility using Nova AI
   * @param {Object} brandData - Brand information
   * @param {Object} creatorData - Creator profile data
   * @returns {Promise<Object>} Compatibility analysis
   */
  async analyzeCompatibility(brandData, creatorData) {
    try {
      const response = await this.api.post('/nova/analyze-compatibility', {
        brandData,
        creatorData
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Nova AI compatibility analysis error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to analyze compatibility',
        data: null
      };
    }
  }

  /**
   * Generate campaign insights using Nova AI
   * @param {Object} campaignData - Campaign performance data
   * @returns {Promise<Object>} Campaign insights
   */
  async generateCampaignInsights(campaignData) {
    try {
      const response = await this.api.post('/nova/campaign-insights', {
        campaignData
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Nova AI campaign insights error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate insights',
        data: null
      };
    }
  }

  /**
   * Analyze multimodal content for brand alignment
   * @param {Array} contentArray - Array of content items
   * @param {Object} brandGuidelines - Brand guidelines
   * @returns {Promise<Object>} Content analysis
   */
  async analyzeContent(contentArray, brandGuidelines) {
    try {
      const response = await this.api.post('/nova/analyze-content', {
        contentArray,
        brandGuidelines
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Nova AI content analysis error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to analyze content',
        data: null
      };
    }
  }

  /**
   * Get Nova AI service health status
   * @returns {Promise<Object>} Health status
   */
  async getHealthStatus() {
    try {
      const response = await this.api.get('/nova/health');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Nova AI health check error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Health check failed'
      };
    }
  }

  /**
   * Get available Nova models and configuration
   * @returns {Promise<Object>} Models information
   */
  async getModelsInfo() {
    try {
      const response = await this.api.get('/nova/models');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Nova models info error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get models info'
      };
    }
  }

  /**
   * Simulate Nova AI analysis for demo purposes
   * @param {string} analysisType - Type of analysis to simulate
   * @param {Object} inputData - Input data for simulation
   * @returns {Object} Simulated analysis results
   */
  simulateAnalysis(analysisType, inputData) {
    const simulations = {
      compatibility: {
        compatibilityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        audienceAlignment: {
          score: Math.floor(Math.random() * 30) + 70,
          demographics: ['Age 18-34', 'Urban', 'Tech-savvy'],
          interests: ['Fashion', 'Lifestyle', 'Technology']
        },
        valueAlignment: {
          score: Math.floor(Math.random() * 25) + 75,
          matchedValues: ['Innovation', 'Authenticity', 'Quality'],
          alignmentNotes: 'Strong brand value alignment detected'
        },
        contentCompatibility: {
          score: Math.floor(Math.random() * 35) + 65,
          styleMatch: 'High',
          toneAlignment: 'Excellent',
          contentThemes: ['Lifestyle', 'Product Reviews', 'Tutorials']
        },
        opportunities: [
          'Product placement in lifestyle content',
          'Sponsored tutorial series',
          'Brand ambassador partnership'
        ],
        risks: ['Audience overlap may be limited', 'Seasonal content fluctuations'],
        recommendations: [
          'Focus on authentic product integration',
          'Leverage creator\'s tutorial format',
          'Consider long-term partnership'
        ],
        timestamp: new Date().toISOString(),
        modelUsed: 'amazon.nova-lite-v1:0'
      },
      campaign: {
        performanceAnalysis: {
          engagementRate: '4.2%',
          reach: '125K',
          conversionRate: '2.8%',
          roi: '340%'
        },
        trends: [
          'Video content performing 45% better than static posts',
          'Peak engagement during weekday evenings',
          'Strong performance in 25-34 age demographic'
        ],
        recommendations: [
          'Increase video content ratio to 70%',
          'Schedule posts for 6-9 PM weekdays',
          'Target lookalike audiences in urban areas'
        ],
        budgetAllocation: {
          videoContent: '70%',
          staticPosts: '20%',
          stories: '10%'
        },
        timing: {
          bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
          bestHours: ['18:00', '19:00', '20:00'],
          timezone: 'EST'
        }
      },
      content: {
        alignmentScore: Math.floor(Math.random() * 30) + 70, // 70-100
        visualAesthetic: {
          score: Math.floor(Math.random() * 25) + 75,
          notes: 'Consistent with brand visual identity',
          improvements: ['Consider brighter color palette', 'Add more lifestyle elements']
        },
        messagingAlignment: {
          score: Math.floor(Math.random() * 20) + 80,
          toneMatch: 'Excellent',
          valueAlignment: 'Strong'
        },
        audienceAppropriateness: {
          score: Math.floor(Math.random() * 15) + 85,
          demographicMatch: 'High',
          interestAlignment: 'Very Good'
        },
        brandSafety: {
          score: Math.floor(Math.random() * 10) + 90,
          riskLevel: 'Low',
          concerns: ['Minor language that could be misinterpreted']
        },
        optimizationSuggestions: [
          'Include more product-focused content',
          'Add brand hashtags consistently',
          'Feature user-generated content'
        ]
      }
    };

    return {
      success: true,
      data: {
        analysis: simulations[analysisType] || simulations.compatibility,
        timestamp: new Date().toISOString(),
        modelInfo: {
          name: 'amazon.nova-lite-v1:0',
          simulation: true
        }
      },
      message: 'Simulated analysis completed (demo mode)'
    };
  }

  /**
   * Get Nova AI configuration for frontend display
   * @returns {Object} Configuration information
   */
  getNovaConfig() {
    return {
      hackathonName: process.env.REACT_APP_HACKATHON_NAME,
      hackathonCategory: process.env.REACT_APP_HACKATHON_CATEGORY,
      projectName: process.env.REACT_APP_PROJECT_NAME,
      projectVersion: process.env.REACT_APP_PROJECT_VERSION,
      novaModel: process.env.REACT_APP_NOVA_MODEL_NAME,
      awsRegion: process.env.REACT_APP_AWS_REGION,
      features: {
        novaIntegration: process.env.REACT_APP_ENABLE_NOVA_INTEGRATION === 'true',
        agenticAI: process.env.REACT_APP_ENABLE_AGENTIC_AI === 'true',
        multimodalAnalysis: process.env.REACT_APP_ENABLE_MULTIMODAL_ANALYSIS === 'true',
        realTimeMatching: process.env.REACT_APP_ENABLE_REAL_TIME_MATCHING === 'true'
      }
    };
  }
}

// Create singleton instance
const novaAIFrontendService = new NovaAIFrontendService();

export default novaAIFrontendService;