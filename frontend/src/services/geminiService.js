import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('Gemini API key not found. AI features will be disabled.');
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Generation configuration
    this.generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
    
    // Safety settings
    this.safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ];
  }

  /**
   * Check if Gemini service is available
   */
  isAvailable() {
    return this.genAI !== null;
  }

  /**
   * Generate enhanced rate card analysis using Gemini AI
   * @param {Object} profileData - Creator profile data
   * @param {Object} localRateCard - Local rate card calculation for comparison
   * @returns {Promise<Object>} Enhanced rate card with AI insights
   */
  async generateEnhancedRateCard(profileData, localRateCard) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available');
    }

    try {
      const prompt = this.createRateCardPrompt(profileData, localRateCard);
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      const text = response.text();
      
      // Parse JSON response
      const aiAnalysis = JSON.parse(text);
      
      return {
        success: true,
        data: {
          ...aiAnalysis,
          generatedAt: new Date().toISOString(),
          model: 'gemini-2.0-flash-exp',
          localComparison: localRateCard
        }
      };
    } catch (error) {
      console.error('Gemini rate card generation error:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate market insights for pricing strategy
   * @param {Object} profileData - Creator profile data
   * @returns {Promise<Object>} Market insights and recommendations
   */
  async generateMarketInsights(profileData) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available');
    }

    try {
      const prompt = this.createMarketInsightsPrompt(profileData);
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      const text = response.text();
      
      return {
        success: true,
        insights: JSON.parse(text)
      };
    } catch (error) {
      console.error('Gemini market insights error:', error);
      throw new Error(`Market analysis failed: ${error.message}`);
    }
  }

  /**
   * Create rate card analysis prompt
   */
  createRateCardPrompt(profileData, localRateCard) {
    return `You are an expert social media pricing analyst. Analyze the creator data and provide enhanced pricing recommendations with market intelligence.

Creator Profile Data:
${JSON.stringify(profileData, null, 2)}

Local Rate Card Calculation:
${JSON.stringify(localRateCard, null, 2)}

Please provide a comprehensive analysis in this exact JSON format:
{
  "enhancedRates": {
    "platformRates": [
      {
        "platform": "instagram",
        "format": "post",
        "conservative": 150,
        "expected": 250,
        "premium": 400,
        "confidence": 0.85,
        "aiAdjustment": 1.2,
        "marketFactors": ["High engagement in beauty niche", "Premium audience demographics"],
        "rationale": ["Engagement rate 20% above industry average", "Strong brand alignment potential"]
      }
    ]
  },
  "marketIntelligence": {
    "nicheAnalysis": {
      "category": "beauty",
      "marketDemand": "high",
      "competitiveRate": "$200-400",
      "seasonalFactors": ["Q4 holiday campaigns", "Summer product launches"]
    },
    "audienceValue": {
      "demographics": "Premium 18-34 female audience",
      "purchasingPower": "high",
      "brandAffinities": ["luxury beauty", "sustainable fashion"]
    },
    "contentPerformance": {
      "topFormats": ["reels", "carousel"],
      "engagementTrends": "Video content performing 40% better",
      "optimalPosting": "Weekday evenings show highest engagement"
    }
  },
  "pricingStrategy": {
    "recommendations": [
      "Focus on Reels for premium pricing",
      "Package deals for story + post combinations",
      "Seasonal rate adjustments for peak periods"
    ],
    "negotiationTips": [
      "Highlight engagement quality over quantity",
      "Emphasize audience purchasing behavior data",
      "Offer performance guarantees for premium rates"
    ],
    "rateCardOptimization": [
      "Create tiered packages (basic/premium/exclusive)",
      "Include usage rights in pricing structure",
      "Add rush delivery premiums"
    ]
  },
  "confidenceScore": 0.87,
  "dataQuality": {
    "completeness": 0.9,
    "recency": 0.85,
    "accuracy": 0.88,
    "factors": ["90-day engagement history", "Verified metrics", "Complete audience data"]
  }
}

Focus on:
1. Market-competitive pricing based on niche and audience quality
2. Platform-specific performance insights
3. Actionable pricing strategy recommendations
4. Data-driven confidence scoring
5. Comparison with local calculations to identify optimization opportunities`;
  }

  /**
   * Create market insights prompt
   */
  createMarketInsightsPrompt(profileData) {
    return `Analyze the current market landscape for this creator profile and provide strategic insights.

Creator Profile:
${JSON.stringify(profileData, null, 2)}

Provide market analysis in this JSON format:
{
  "marketPosition": {
    "tier": "mid-tier",
    "competitiveAdvantages": ["High engagement rate", "Niche expertise"],
    "growthPotential": "high",
    "marketShare": "emerging"
  },
  "industryTrends": {
    "pricingTrends": "15% increase in beauty niche rates",
    "contentTrends": ["Short-form video dominance", "Authentic storytelling"],
    "brandPreferences": ["Sustainability focus", "Diversity initiatives"]
  },
  "opportunities": [
    {
      "type": "niche_expansion",
      "description": "Expand into wellness content",
      "potential": "25% rate increase",
      "timeline": "3-6 months"
    }
  ],
  "threats": [
    {
      "type": "market_saturation",
      "description": "Increased competition in beauty space",
      "impact": "moderate",
      "mitigation": "Focus on unique value proposition"
    }
  ],
  "recommendations": {
    "shortTerm": ["Optimize posting schedule", "Improve story engagement"],
    "longTerm": ["Build email list", "Develop signature content series"],
    "pricing": ["Implement tiered pricing", "Add performance bonuses"]
  }
}`;
  }

  /**
   * Generate content suggestions based on performance data
   */
  async generateContentSuggestions(profileData, performanceMetrics) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available');
    }

    try {
      const prompt = `Based on this creator's profile and performance data, suggest content strategies to increase engagement and justify premium pricing.

Profile: ${JSON.stringify(profileData, null, 2)}
Performance: ${JSON.stringify(performanceMetrics, null, 2)}

Provide suggestions in JSON format with specific, actionable recommendations.`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { ...this.generationConfig, temperature: 0.8 },
        safetySettings: this.safetySettings,
      });

      const response = result.response;
      return {
        success: true,
        suggestions: JSON.parse(response.text())
      };
    } catch (error) {
      console.error('Content suggestions error:', error);
      throw new Error(`Content analysis failed: ${error.message}`);
    }
  }

  /**
   * Validate and sanitize AI response
   */
  validateResponse(response, expectedFields) {
    const missing = expectedFields.filter(field => !(field in response));
    if (missing.length > 0) {
      throw new Error(`AI response missing required fields: ${missing.join(', ')}`);
    }
    return true;
  }
}

export default new GeminiService();