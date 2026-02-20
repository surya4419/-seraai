import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class GrowthAnalyticsService {
  /**
   * Get competitor analysis for a profile
   */
  async getCompetitorAnalysis(profileId, niche = 'lifestyle') {
    try {
      const response = await axios.get(`${API_BASE_URL}/growth/competitors/${profileId}`, {
        params: { niche }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching competitor analysis:', error);
      throw error;
    }
  }

  /**
   * Get content format analysis for a profile
   */
  async getContentFormatAnalysis(profileId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/growth/formats/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching content format analysis:', error);
      throw error;
    }
  }

  /**
   * Get hashtag recommendations for a profile
   */
  async getHashtagRecommendations(profileId, contentType = 'general', region = 'global') {
    try {
      const response = await axios.get(`${API_BASE_URL}/growth/hashtags/${profileId}`, {
        params: { contentType, region }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hashtag recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate new hashtag set
   */
  async generateHashtagSet(profileId, contentType, niche, region) {
    try {
      const response = await axios.post(`${API_BASE_URL}/growth/hashtags/generate`, {
        profileId,
        contentType,
        niche,
        region
      });
      return response.data;
    } catch (error) {
      console.error('Error generating hashtag set:', error);
      throw error;
    }
  }

  /**
   * Get collaboration opportunities for a profile
   */
  async getCollaborationOpportunities(profileId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/growth/collaborations/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching collaboration opportunities:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive growth insights for a profile
   */
  async getGrowthInsights(profileId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/growth/insights/${profileId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching growth insights:', error);
      throw error;
    }
  }

  /**
   * Get complete growth analytics dashboard data
   */
  async getGrowthDashboard(profileId, niche = 'lifestyle') {
    try {
      const response = await axios.get(`${API_BASE_URL}/growth/dashboard/${profileId}`, {
        params: { niche }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching growth dashboard:', error);
      throw error;
    }
  }

  /**
   * Save a content idea or hashtag to user's planner
   */
  async saveIdea(profileId, type, content, category) {
    try {
      const response = await axios.post(`${API_BASE_URL}/growth/save-idea`, {
        profileId,
        type,
        content,
        category
      });
      return response.data;
    } catch (error) {
      console.error('Error saving idea:', error);
      throw error;
    }
  }

  /**
   * Get current trending topics and hashtags
   */
  async getTrends(niche = 'general', region = 'global') {
    try {
      const response = await axios.get(`${API_BASE_URL}/growth/trends`, {
        params: { niche, region }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  }

  /**
   * Mock data fallback for when API is not available
   */
  getMockGrowthData(profileId) {
    return {
      success: true,
      data: {
        competitors: {
          userProfile: {
            name: 'Your Profile',
            followers: 58200,
            engagement: 4.1,
            posts: 145,
            avgViews: 85000,
            postFrequency: '3.2/week',
            followerOverlap: 0,
            isUser: true
          },
          competitors: [
            {
              name: '@lifestyle_guru',
              followers: 62400,
              engagement: 3.8,
              posts: 156,
              avgViews: 92000,
              postFrequency: '4.1/week',
              followerOverlap: 23,
              topPosts: [
                { type: 'Reel', reach: 145000, hashtags: ['#lifestyle', '#morning', '#routine'] },
                { type: 'Carousel', reach: 89000, hashtags: ['#fashion', '#ootd', '#style'] }
              ]
            },
            {
              name: '@fashion_forward',
              followers: 71200,
              engagement: 4.5,
              posts: 134,
              avgViews: 108000,
              postFrequency: '3.8/week',
              followerOverlap: 18,
              topPosts: [
                { type: 'Reel', reach: 167000, hashtags: ['#fashion', '#trend', '#style'] },
                { type: 'Photo', reach: 76000, hashtags: ['#outfit', '#fashion', '#look'] }
              ]
            }
          ],
          aiInsights: [
            "Increase posting frequency to match top competitors",
            "Focus on Reels content for higher engagement",
            "Collaborate with creators who have audience overlap"
          ]
        },
        formats: {
          formatPerformance: [
            {
              format: 'Reels',
              avgEngagement: 6.2,
              posts: 45,
              trend: '+12%',
              trendDirection: 'up',
              examples: [
                { title: 'Morning Routine Reel', engagement: 8.4, views: 145000 },
                { title: 'Fashion Transition', engagement: 7.8, views: 132000 }
              ]
            },
            {
              format: 'Carousels',
              avgEngagement: 4.8,
              posts: 32,
              trend: '+5%',
              trendDirection: 'up',
              examples: [
                { title: 'Style Guide Carousel', engagement: 5.2, views: 89000 },
                { title: 'Product Review', engagement: 4.4, views: 67000 }
              ]
            }
          ],
          viralContent: [
            {
              title: "Morning Routine That Changed My Life",
              type: "Reel",
              views: 245000,
              engagement: 8.4,
              viralFactors: ["Strong hook", "Relatable content", "Trending audio"]
            }
          ],
          trendAnalysis: {
            trending: [
              { trend: "Get Ready With Me", growth: "+45%", category: "Lifestyle" },
              { trend: "Transition Reels", growth: "+32%", category: "Fashion" }
            ]
          }
        },
        hashtags: {
          topHashtags: [
            { tag: '#lifestyle', performance: 95, posts: 45, avgReach: 89000, category: 'Lifestyle' },
            { tag: '#fashion', performance: 92, posts: 38, avgReach: 76000, category: 'Fashion' },
            { tag: '#ootd', performance: 88, posts: 32, avgReach: 67000, category: 'Fashion' }
          ],
          scriptIdeas: [
            {
              type: 'Hook',
              script: "POV: You're getting ready but make it aesthetic ✨",
              performance: 'High',
              category: 'Lifestyle'
            }
          ]
        },
        collaborations: {
          suggestions: [
            {
              name: '@beauty_blogger',
              followers: 64200,
              engagement: 4.3,
              audienceOverlap: 34,
              niche: 'Beauty & Lifestyle',
              collabType: 'Cross-promotion',
              estimatedReach: '+15%',
              matchScore: 89
            }
          ]
        },
        insights: {
          growthMetrics: {
            followerGrowth: [
              { month: 'Jan', followers: 45000, growth: 2.1 },
              { month: 'Feb', followers: 47500, growth: 5.6 },
              { month: 'Mar', followers: 49200, growth: 3.6 },
              { month: 'Apr', followers: 52100, growth: 5.9 },
              { month: 'May', followers: 54800, growth: 5.2 },
              { month: 'Jun', followers: 58200, growth: 6.2 }
            ]
          },
          viralityScore: 78,
          recommendations: [
            "Increase Reel frequency to 4-5 per week for 30% engagement boost",
            "Post during peak hours (7-9 PM) for maximum reach",
            "Focus on lifestyle content - shows 23% higher engagement"
          ]
        }
      }
    };
  }
}

export default new GrowthAnalyticsService();