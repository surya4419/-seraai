import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import geminiService from '../services/geminiService';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star, 
  Download,
  Info,
  Coins,
  Banknote,
  CreditCard,
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Brain,
  Target,
  TrendingDown
} from 'lucide-react';

const RateCard = ({ profiles, selectedProfile }) => {
  const [rateCardData, setRateCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [apiRateCard, setApiRateCard] = useState(null);
  const [aiEnhancedCard, setAiEnhancedCard] = useState(null);
  const [marketInsights, setMarketInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('instagram');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);

  // Platform configurations with supported content types
  const platformConfigs = {
    instagram: {
      name: 'Instagram',
      icon: '📸',
      color: 'bg-gradient-to-r from-pink-500 to-purple-600',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      formats: [
        { key: 'post', name: 'Feed Post', desc: 'Single image/carousel' },
        { key: 'reel', name: 'Reel', desc: 'Short-form video' },
        { key: 'story', name: 'Story', desc: '24h temporary content' },
        { key: 'carousel', name: 'Carousel', desc: 'Multi-image post' }
      ],
      baseRates: { post: 30, reel: 45, story: 15, carousel: 35 }
    },
    youtube: {
      name: 'YouTube',
      icon: '🎥',
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      formats: [
        { key: 'video', name: 'Long Video', desc: 'Full-length content' },
        { key: 'short', name: 'YouTube Short', desc: 'Vertical short video' }
      ],
      baseRates: { video: 60, short: 35 }
    },
    tiktok: {
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-gradient-to-r from-gray-900 to-gray-700',
      textColor: 'text-gray-900',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      formats: [
        { key: 'video', name: 'TikTok Video', desc: 'Short-form vertical video' },
        { key: 'short', name: 'Quick Video', desc: 'Ultra-short content' }
      ],
      baseRates: { video: 36, short: 30 }
    },
    facebook: {
      name: 'Facebook',
      icon: '👥',
      color: 'bg-gradient-to-r from-blue-600 to-blue-700',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      formats: [
        { key: 'post', name: 'Feed Post', desc: 'Standard post content' },
        { key: 'reel', name: 'Facebook Reel', desc: 'Short-form video' },
        { key: 'story', name: 'Story', desc: '24h temporary content' }
      ],
      baseRates: { post: 25, reel: 40, story: 12 }
    }
  };

  // Niche multipliers based on market demand
  const nicheMultipliers = {
    beauty: 1.8,
    fashion: 1.6,
    tech: 1.5,
    finance: 1.7,
    fitness: 1.4,
    food: 1.3,
    travel: 1.5,
    lifestyle: 1.2,
    gaming: 1.3,
    education: 1.1,
    default: 1.0
  };

  // Geography-based audience value multipliers
  const audienceMultipliers = {
    'US': 1.5,
    'UK': 1.4,
    'Canada': 1.3,
    'Australia': 1.3,
    'Germany': 1.2,
    'France': 1.2,
    'default': 1.0
  };

  // Content complexity multipliers
  const contentMultipliers = {
    video: 1.4,
    reel: 1.3,
    carousel: 1.2,
    post: 1.0,
    story: 0.8,
    short: 1.1
  };

  useEffect(() => {
    if (selectedProfile) {
      fetchExistingRateCard(selectedProfile);
    }
  }, [selectedProfile]);

  const fetchExistingRateCard = async (profile) => {
    if (!profile._id) {
      // If no profile ID, generate local rate card
      generateRateCard(profile);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/rate-card/${profile._id}`);
      if (response.data.success) {
        setApiRateCard(response.data.rateCard);
        // Also generate local rate card for comparison
        generateRateCard(profile);
      } else {
        // No existing rate card, generate local one
        generateRateCard(profile);
      }
    } catch (error) {
      // No existing rate card or error, generate local one
      generateRateCard(profile);
    } finally {
      setLoading(false);
    }
  };

  const generateApiRateCard = async (profile) => {
    if (!profile._id) {
      toast.error('Profile ID required to generate AI rate card');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`/api/rate-card/generate/${profile._id}`);
      if (response.data.success) {
        setApiRateCard(response.data.rateCard);
        toast.success('AI rate card generated successfully!');
      } else {
        toast.error(response.data.error || 'Failed to generate AI rate card');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'AI service temporarily unavailable. Using local calculation.';
      toast.error(errorMessage);
      console.error('AI rate card generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateAiEnhancedRateCard = async (profile) => {
    if (!geminiService.isAvailable()) {
      toast.error('Gemini AI service is not available. Please check your API key.');
      return;
    }

    if (!rateCardData) {
      toast.error('Please generate a basic rate card first');
      return;
    }

    setAiGenerating(true);
    try {
      const result = await geminiService.generateEnhancedRateCard(
        profile.profileData || profile,
        rateCardData
      );
      
      if (result.success) {
        setAiEnhancedCard(result.data);
        setShowAiInsights(true);
        toast.success('AI-enhanced rate card generated!');
      }
    } catch (error) {
      toast.error(`AI enhancement failed: ${error.message}`);
      console.error('AI enhancement error:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const generateMarketInsights = async (profile) => {
    if (!geminiService.isAvailable()) {
      toast.error('Gemini AI service is not available');
      return;
    }

    try {
      const result = await geminiService.generateMarketInsights(
        profile.profileData || profile
      );
      
      if (result.success) {
        setMarketInsights(result.insights);
        toast.success('Market insights generated!');
      }
    } catch (error) {
      toast.error(`Market analysis failed: ${error.message}`);
      console.error('Market insights error:', error);
    }
  };

  const generateRateCard = (profile) => {
    setLoading(true);
    
    try {
      const rateCard = calculateRates(profile);
      setRateCardData(rateCard);
    } catch (error) {
      console.error('Error generating rate card:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRates = (profile) => {
    const profileData = profile.profileData || {};
    const F = profileData.followersCount || 0; // Follower count
    const E = (profileData.engagementRate || 0) / 100; // Engagement rate (convert from percentage)
    const I = profileData.avgViews30d || F * 0.1; // Impressions (estimate if not available)
    
    // Determine niche multiplier
    const N = getNicheMultiplier(profileData.biography, profileData.categories);
    
    // Determine audience value multiplier
    const A = getAudienceMultiplier(profileData.location, profileData.audienceDemographics);
    
    // Trust multiplier based on verification and consistency
    const T = getTrustMultiplier(profileData.isVerified, profileData.healthScore, profileData.consistency);
    
    const platformRates = [];
    
    // Generate rates for each platform
    Object.keys(platformConfigs).forEach(platformKey => {
      const platform = platformConfigs[platformKey];
      
      // Check if creator has this platform (for now, generate for all)
      platform.formats.forEach(format => {
        const C = contentMultipliers[format] || 1.0; // Content complexity multiplier
        const P_b = platform.baseRates[format]; // Platform base rate
        
        // Base formula: BasePrice = P_b * (F / 1000) * (E / 0.02) * N * A * C * T
        const basePrice = P_b * (F / 1000) * (E / 0.02) * N * A * C * T;
        
        // Generate three tiers
        const conservative = Math.round(basePrice * 0.8);
        const expected = Math.round(basePrice);
        const premium = Math.round(basePrice * 1.6);
        
        // Calculate confidence score
        const confidence = calculateConfidence(F, E, I, profileData);
        
        // Generate rationale
        const rationale = generateRationale(F, E, N, A, C, T, platform.name, format);
        
        platformRates.push({
          platform: platformKey,
          platformName: platform.name,
          format,
          conservative: Math.max(conservative, 10), // Minimum $10
          expected: Math.max(expected, 15), // Minimum $15
          premium: Math.max(premium, 25), // Minimum $25
          confidence,
          rationale,
          color: platform.color,
          icon: platform.icon
        });
      });
    });

    return {
      profileInfo: {
        handle: profile.handle,
        platform: profile.platform,
        followers: F,
        engagementRate: E * 100,
        niche: detectNiche(profileData.biography, profileData.categories),
        location: profileData.location || 'Global'
      },
      multipliers: { N, A, T },
      platformRates,
      overallConfidence: platformRates.reduce((sum, rate) => sum + rate.confidence, 0) / platformRates.length,
      generatedAt: new Date().toISOString()
    };
  };

  const getNicheMultiplier = (bio, categories) => {
    const text = `${bio || ''} ${(categories || []).join(' ')}`.toLowerCase();
    
    for (const [niche, multiplier] of Object.entries(nicheMultipliers)) {
      if (niche !== 'default' && text.includes(niche)) {
        return multiplier;
      }
    }
    
    return nicheMultipliers.default;
  };

  const getAudienceMultiplier = (location, demographics) => {
    // Check primary location
    if (location) {
      for (const [country, multiplier] of Object.entries(audienceMultipliers)) {
        if (country !== 'default' && location.toLowerCase().includes(country.toLowerCase())) {
          return multiplier;
        }
      }
    }
    
    // Check top audience locations
    if (demographics?.topLocations?.length > 0) {
      const topLocation = demographics.topLocations[0];
      for (const [country, multiplier] of Object.entries(audienceMultipliers)) {
        if (country !== 'default' && topLocation.toLowerCase().includes(country.toLowerCase())) {
          return multiplier * 0.8; // Slightly lower since it's audience location, not creator location
        }
      }
    }
    
    return audienceMultipliers.default;
  };

  const getTrustMultiplier = (isVerified, healthScore, consistency) => {
    let multiplier = 1.0;
    
    if (isVerified) multiplier += 0.2;
    if (healthScore > 80) multiplier += 0.15;
    else if (healthScore > 60) multiplier += 0.1;
    
    if (consistency === 'high' || consistency === 'excellent') multiplier += 0.1;
    
    return Math.min(multiplier, 1.5); // Cap at 1.5x
  };

  const calculateConfidence = (followers, engagementRate, impressions, profileData) => {
    let confidence = 0.5; // Base confidence
    
    // Follower count factor
    if (followers > 100000) confidence += 0.2;
    else if (followers > 10000) confidence += 0.15;
    else if (followers > 1000) confidence += 0.1;
    
    // Engagement rate factor
    if (engagementRate > 0.05) confidence += 0.15;
    else if (engagementRate > 0.02) confidence += 0.1;
    else if (engagementRate > 0.01) confidence += 0.05;
    
    // Data completeness factor
    if (impressions && impressions > 0) confidence += 0.1;
    if (profileData.recentPosts?.length >= 12) confidence += 0.1;
    else if (profileData.recentPosts?.length >= 6) confidence += 0.05;
    
    // Profile completeness factor
    if (profileData.biography && profileData.biography.length > 50) confidence += 0.05;
    if (profileData.isVerified) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  };

  const generateRationale = (followers, engagementRate, nicheMultiplier, audienceMultiplier, contentMultiplier, trustMultiplier, platform, format) => {
    const reasons = [];
    
    // Follower count rationale
    if (followers > 100000) {
      reasons.push(`Large ${followers.toLocaleString()} follower base`);
    } else if (followers > 10000) {
      reasons.push(`Strong ${followers.toLocaleString()} follower community`);
    } else {
      reasons.push(`Growing ${followers.toLocaleString()} follower base`);
    }
    
    // Engagement rationale
    const engagementPercent = (engagementRate * 100).toFixed(1);
    if (engagementRate > 0.06) {
      reasons.push(`Excellent ${engagementPercent}% engagement rate`);
    } else if (engagementRate > 0.03) {
      reasons.push(`Good ${engagementPercent}% engagement rate`);
    } else if (engagementRate > 0.01) {
      reasons.push(`${engagementPercent}% engagement rate`);
    }
    
    // Niche rationale
    if (nicheMultiplier > 1.4) {
      reasons.push('Premium niche with high brand value');
    } else if (nicheMultiplier > 1.2) {
      reasons.push('Specialized niche with good commercial appeal');
    }
    
    // Audience rationale
    if (audienceMultiplier > 1.3) {
      reasons.push('High-value audience demographics');
    } else if (audienceMultiplier > 1.1) {
      reasons.push('Good audience purchasing power');
    }
    
    // Content format rationale
    if (contentMultiplier > 1.3) {
      reasons.push(`${format} format offers high engagement potential`);
    } else if (contentMultiplier > 1.1) {
      reasons.push(`${format} content provides good brand integration`);
    }
    
    // Trust rationale
    if (trustMultiplier > 1.2) {
      reasons.push('Verified account with consistent brand history');
    } else if (trustMultiplier > 1.1) {
      reasons.push('Established creator with good reputation');
    }
    
    return reasons.slice(0, 3); // Return top 3 reasons
  };

  const detectNiche = (bio, categories) => {
    const text = `${bio || ''} ${(categories || []).join(' ')}`.toLowerCase();
    
    for (const niche of Object.keys(nicheMultipliers)) {
      if (niche !== 'default' && text.includes(niche)) {
        return niche.charAt(0).toUpperCase() + niche.slice(1);
      }
    }
    
    return 'Lifestyle';
  };

  const generateLocalRate = (platform, format, profile) => {
    if (!profile?.profileData) {
      return { conservative: 0, expected: 0, premium: 0, confidence: 0 };
    }

    const F = profile.profileData.followersCount || 0;
    const E = (profile.profileData.engagementRate || 0) / 100;
    const N = getNicheMultiplier(profile.profileData.biography, profile.profileData.categories);
    const A = getAudienceMultiplier(profile.profileData.location, profile.profileData.audienceDemographics);
    const C = contentMultipliers[format] || 1.0;
    const T = getTrustMultiplier(profile.profileData.isVerified, profile.profileData.healthScore, profile.profileData.consistency);
    const P_b = platform.baseRates[format] || 30;
    
    const basePrice = P_b * (F / 1000) * (E / 0.02) * N * A * C * T;
    
    return {
      conservative: Math.max(Math.round(basePrice * 0.8), 10),
      expected: Math.max(Math.round(basePrice), 15),
      premium: Math.max(Math.round(basePrice * 1.6), 25),
      confidence: calculateConfidence(F, E, 0, profile.profileData),
      rationale: generateRationale(F, E, N, A, C, T, platform.name, format)
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    if (confidence < 0.5) return 'Low Confidence — Manual Review Suggested';
    return 'Low Confidence';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!rateCardData && !apiRateCard) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Coins className="w-8 h-8 text-yellow-500" />
            Your Rate Card
          </h2>
          <p className="text-gray-600">AI-generated pricing based on your engagement metrics and market analysis</p>
        </div>
        
        <Card className="p-8 text-center">
          {loading ? (
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          ) : (
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          )}
          <p className="text-gray-600">
            {loading ? 'Loading rate card...' : 'No profile selected. Please analyze your profiles first to generate rate card.'}
          </p>
        </Card>
      </div>
    );
  }

  // Use API rate card if available, otherwise use local calculation
  const displayRateCard = apiRateCard || rateCardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <Coins className="w-6 h-6 text-white" />
            </div>
            Rate Card
            {apiRateCard && (
              <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600">
            {apiRateCard 
              ? 'AI-generated pricing with market intelligence' 
              : 'Smart pricing based on your metrics'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {selectedProfile?._id && (
            <Button
              onClick={() => generateApiRateCard(selectedProfile)}
              disabled={generating}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Backend AI</>
              )}
            </Button>
          )}
          
          {geminiService.isAvailable() && rateCardData && (
            <Button
              onClick={() => generateAiEnhancedRateCard(selectedProfile)}
              disabled={aiGenerating}
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {aiGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enhancing...</>
              ) : (
                <><Brain className="w-4 h-4 mr-2" /> Gemini AI</>
              )}
            </Button>
          )}
          
          {geminiService.isAvailable() && (
            <Button
              onClick={() => generateMarketInsights(selectedProfile)}
              disabled={aiGenerating}
              size="sm"
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Target className="w-4 h-4 mr-2" />
              Market Intel
            </Button>
          )}
        </div>
      </div>

      {/* Compact Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">@{displayRateCard.profileInfo?.handle || selectedProfile?.handle}</div>
                <div className="text-sm text-gray-500 capitalize">{selectedProfile?.platform}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Followers</div>
                <div className="font-bold text-blue-600">
                  {(displayRateCard.profileInfo?.followers || selectedProfile?.profileData?.followersCount || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Engagement</div>
                <div className="font-bold text-green-600">
                  {(displayRateCard.profileInfo?.engagementRate || selectedProfile?.profileData?.engagementRate || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Pricing Confidence</div>
                <div className="text-sm text-gray-500">Data quality score</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(displayRateCard.overallConfidence || 0.7)}`}>
                {((displayRateCard.overallConfidence || 0.7) * 100).toFixed(0)}% Confidence
              </div>
              <div className="text-sm text-gray-600">
                {displayRateCard.profileInfo?.niche || detectNiche(selectedProfile?.profileData?.biography, selectedProfile?.profileData?.categories)} • {displayRateCard.profileInfo?.location || selectedProfile?.profileData?.location || 'Global'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Platform Rates</CardTitle>
            <div className="flex gap-1">
              {Object.keys(platformConfigs).map(platformKey => {
                const platform = platformConfigs[platformKey];
                const isActive = activeTab === platformKey;
                return (
                  <button
                    key={platformKey}
                    onClick={() => setActiveTab(platformKey)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive 
                        ? `${platform.color} text-white shadow-sm` 
                        : `${platform.bgColor} ${platform.textColor} hover:shadow-sm`
                    }`}
                  >
                    <span className="text-sm">{platform.icon}</span>
                    {platform.name}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {Object.keys(platformConfigs).map(platformKey => {
            if (activeTab !== platformKey) return null;
            
            const platform = platformConfigs[platformKey];
            const platformRates = (displayRateCard.platformRates || []).filter(rate => rate.platform === platformKey);
            
            return (
              <div key={platformKey} className="space-y-4">
                {/* Content Format Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {platform.formats.map(format => {
                    const rate = platformRates.find(r => r.format === format.key) || 
                      generateLocalRate(platform, format.key, selectedProfile);
                    
                    // Check for AI-enhanced rates
                    const aiRate = aiEnhancedCard?.enhancedRates?.platformRates?.find(
                      r => r.platform === platformKey && r.format === format.key
                    );
                    
                    const displayRate = aiRate || rate;
                    const isAiEnhanced = !!aiRate;
                    
                    return (
                      <div key={format.key} className={`p-4 rounded-lg border-2 ${platform.borderColor} ${platform.bgColor} ${isAiEnhanced ? 'ring-2 ring-emerald-300' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {format.name}
                              {isAiEnhanced && (
                                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Brain className="w-3 h-3" />
                                  AI
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">{format.desc}</div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(displayRate.confidence || 0.7)}`}>
                            {((displayRate.confidence || 0.7) * 100).toFixed(0)}%
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-white rounded border">
                            <div className="text-xs text-gray-500 mb-1">Conservative</div>
                            <div className="font-bold text-gray-700 text-sm">{formatCurrency(displayRate.conservative || 0)}</div>
                            {isAiEnhanced && aiRate.aiAdjustment && (
                              <div className="text-xs text-emerald-600">
                                {aiRate.aiAdjustment > 1 ? '+' : ''}{((aiRate.aiAdjustment - 1) * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white rounded border-2 border-blue-200">
                            <div className="text-xs text-blue-600 mb-1">Expected</div>
                            <div className="font-bold text-blue-600 text-sm">{formatCurrency(displayRate.expected || 0)}</div>
                            {isAiEnhanced && aiRate.aiAdjustment && (
                              <div className="text-xs text-emerald-600">
                                {aiRate.aiAdjustment > 1 ? '+' : ''}{((aiRate.aiAdjustment - 1) * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                          <div className="p-2 bg-white rounded border">
                            <div className="text-xs text-gray-500 mb-1">Premium</div>
                            <div className="font-bold text-green-600 text-sm">{formatCurrency(displayRate.premium || 0)}</div>
                            {isAiEnhanced && aiRate.aiAdjustment && (
                              <div className="text-xs text-emerald-600">
                                {aiRate.aiAdjustment > 1 ? '+' : ''}{((aiRate.aiAdjustment - 1) * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* AI Market Factors */}
                        {isAiEnhanced && aiRate.marketFactors && (
                          <div className="mt-3 p-2 bg-emerald-50 rounded border border-emerald-200">
                            <div className="text-xs font-medium text-emerald-800 mb-1">AI Market Factors:</div>
                            <div className="text-xs text-emerald-700">
                              {aiRate.marketFactors.join(' • ')}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Rationale */}
                {(() => {
                  const aiRationale = aiEnhancedCard?.enhancedRates?.platformRates?.find(
                    r => r.platform === platformKey
                  )?.rationale;
                  const localRationale = platformRates.length > 0 ? platformRates[0].rationale : null;
                  const rationale = aiRationale || localRationale;
                  
                  if (!rationale) return null;
                  
                  return (
                    <div className={`p-3 rounded-lg border ${aiRationale ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-start gap-2">
                        {aiRationale ? (
                          <Brain className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className={`text-sm font-medium mb-1 ${aiRationale ? 'text-emerald-900' : 'text-blue-900'}`}>
                            {aiRationale ? 'AI Analysis:' : 'Why these rates?'}
                          </div>
                          <div className={`text-sm ${aiRationale ? 'text-emerald-800' : 'text-blue-800'}`}>
                            {Array.isArray(rationale) ? rationale.join(' • ') : rationale}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI Enhanced Insights */}
      {aiEnhancedCard && showAiInsights && (
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                Gemini AI Insights
                <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">
                  Confidence: {(aiEnhancedCard.confidenceScore * 100).toFixed(0)}%
                </span>
              </CardTitle>
              <Button
                onClick={() => setShowAiInsights(false)}
                size="sm"
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Market Intelligence */}
            {aiEnhancedCard.marketIntelligence && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Niche Analysis
                  </div>
                  <div className="text-sm space-y-1">
                    <div><span className="text-gray-600">Category:</span> <span className="font-medium">{aiEnhancedCard.marketIntelligence.nicheAnalysis?.category}</span></div>
                    <div><span className="text-gray-600">Demand:</span> <span className="font-medium capitalize">{aiEnhancedCard.marketIntelligence.nicheAnalysis?.marketDemand}</span></div>
                    <div><span className="text-gray-600">Market Rate:</span> <span className="font-medium">{aiEnhancedCard.marketIntelligence.nicheAnalysis?.competitiveRate}</span></div>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Audience Value
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="font-medium">{aiEnhancedCard.marketIntelligence.audienceValue?.demographics}</div>
                    <div><span className="text-gray-600">Purchasing Power:</span> <span className="font-medium capitalize">{aiEnhancedCard.marketIntelligence.audienceValue?.purchasingPower}</span></div>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Performance
                  </div>
                  <div className="text-sm space-y-1">
                    <div><span className="text-gray-600">Top Formats:</span> <span className="font-medium">{aiEnhancedCard.marketIntelligence.contentPerformance?.topFormats?.join(', ')}</span></div>
                    <div className="text-xs text-gray-600">{aiEnhancedCard.marketIntelligence.contentPerformance?.engagementTrends}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Recommendations */}
            {aiEnhancedCard.pricingStrategy && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Pricing Recommendations
                  </div>
                  <ul className="text-sm space-y-1">
                    {aiEnhancedCard.pricingStrategy.recommendations?.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-emerald-200">
                  <div className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Negotiation Tips
                  </div>
                  <ul className="text-sm space-y-1">
                    {aiEnhancedCard.pricingStrategy.negotiationTips?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Data Quality Assessment */}
            {aiEnhancedCard.dataQuality && (
              <div className="p-3 bg-white rounded-lg border border-emerald-200">
                <div className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Data Quality Assessment
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{(aiEnhancedCard.dataQuality.completeness * 100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-600">Completeness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{(aiEnhancedCard.dataQuality.recency * 100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-600">Recency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{(aiEnhancedCard.dataQuality.accuracy * 100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Factors: {aiEnhancedCard.dataQuality.factors?.join(' • ')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      {marketInsights && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              Market Intelligence
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Market Position */}
              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-800 mb-2">Market Position</div>
                <div className="text-sm space-y-1">
                  <div><span className="text-gray-600">Tier:</span> <span className="font-medium capitalize">{marketInsights.marketPosition?.tier}</span></div>
                  <div><span className="text-gray-600">Growth Potential:</span> <span className="font-medium capitalize">{marketInsights.marketPosition?.growthPotential}</span></div>
                </div>
              </div>
              
              {/* Industry Trends */}
              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-800 mb-2">Industry Trends</div>
                <div className="text-sm space-y-1">
                  <div className="font-medium">{marketInsights.industryTrends?.pricingTrends}</div>
                  <div className="text-xs text-gray-600">
                    {marketInsights.industryTrends?.contentTrends?.join(' • ')}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Opportunities & Threats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Opportunities
                </div>
                {marketInsights.opportunities?.map((opp, idx) => (
                  <div key={idx} className="text-sm mb-2">
                    <div className="font-medium">{opp.description}</div>
                    <div className="text-xs text-gray-600">Potential: {opp.potential} • Timeline: {opp.timeline}</div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-red-200">
                <div className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Threats
                </div>
                {marketInsights.threats?.map((threat, idx) => (
                  <div key={idx} className="text-sm mb-2">
                    <div className="font-medium">{threat.description}</div>
                    <div className="text-xs text-gray-600">Impact: {threat.impact} • Mitigation: {threat.mitigation}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compact Pricing Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-sm">Pricing Formula</span>
            </div>
            <div className="font-mono text-xs text-gray-700 bg-gray-50 p-2 rounded">
              P_b × (F÷1000) × (E÷0.02) × N × A × C × T
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Base rate × Followers × Engagement × Multipliers
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-sm">Key Multipliers</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Niche:</span>
                <span className="font-medium">{(displayRateCard.multipliers?.N || 1.0).toFixed(1)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Audience:</span>
                <span className="font-medium">{(displayRateCard.multipliers?.A || 1.0).toFixed(1)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Trust:</span>
                <span className="font-medium">{(displayRateCard.multipliers?.T || 1.0).toFixed(1)}x</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-sm">Pricing Tiers</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Conservative:</span>
                <span className="font-medium">Base × 0.8</span>
              </div>
              <div className="flex justify-between">
                <span>Expected:</span>
                <span className="font-medium text-blue-600">Base × 1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Premium:</span>
                <span className="font-medium">Base × 1.6</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button size="sm" variant="outline">
          <ExternalLink className="w-4 h-4 mr-2" />
          Share Link
        </Button>
        <Button size="sm" variant="outline">
          <Banknote className="w-4 h-4 mr-2" />
          Copy Rates
        </Button>
      </div>
    </div>
  );
};

export default RateCard;