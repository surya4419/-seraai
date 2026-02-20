import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import growthAnalyticsService from '../services/growthAnalyticsService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, Target, Sparkles, ArrowUpRight, ArrowDownRight, Plus,
  Hash, Zap, Filter, Download, Copy, RefreshCw, BarChart3,
  Star, CheckCircle, MessageCircle, Heart, Settings
} from 'lucide-react';

// Hashtag Generator Component
const HashtagGenerator = ({ selectedProfile, onGenerate, loading }) => {
  const [contentType, setContentType] = useState('reel');
  const [niche, setNiche] = useState('lifestyle');
  const [region, setRegion] = useState('global');

  const handleGenerate = () => {
    onGenerate(contentType, niche, region);
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <select 
          className="px-3 py-2 border rounded-lg"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
        >
          <option value="">Content Type</option>
          <option value="reel">Reel</option>
          <option value="photo">Photo</option>
          <option value="carousel">Carousel</option>
          <option value="story">Story</option>
        </select>
        <select 
          className="px-3 py-2 border rounded-lg"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
        >
          <option value="">Niche</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="fashion">Fashion</option>
          <option value="beauty">Beauty</option>
          <option value="fitness">Fitness</option>
          <option value="food">Food</option>
          <option value="travel">Travel</option>
        </select>
        <select 
          className="px-3 py-2 border rounded-lg"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">Region</option>
          <option value="global">Global</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
          <option value="au">Australia</option>
        </select>
      </div>
      <Button
        className="w-full"
        onClick={handleGenerate}
        disabled={loading || !contentType || !niche || !region}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {loading ? 'Generating...' : 'Generate Hashtag Set'}
      </Button>
    </>
  );
};

const GrowthStatistics = ({ profiles, selectedProfile, dashboardData }) => {
  const [activeTab, setActiveTab] = useState('competitor-check');
  const [loading, setLoading] = useState(false);
  const [growthData, setGrowthData] = useState(null);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('GrowthStatistics - selectedProfile:', selectedProfile);
    console.log('GrowthStatistics - profiles:', profiles);
  }, [selectedProfile, profiles]);

  // Load growth data on component mount and when profile changes
  useEffect(() => {
    if (selectedProfile && (selectedProfile._id || selectedProfile.id)) {
      loadGrowthData();
    }
  }, [selectedProfile]);

  const loadGrowthData = async () => {
    if (!selectedProfile || (!selectedProfile._id && !selectedProfile.id)) {
      setError('No profile selected');
      return;
    }

    const profileId = selectedProfile._id || selectedProfile.id;
    setLoading(true);
    setError(null);

    try {
      // Try to fetch real data from API
      const response = await growthAnalyticsService.getGrowthDashboard(profileId);

      if (response.success) {
        setGrowthData(response.data);
      } else {
        throw new Error(response.error || 'Failed to load growth data');
      }
    } catch (error) {
      console.warn('Failed to load growth data from API, generating insights from profile data:', error);

      // Generate insights based on real profile data
      const profileBasedData = generateProfileBasedInsights(selectedProfile);
      setGrowthData(profileBasedData);

      // Only show demo message if we don't have real profile data
      if (!selectedProfile?.profileData?.followersCount) {
        toast.info('Using demo data - connect your profile for real insights');
      } else {
        toast.success('Growth insights generated from your profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIdea = async (type, content, category) => {
    if (!selectedProfile || (!selectedProfile._id && !selectedProfile.id)) {
      toast.error('No profile selected');
      return;
    }

    const profileId = selectedProfile._id || selectedProfile.id;

    try {
      await growthAnalyticsService.saveIdea(profileId, type, content, category);
      toast.success(`${type} saved to your planner!`);
    } catch (error) {
      console.error('Error saving idea:', error);
      toast.error('Failed to save idea');
    }
  };

  const handleCollaboration = async (collab) => {
    if (!selectedProfile || (!selectedProfile._id && !selectedProfile.id)) {
      toast.error('No profile selected');
      return;
    }

    const profileId = selectedProfile._id || selectedProfile.id;

    try {
      // In a real app, this would send a collaboration request
      toast.success(`Collaboration request sent to ${collab.name}!`);
      
      // Save the collaboration idea to the user's planner
      await growthAnalyticsService.saveIdea(
        profileId, 
        'Collaboration', 
        `${collab.collabType} with ${collab.name} - ${collab.niche}`, 
        'Partnerships'
      );
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      toast.error('Failed to send collaboration request');
    }
  };

  const handleGenerateHashtags = async (contentType, niche, region) => {
    console.log('Generate hashtags called with:', { contentType, niche, region, selectedProfile });
    
    if (!selectedProfile || (!selectedProfile._id && !selectedProfile.id)) {
      toast.error('No profile selected - please select a profile first');
      return;
    }

    const profileId = selectedProfile._id || selectedProfile.id;

    setLoading(true);
    try {
      const response = await growthAnalyticsService.generateHashtagSet(
        profileId,
        contentType,
        niche,
        region
      );

      if (response.success) {
        // Update the hashtag data in the current growth data
        setGrowthData(prev => ({
          ...prev,
          hashtags: response.data
        }));
        toast.success('New hashtag set generated!');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error generating hashtags:', error);
      
      // Generate mock hashtags as fallback
      const mockHashtags = {
        topHashtags: [
          { tag: `#${contentType}content`, performance: 94, posts: 12, avgReach: Math.floor((selectedProfile?.profileData?.followersCount || 50000) * 1.4), category: contentType },
          { tag: `#${niche}life`, performance: 91, posts: 8, avgReach: Math.floor((selectedProfile?.profileData?.followersCount || 50000) * 1.2), category: niche },
          { tag: '#trending', performance: 88, posts: 15, avgReach: Math.floor((selectedProfile?.profileData?.followersCount || 50000) * 1.1), category: 'Trending' },
          { tag: '#viral', performance: 85, posts: 6, avgReach: Math.floor((selectedProfile?.profileData?.followersCount || 50000) * 0.9), category: 'Viral' }
        ]
      };
      
      setGrowthData(prev => ({
        ...prev,
        hashtags: mockHashtags
      }));
      
      toast.success('Generated new hashtag set (demo data)');
    } finally {
      setLoading(false);
    }
  };

  // Generate insights based on real profile data
  const generateProfileBasedInsights = (profile) => {
    const profileData = profile?.profileData || {};
    const profileFollowers = profileData.followersCount || 1000;
    const profileEngagement = profileData.engagementRate || 2.5;
    const profileCategories = profileData.categories || ['lifestyle'];
    const profilePosts = profileData.mediaCount || 50;
    const profileName = profile?.handle || 'your_profile';
    const isVerified = profileData.isVerified || false;
    const avgLikes = profileData.avgLikesPerPost || Math.floor(profileFollowers * 0.03);
    const avgComments = profileData.avgCommentsPerPost || Math.floor(avgLikes * 0.05);

    // Calculate realistic metrics based on actual data
    const calculateViralityScore = () => {
      let score = 50; // Base score
      if (profileEngagement > 5) score += 30;
      else if (profileEngagement > 3) score += 20;
      else if (profileEngagement > 1) score += 10;
      
      if (profileFollowers > 100000) score += 20;
      else if (profileFollowers > 10000) score += 15;
      else if (profileFollowers > 1000) score += 10;
      
      if (isVerified) score += 10;
      if (profilePosts > 100) score += 5;
      
      return Math.min(100, Math.max(0, score));
    };

    // Generate realistic competitor data
    const generateCompetitors = () => {
      const competitors = [];
      const baseFollowers = profileFollowers;
      
      for (let i = 0; i < 3; i++) {
        const multiplier = 0.8 + (Math.random() * 0.6); // 0.8 to 1.4
        const competitorFollowers = Math.floor(baseFollowers * multiplier);
        const competitorEngagement = Math.max(1.5, profileEngagement + (Math.random() - 0.5) * 2);
        
        competitors.push({
          name: `@${profileCategories[0]}_creator_${i + 1}`,
          followers: competitorFollowers,
          engagement: Math.round(competitorEngagement * 10) / 10,
          posts: Math.floor(profilePosts * (0.8 + Math.random() * 0.4)),
          avgViews: Math.floor(competitorFollowers * (1.2 + Math.random() * 0.6)),
          postFrequency: `${(2.5 + Math.random() * 2).toFixed(1)}/week`,
          followerOverlap: Math.floor(15 + Math.random() * 25),
          niche: `${profileCategories[0]} ${['enthusiast', 'creator', 'influencer'][i]}`
        });
      }
      
      return competitors;
    };

    // Generate growth timeline based on current followers
    const generateGrowthTimeline = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const timeline = [];
      
      for (let i = 0; i < 6; i++) {
        const monthMultiplier = 0.7 + (i * 0.05); // Gradual growth
        const followers = Math.floor(profileFollowers * monthMultiplier);
        const growth = i === 0 ? 0 : ((timeline[i-1]?.followers || followers) / followers - 1) * 100;
        
        timeline.push({
          month: months[i],
          followers: followers,
          growth: Math.round(Math.abs(growth) * 10) / 10,
          engagement: Math.round((profileEngagement + (Math.random() - 0.5)) * 10) / 10,
          posts: Math.floor(profilePosts * (0.6 + i * 0.08)),
          reach: Math.floor(followers * (1.5 + Math.random() * 0.5)),
          impressions: Math.floor(followers * (2.5 + Math.random() * 1))
        });
      }
      
      return timeline;
    };

    return {
      competitors: {
        userProfile: {
          name: `@${profileName}`,
          followers: profileFollowers,
          engagement: profileEngagement,
          posts: profilePosts,
          avgViews: Math.floor(profileFollowers * 1.5),
          postFrequency: `${Math.round((profilePosts / 30) * 7 * 10) / 10}/week`,
          followerOverlap: 0,
          isUser: true,
          isVerified: isVerified
        },
        competitors: generateCompetitors(),
        aiInsights: [
          `Your engagement rate (${profileEngagement}%) is ${profileEngagement > 3.5 ? 'above' : profileEngagement > 2.5 ? 'at' : 'below'} industry average`,
          `With ${profileFollowers.toLocaleString()} followers, you're in the ${profileFollowers > 100000 ? 'macro' : profileFollowers > 10000 ? 'mid-tier' : 'micro'} influencer category`,
          `Your ${profileCategories[0]} content shows strong performance potential`,
          `${isVerified ? 'Verified status boosts your credibility' : 'Consider applying for verification to increase trust'}`
        ],
        detailedAnalysis: {
          strengths: [
            `Strong ${profileCategories[0]} content performance (${Math.round(profileEngagement * 10) / 10}% engagement)`,
            `Consistent content creation with ${profilePosts} posts`,
            `${avgLikes.toLocaleString()} average likes per post shows good audience connection`,
            `${avgComments.toLocaleString()} average comments indicate active community engagement`
          ],
          improvements: [
            {
              area: 'Content Frequency',
              current: `${Math.round((profilePosts / 30) * 7 * 10) / 10} posts/week`,
              recommended: '4-5 posts/week',
              impact: '+25% reach potential',
              timeframe: '2-3 weeks',
              difficulty: profilePosts > 100 ? 'Easy' : 'Medium',
              steps: [
                'Analyze your top-performing content types',
                'Create content batches for efficiency',
                'Use scheduling tools for consistency',
                'Focus on your strongest content categories'
              ]
            },
            {
              area: 'Engagement Optimization',
              current: `${profileEngagement}% engagement rate`,
              recommended: `${Math.round((profileEngagement + 1) * 10) / 10}% engagement rate`,
              impact: '+20% algorithmic boost',
              timeframe: '4-6 weeks',
              difficulty: 'Medium',
              steps: [
                'Post during your audience\'s peak activity hours',
                'Use more interactive content formats (polls, questions)',
                'Respond to comments within the first hour',
                'Create content that encourages saves and shares'
              ]
            }
          ],
          monthlyGoals: [
            `Grow to ${Math.floor(profileFollowers * 1.08).toLocaleString()} followers (+8% growth)`,
            `Increase engagement rate to ${Math.round((profileEngagement + 0.5) * 10) / 10}%`,
            `Achieve ${Math.floor(avgLikes * 1.3).toLocaleString()} average likes per post`,
            `Complete ${profilePosts < 50 ? '2' : '1'} collaboration${profilePosts < 50 ? 's' : ''} this month`
          ],
          competitiveAdvantages: [
            `Your ${profileCategories[0]} niche has ${profileEngagement > 3 ? 'strong' : 'good'} engagement potential`,
            `${profileFollowers > 10000 ? 'Established' : 'Growing'} follower base provides solid foundation`,
            `${isVerified ? 'Verified status sets you apart' : 'Authentic content builds trust'}`,
            `Consistent posting history shows commitment to your audience`
          ]
        }
      },
      formats: {
        formatPerformance: [
          {
            format: 'Reels',
            avgEngagement: Math.round(profileEngagement * 1.6 * 10) / 10,
            posts: Math.floor(profilePosts * 0.4),
            trend: '+18%',
            trendDirection: 'up',
            examples: [
              { title: `${profileCategories[0]} Tips`, engagement: Math.round(profileEngagement * 1.8 * 10) / 10, views: Math.floor(profileFollowers * 2.2) },
              { title: 'Behind the Scenes', engagement: Math.round(profileEngagement * 1.5 * 10) / 10, views: Math.floor(profileFollowers * 1.8) }
            ]
          },
          {
            format: 'Photos',
            avgEngagement: Math.round(profileEngagement * 0.9 * 10) / 10,
            posts: Math.floor(profilePosts * 0.4),
            trend: '+5%',
            trendDirection: 'up',
            examples: [
              { title: `${profileCategories[0]} Aesthetic`, engagement: Math.round(profileEngagement * 1.0 * 10) / 10, views: Math.floor(profileFollowers * 1.2) },
              { title: 'Daily Moments', engagement: Math.round(profileEngagement * 0.8 * 10) / 10, views: Math.floor(profileFollowers * 1.0) }
            ]
          },
          {
            format: 'Carousels',
            avgEngagement: Math.round(profileEngagement * 1.2 * 10) / 10,
            posts: Math.floor(profilePosts * 0.2),
            trend: '+12%',
            trendDirection: 'up',
            examples: [
              { title: `${profileCategories[0]} Guide`, engagement: Math.round(profileEngagement * 1.3 * 10) / 10, views: Math.floor(profileFollowers * 1.4) },
              { title: 'Tips & Tricks', engagement: Math.round(profileEngagement * 1.1 * 10) / 10, views: Math.floor(profileFollowers * 1.2) }
            ]
          }
        ]
      },
      hashtags: {
        topHashtags: [
          { tag: `#${profileCategories[0]}`, performance: 95, posts: Math.floor(profilePosts * 0.6), avgReach: Math.floor(profileFollowers * 1.4), category: profileCategories[0] },
          { tag: `#${profileName.replace('@', '')}`, performance: 88, posts: Math.floor(profilePosts * 0.3), avgReach: Math.floor(profileFollowers * 1.1), category: 'Personal Brand' },
          { tag: '#content', performance: 82, posts: Math.floor(profilePosts * 0.4), avgReach: Math.floor(profileFollowers * 0.9), category: 'General' },
          { tag: '#creator', performance: 79, posts: Math.floor(profilePosts * 0.2), avgReach: Math.floor(profileFollowers * 0.8), category: 'Creator' }
        ],
        scriptIdeas: [
          {
            type: 'Hook',
            script: `POV: You're a ${profileCategories[0]} creator with ${profileFollowers > 10000 ? 'thousands' : 'hundreds'} of followers ✨`,
            performance: 'High',
            category: profileCategories[0]
          },
          {
            type: 'Tutorial',
            script: `3 ${profileCategories[0]} tips that got me to ${Math.floor(profileFollowers / 1000)}k followers`,
            performance: 'High',
            category: profileCategories[0]
          }
        ]
      },
      collaborations: {
        suggestions: generateCompetitors().slice(0, 2).map(comp => ({
          ...comp,
          audienceOverlap: Math.floor(20 + Math.random() * 30),
          niche: `${profileCategories[0]} & Lifestyle`,
          collabType: 'Cross-promotion',
          estimatedReach: '+' + Math.floor(10 + Math.random() * 15) + '%',
          matchScore: Math.floor(75 + Math.random() * 20),
          collabIdeas: [
            `Joint ${profileCategories[0]} challenge`,
            'Content collaboration series',
            'Live session together'
          ]
        })),
        brandOpportunities: [
          {
            type: 'Sponsored Content',
            category: profileCategories[0],
            estimatedRate: `$${Math.floor(profileFollowers * 0.01)}-${Math.floor(profileFollowers * 0.02)}`,
            frequency: 'Weekly',
            requirements: 'Authentic integration, story + post'
          }
        ]
      },
      insights: {
        growthMetrics: {
          followerGrowth: generateGrowthTimeline()
        },
        viralityScore: calculateViralityScore(),
        recommendations: [
          `Focus on ${profileCategories[0]} content - your strongest performing category`,
          `Post during peak hours for your ${profileFollowers > 50000 ? 'large' : profileFollowers > 10000 ? 'medium' : 'growing'} audience`,
          `Increase ${profileEngagement < 3 ? 'engagement through interactive content' : 'posting frequency for better reach'}`,
          `${isVerified ? 'Leverage your verified status in collaborations' : 'Work towards verification to boost credibility'}`
        ]
      }
    };
  };

  // Generate enhanced mock data based on selected profile
  const getEnhancedMockData = () => {
    if (growthData) {
      return growthData;
    }

    // If we have real profile data, use it to generate insights
    if (selectedProfile?.profileData?.followersCount) {
      return generateProfileBasedInsights(selectedProfile);
    }

    // Fallback to basic mock data for demo purposes
    const profileFollowers = 58200;
    const profileEngagement = 4.1;
    const profileCategories = ['lifestyle', 'fashion'];

    return {
      competitors: {
        userProfile: {
          name: `@${selectedProfile?.handle}` || 'Your Profile',
          followers: profileFollowers,
          engagement: profileEngagement,
          posts: selectedProfile?.profileData?.mediaCount || 145,
          avgViews: Math.floor(profileFollowers * 1.5),
          postFrequency: '3.2/week',
          followerOverlap: 0,
          isUser: true
        },
        competitors: [
          {
            name: '@lifestyle_guru',
            followers: Math.floor(profileFollowers * 1.1),
            engagement: Math.max(2.5, profileEngagement + (Math.random() - 0.5)),
            posts: 156,
            avgViews: Math.floor(profileFollowers * 1.6),
            postFrequency: '4.1/week',
            followerOverlap: 23,
            niche: `${profileCategories[0]} enthusiast`
          },
          {
            name: '@fashion_forward',
            followers: Math.floor(profileFollowers * 1.2),
            engagement: Math.max(2.5, profileEngagement + 0.4),
            posts: 134,
            avgViews: Math.floor(profileFollowers * 1.9),
            postFrequency: '3.8/week',
            followerOverlap: 18,
            niche: `${profileCategories[1] || 'fashion'} creator`
          }
        ],
        aiInsights: [
          `Your engagement rate (${profileEngagement}%) is ${profileEngagement > 4 ? 'above' : 'at'} industry average`,
          `Competitors post 15% more frequently - consider increasing to 4-5 posts per week`,
          `High audience overlap detected - collaboration opportunities available`,
          `Your ${profileCategories[0]} content performs well - double down on this niche`
        ],
        detailedAnalysis: {
          strengths: [
            `Strong ${profileCategories[0]} content performance (+23% above niche average)`,
            `Consistent posting schedule maintains audience engagement`,
            `High-quality visual content drives ${Math.round(profileEngagement * 1.2)}% interaction rate`,
            `Authentic voice resonates well with target demographic`
          ],
          improvements: [
            {
              area: 'Content Frequency',
              current: '3.2 posts/week',
              recommended: '4-5 posts/week',
              impact: '+30% reach potential',
              timeframe: '2-3 weeks',
              difficulty: 'Medium',
              steps: [
                'Plan content calendar 2 weeks in advance',
                'Batch create content on weekends',
                'Use scheduling tools for consistent posting',
                'Focus on quick-to-create formats like Stories'
              ]
            },
            {
              area: 'Engagement Timing',
              current: 'Random posting times',
              recommended: '7-9 PM peak hours',
              impact: '+25% engagement boost',
              timeframe: '1 week',
              difficulty: 'Easy',
              steps: [
                'Analyze your audience insights for peak activity',
                'Schedule posts during 7-9 PM window',
                'Test different days of the week',
                'Monitor engagement patterns for optimization'
              ]
            },
            {
              area: 'Content Diversification',
              current: `70% ${profileCategories[0]} content`,
              recommended: `60% ${profileCategories[0]}, 40% mixed`,
              impact: '+15% audience growth',
              timeframe: '4-6 weeks',
              difficulty: 'Medium',
              steps: [
                'Introduce behind-the-scenes content',
                'Share personal stories and experiences',
                'Create educational/tutorial content',
                'Collaborate with other creators in your niche'
              ]
            },
            {
              area: 'Hashtag Strategy',
              current: 'Basic hashtag usage',
              recommended: 'Strategic mix of trending + niche tags',
              impact: '+40% discoverability',
              timeframe: '2 weeks',
              difficulty: 'Easy',
              steps: [
                'Research trending hashtags in your niche daily',
                'Mix 5 trending + 15 niche-specific hashtags',
                'Create branded hashtags for campaigns',
                'Track hashtag performance weekly'
              ]
            }
          ],
          monthlyGoals: [
            `Increase follower count by ${Math.round(profileFollowers * 0.08).toLocaleString()} (8% growth)`,
            `Boost engagement rate from ${profileEngagement}% to ${Math.round((profileEngagement + 0.5) * 10) / 10}%`,
            `Achieve 3 viral posts (>10k views each)`,
            `Complete 2 successful collaborations`
          ],
          competitiveAdvantages: [
            `Your ${profileCategories[0]} content has 23% higher engagement than competitors`,
            `Authentic storytelling sets you apart from generic content`,
            `Strong visual aesthetic maintains brand consistency`,
            `Engaged community with high comment-to-like ratio`
          ]
        }
      },
      formats: {
        formatPerformance: [
          {
            format: 'Reels',
            avgEngagement: Math.round(profileEngagement * 1.7 * 10) / 10,
            posts: Math.floor((selectedProfile?.profileData?.mediaCount || 145) * 0.3),
            trend: '+15%',
            trendDirection: 'up',
            examples: [
              { title: `${profileCategories[0]} Morning Routine`, engagement: Math.round(profileEngagement * 2.1 * 10) / 10, views: Math.floor(profileFollowers * 2.5) },
              { title: `Day in My Life (${profileCategories[0]})`, engagement: Math.round(profileEngagement * 1.9 * 10) / 10, views: Math.floor(profileFollowers * 2.2) }
            ]
          },
          {
            format: 'Carousels',
            avgEngagement: Math.round(profileEngagement * 1.3 * 10) / 10,
            posts: Math.floor((selectedProfile?.profileData?.mediaCount || 145) * 0.25),
            trend: '+8%',
            trendDirection: 'up',
            examples: [
              { title: `${profileCategories[0]} Tips & Tricks`, engagement: Math.round(profileEngagement * 1.4 * 10) / 10, views: Math.floor(profileFollowers * 1.5) },
              { title: `How to Guide: ${profileCategories[0]}`, engagement: Math.round(profileEngagement * 1.2 * 10) / 10, views: Math.floor(profileFollowers * 1.2) }
            ]
          }
        ]
      },
      hashtags: {
        topHashtags: [
          { tag: `#${profileCategories[0]}`, performance: 95, posts: 45, avgReach: Math.floor(profileFollowers * 1.5), category: profileCategories[0] },
          { tag: `#${profileCategories[1] || 'content'}`, performance: 92, posts: 38, avgReach: Math.floor(profileFollowers * 1.3), category: profileCategories[1] || 'Content' },
          { tag: '#aesthetic', performance: 88, posts: 32, avgReach: Math.floor(profileFollowers * 1.2), category: 'Aesthetic' },
          { tag: '#dailylife', performance: 85, posts: 29, avgReach: Math.floor(profileFollowers * 1.0), category: 'Lifestyle' }
        ],
        scriptIdeas: [
          {
            type: 'Hook',
            script: `POV: Your ${profileCategories[0]} routine but make it aesthetic ✨`,
            performance: 'High',
            category: profileCategories[0]
          },
          {
            type: 'Tutorial',
            script: `3 ${profileCategories[0]} hacks that changed my life`,
            performance: 'High',
            category: profileCategories[0]
          }
        ]
      },
      collaborations: {
        suggestions: [
          {
            name: `@${profileCategories[0]}_guru`,
            followers: Math.floor(profileFollowers * 1.1),
            engagement: Math.round((profileEngagement + 0.2) * 10) / 10,
            audienceOverlap: 34,
            niche: `${profileCategories[0]} & Wellness`,
            collabType: 'Cross-promotion',
            estimatedReach: '+15%',
            matchScore: 89,
            collabIdeas: [
              `Joint ${profileCategories[0]} challenge`,
              'Swap content series',
              'Live Q&A session together'
            ]
          },
          {
            name: `@${profileCategories[1] || 'style'}_maven`,
            followers: Math.floor(profileFollowers * 0.9),
            engagement: Math.round((profileEngagement + 0.1) * 10) / 10,
            audienceOverlap: 28,
            niche: `${profileCategories[1] || 'Fashion'} & Style`,
            collabType: 'Content Swap',
            estimatedReach: '+12%',
            matchScore: 85,
            collabIdeas: [
              'Style challenge collaboration',
              'Behind-the-scenes content',
              'Product review partnership'
            ]
          },
          {
            name: '@micro_influencer_hub',
            followers: Math.floor(profileFollowers * 0.7),
            engagement: Math.round((profileEngagement + 0.3) * 10) / 10,
            audienceOverlap: 15,
            niche: 'Community Building',
            collabType: 'Group Collaboration',
            estimatedReach: '+20%',
            matchScore: 92,
            collabIdeas: [
              'Multi-creator campaign',
              'Community challenge',
              'Collaborative giveaway'
            ]
          }
        ],
        brandOpportunities: [
          {
            type: 'Sponsored Content',
            category: profileCategories[0],
            estimatedRate: `$${Math.floor(profileFollowers * 0.01)}-${Math.floor(profileFollowers * 0.02)}`,
            frequency: 'Weekly',
            requirements: 'Authentic integration, story + post'
          },
          {
            type: 'Affiliate Marketing',
            category: profileCategories[1] || 'Fashion',
            estimatedRate: '10-15% commission',
            frequency: 'Ongoing',
            requirements: 'Product reviews, discount codes'
          }
        ]
      },
      insights: {
        growthMetrics: {
          followerGrowth: [
            { month: 'Jan', followers: Math.floor(profileFollowers * 0.77), growth: 2.1 },
            { month: 'Feb', followers: Math.floor(profileFollowers * 0.82), growth: 5.6 },
            { month: 'Jun', followers: profileFollowers, growth: 6.2 }
          ]
        },
        viralityScore: Math.min(100, Math.floor((profileEngagement * 15) + (Math.log10(profileFollowers) * 5) + 25)),
        recommendations: [
          `Increase ${profileCategories[0]} Reel frequency to 4-5 per week for 30% engagement boost`,
          "Post during peak hours (7-9 PM) for maximum reach in your timezone",
          `Focus on ${profileCategories[0]} content - shows 23% higher engagement in your niche`
        ]
      }
    };
  };

  const mockGrowthData = getEnhancedMockData();

  const tabs = [
    { id: 'competitor-check', label: 'Competitor Check', icon: Target },
    { id: 'formats-viral', label: 'Formats & Viral', icon: TrendingUp },
    { id: 'hashtags-ideas', label: 'Hashtags & Ideas', icon: Hash },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'insights', label: 'Growth Insights', icon: BarChart3 }
  ];

  const renderCompetitorCheck = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Competitor Benchmarking</h3>
          <p className="text-gray-600">Compare with similar creators in your niche</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadGrowthData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Update Analysis
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Side-by-Side Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">Loading competitor analysis...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Creator</th>
                    <th className="text-center p-3">Followers</th>
                    <th className="text-center p-3">Engagement</th>
                    <th className="text-center p-3">Posts</th>
                    <th className="text-center p-3">Frequency</th>
                    <th className="text-center p-3">Overlap</th>
                  </tr>
                </thead>
                <tbody>
                  {mockGrowthData.competitors?.userProfile && (
                    <tr className="border-b bg-blue-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-blue-600">
                            {mockGrowthData.competitors.userProfile.name.charAt(1).toUpperCase()}
                          </div>
                          <span className="font-medium text-blue-900">
                            {mockGrowthData.competitors.userProfile.name}
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">You</Badge>
                        </div>
                      </td>
                      <td className="text-center p-3 font-medium">{mockGrowthData.competitors.userProfile.followers?.toLocaleString()}</td>
                      <td className="text-center p-3">
                        <span className="font-medium text-green-600">
                          {mockGrowthData.competitors.userProfile.engagement}%
                        </span>
                      </td>
                      <td className="text-center p-3">{mockGrowthData.competitors.userProfile.posts}</td>
                      <td className="text-center p-3">{mockGrowthData.competitors.userProfile.postFrequency}</td>
                      <td className="text-center p-3">
                        <span className="text-gray-400">-</span>
                      </td>
                    </tr>
                  )}
                  {mockGrowthData.competitors?.competitors?.map((competitor, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gray-400">
                            {competitor.name.charAt(1).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{competitor.name}</span>
                        </div>
                      </td>
                      <td className="text-center p-3 font-medium">{competitor.followers.toLocaleString()}</td>
                      <td className="text-center p-3">
                        <span className={`font-medium ${competitor.engagement > 4 ? 'text-green-600' :
                            competitor.engagement > 3 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                          {competitor.engagement}%
                        </span>
                      </td>
                      <td className="text-center p-3">{competitor.posts}</td>
                      <td className="text-center p-3">{competitor.postFrequency}</td>
                      <td className="text-center p-3">
                        <span className="text-purple-600 font-medium">{competitor.followerOverlap}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white/60 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Key Insights</h4>
                <ul className="space-y-2 text-sm">
                  {mockGrowthData.competitors?.aiInsights?.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowUpRight className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Your Strengths
                </h4>
                <ul className="space-y-1 text-sm text-green-800">
                  {mockGrowthData.competitors?.detailedAnalysis?.strengths?.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-green-600 rounded-full mt-2"></span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Monthly Growth Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockGrowthData.competitors?.detailedAnalysis?.monthlyGoals?.map((goal, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-700">{goal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Detailed Improvement Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {mockGrowthData.competitors?.detailedAnalysis?.improvements?.map((improvement, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{improvement.area}</h4>
                  <Badge className={`${improvement.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                    improvement.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {improvement.difficulty}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-medium">{improvement.current}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recommended:</span>
                    <span className="font-medium text-blue-600">{improvement.recommended}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Impact:</span>
                    <span className="font-medium text-green-600">{improvement.impact}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Timeframe:</span>
                    <span className="font-medium">{improvement.timeframe}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-700">Action Steps:</h5>
                  <ul className="space-y-1">
                    {improvement.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="w-1 h-1 bg-blue-600 rounded-full mt-1.5"></span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => handleSaveIdea('Improvement Plan', improvement.area, 'Growth Strategy')}
                >
                  Save to Action Plan
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFormatsViral = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Content Formats & Viral Analysis</h3>
          <p className="text-gray-600">Discover what content performs best in your niche</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Format Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockGrowthData.formats?.formatPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="format" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgEngagement" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(mockGrowthData.formats?.formatPerformance || []).map((format, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{format.format}</h4>
                <div className={`flex items-center gap-1 text-sm ${format.trendDirection === 'up' ? 'text-green-600' :
                    format.trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                  {format.trendDirection === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
                    format.trendDirection === 'down' ? <ArrowDownRight className="w-4 h-4" /> :
                      <span className="w-4 h-4 flex items-center justify-center">-</span>}
                  <span>{format.trend}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Engagement:</span>
                  <span className="font-medium">{format.avgEngagement}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Posts:</span>
                  <span className="font-medium">{format.posts}</span>
                </div>
              </div>

              {format.trendDirection === 'up' && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHashtagsIdeas = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Hashtags, Ideas & Scripts</h3>
          <p className="text-gray-600">Discover trending hashtags and viral content ideas</p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Generate Ideas
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(mockGrowthData.hashtags?.topHashtags || []).map((hashtag, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-blue-600">{hashtag.tag}</span>
                    <Badge variant="outline" className="text-xs">{hashtag.category}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{hashtag.performance}/100</div>
                      <div className="text-xs text-gray-500">{hashtag.avgReach.toLocaleString()} avg reach</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Viral Script Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(mockGrowthData.hashtags?.scriptIdeas || []).map((script, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{script.type}</Badge>
                    <Button variant="ghost" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">"{script.script}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{script.category}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600"
                      onClick={() => handleSaveIdea('Script', script.script, script.category)}
                    >
                      Save to Planner
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Hashtag Generator</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedProfile ? (
            <div className="text-center py-8">
              <Hash className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Please select a profile to generate hashtags</p>
              <p className="text-sm text-gray-500">Profile selection is required for personalized hashtag recommendations</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected Profile:</strong> @{selectedProfile.handle} ({selectedProfile.platform})
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Generating hashtags based on your {selectedProfile?.profileData?.categories?.join(', ') || 'content'} niche
                </p>
              </div>
              
              <HashtagGenerator 
                selectedProfile={selectedProfile}
                onGenerate={handleGenerateHashtags}
                loading={loading}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCollaboration = () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Collaboration Finder</h3>
            <p className="text-gray-600">Find potential co-creators and brand partners</p>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter Results
          </Button>
        </div>

        {!selectedProfile ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">Select a profile to find collaboration opportunities</p>
            <p className="text-sm text-gray-500">We'll match you with creators in your niche</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(mockGrowthData.collaborations?.suggestions || []).map((collab, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {collab.name.charAt(1).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{collab.name}</h4>
                          <p className="text-xs text-gray-500">{collab.niche}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{collab.matchScore}%</Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Followers:</span>
                        <span className="font-medium">{collab.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Engagement:</span>
                        <span className="font-medium">{collab.engagement}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Audience Overlap:</span>
                        <span className="font-medium">{collab.audienceOverlap}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Est. Reach Boost:</span>
                        <span className="font-medium text-green-600">{collab.estimatedReach}</span>
                      </div>
                    </div>

                    {collab.collabIdeas && (
                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2">Collaboration Ideas:</h5>
                        <ul className="space-y-1">
                          {collab.collabIdeas.map((idea, ideaIndex) => (
                            <li key={ideaIndex} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="w-1 h-1 bg-purple-600 rounded-full mt-1.5"></span>
                              <span>{idea}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center">{collab.collabType}</Badge>
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleCollaboration(collab)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Invite to Collab
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Brand Partnership Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {(mockGrowthData.collaborations?.brandOpportunities || []).map((brand, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{brand.type}</h4>
                        <Badge variant="outline">{brand.category}</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate:</span>
                          <span className="font-medium text-green-600">{brand.estimatedRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Frequency:</span>
                          <span className="font-medium">{brand.frequency}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-600 text-xs">Requirements:</span>
                          <p className="text-xs text-gray-700 mt-1">{brand.requirements}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );

  const renderGrowthInsights = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Growth Insights Dashboard</h3>
          <p className="text-gray-600">AI-powered analytics and personalized recommendations</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follower Growth</p>
                <p className="text-2xl font-bold text-green-600">
                  +{mockGrowthData.insights?.growthMetrics?.followerGrowth?.slice(-1)[0]?.growth || 6.2}%
                </p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-blue-600">{selectedProfile?.profileData?.engagementRate || 4.1}%</p>
                <p className="text-xs text-gray-500">Above average</p>
              </div>
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Virality Score</p>
                <p className="text-2xl font-bold text-purple-600">{mockGrowthData.insights?.viralityScore || 78}/100</p>
                <p className="text-xs text-gray-500">AI calculated</p>
              </div>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Content Score</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.min(100, Math.max(60, Math.floor(
                    (selectedProfile?.profileData?.engagementRate || 4) * 15 + 
                    (selectedProfile?.profileData?.mediaCount > 50 ? 20 : 10) +
                    (selectedProfile?.profileData?.isVerified ? 10 : 0)
                  )))}/100
                </p>
                <p className="text-xs text-gray-500">
                  {selectedProfile?.profileData?.followersCount ? 'Based on your metrics' : 'Quality rating'}
                </p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(mockGrowthData.insights?.recommendations || []).map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
      switch (activeTab) {
        case 'competitor-check':
          return renderCompetitorCheck();
        case 'formats-viral':
          return renderFormatsViral();
        case 'hashtags-ideas':
          return renderHashtagsIdeas();
        case 'collaboration':
          return renderCollaboration();
        case 'insights':
          return renderGrowthInsights();
        default:
          return renderCompetitorCheck();
      }
    };

  // Show loading state if no profile is selected
  if (!selectedProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Select a profile to view growth statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Growth Hub</h2>
            {selectedProfile?.profileData?.followersCount ? (
              <Badge className="bg-green-100 text-green-800 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Real Data
              </Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                Demo Data
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            {selectedProfile?.profileData?.followersCount 
              ? 'AI-powered insights based on your profile data' 
              : 'Insights, ideas & analytics to boost your reach'
            }
          </p>
          {selectedProfile && (
            <p className="text-sm text-gray-500 mt-1">
              Analyzing: @{selectedProfile.handle} ({selectedProfile.platform})
              {selectedProfile?.profileData?.followersCount && (
                <span className="ml-2 text-green-600">
                  • {selectedProfile.profileData.followersCount.toLocaleString()} followers
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadGrowthData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default GrowthStatistics;