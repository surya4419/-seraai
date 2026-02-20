/**
 * Nova AI Integration Component
 * Amazon Nova AI Hackathon 2026 - Agentic AI Category
 * 
 * This component demonstrates the integration of Amazon Nova Foundation Models
 * in the frontend for brand-creator matching and analytics.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, Brain, TrendingUp, Users, Target, Zap } from 'lucide-react';
import novaAIFrontendService from '../../services/novaAIFrontendService';

const NovaAIIntegration = ({ brandData, creatorData, campaignData }) => {
  const [compatibilityAnalysis, setCompatibilityAnalysis] = useState(null);
  const [campaignInsights, setCampaignInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [novaConfig, setNovaConfig] = useState(null);

  useEffect(() => {
    // Load Nova configuration on component mount
    const config = novaAIFrontendService.getNovaConfig();
    setNovaConfig(config);
  }, []);

  const handleCompatibilityAnalysis = async () => {
    if (!brandData || !creatorData) {
      setError('Brand and creator data are required for analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await novaAIFrontendService.analyzeCompatibility(brandData, creatorData);
      
      if (result.success) {
        setCompatibilityAnalysis(result.data.analysis);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to perform compatibility analysis');
      console.error('Compatibility analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignInsights = async () => {
    if (!campaignData) {
      setError('Campaign data is required for insights');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await novaAIFrontendService.generateCampaignInsights(campaignData);
      
      if (result.success) {
        setCampaignInsights(result.data.insights);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to generate campaign insights');
      console.error('Campaign insights error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Nova AI Header */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-orange-800">Amazon Nova AI Integration</CardTitle>
          </div>
          <CardDescription className="text-orange-700">
            Powered by Amazon Nova Foundation Models - Advanced Agentic AI for Brand-Creator Matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          {novaConfig && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                {novaConfig.hackathonCategory}
              </Badge>
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                {novaConfig.novaModel}
              </Badge>
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                Agentic AI
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Compatibility Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>Brand-Creator Compatibility Analysis</CardTitle>
            </div>
            <Button
              onClick={handleCompatibilityAnalysis}
              disabled={loading || !brandData || !creatorData}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Analyze Compatibility
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {compatibilityAnalysis && (
            <div className="space-y-4">
              {/* Overall Compatibility Score */}
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  <span className={getScoreColor(compatibilityAnalysis.compatibilityScore)}>
                    {compatibilityAnalysis.compatibilityScore}%
                  </span>
                </div>
                <Progress 
                  value={compatibilityAnalysis.compatibilityScore} 
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-2">Overall Compatibility Score</p>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Audience Alignment */}
                <Card className="bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      Audience Alignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getScoreBadgeVariant(compatibilityAnalysis.audienceAlignment?.score || 0)}>
                      {compatibilityAnalysis.audienceAlignment?.score || 0}%
                    </Badge>
                    <p className="text-xs text-gray-600 mt-2">
                      {compatibilityAnalysis.audienceAlignment?.demographics?.join(', ')}
                    </p>
                  </CardContent>
                </Card>

                {/* Value Alignment */}
                <Card className="bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Target className="h-4 w-4 mr-2 text-green-600" />
                      Value Alignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getScoreBadgeVariant(compatibilityAnalysis.valueAlignment?.score || 0)}>
                      {compatibilityAnalysis.valueAlignment?.score || 0}%
                    </Badge>
                    <p className="text-xs text-gray-600 mt-2">
                      {compatibilityAnalysis.valueAlignment?.matchedValues?.join(', ')}
                    </p>
                  </CardContent>
                </Card>

                {/* Content Compatibility */}
                <Card className="bg-purple-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-purple-600" />
                      Content Compatibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getScoreBadgeVariant(compatibilityAnalysis.contentCompatibility?.score || 0)}>
                      {compatibilityAnalysis.contentCompatibility?.score || 0}%
                    </Badge>
                    <p className="text-xs text-gray-600 mt-2">
                      {compatibilityAnalysis.contentCompatibility?.styleMatch}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Opportunities and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">Opportunities</h4>
                  <ul className="text-sm space-y-1">
                    {compatibilityAnalysis.opportunities?.map((opportunity, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-blue-700">Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    {compatibilityAnalysis.recommendations?.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Insights */}
      {campaignData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle>Campaign Insights</CardTitle>
              </div>
              <Button
                onClick={handleCampaignInsights}
                disabled={loading}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Generate Insights
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {campaignInsights && (
              <div className="space-y-4">
                {/* Performance Metrics */}
                {campaignInsights.performanceAnalysis && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(campaignInsights.performanceAnalysis).map(([key, value]) => (
                      <Card key={key} className="bg-gray-50">
                        <CardContent className="p-3 text-center">
                          <div className="text-lg font-bold text-gray-800">{value}</div>
                          <div className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {campaignInsights.recommendations && (
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-700">AI Recommendations</h4>
                    <ul className="text-sm space-y-2">
                      {campaignInsights.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start bg-orange-50 p-2 rounded">
                          <span className="text-orange-500 mr-2">💡</span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nova AI Footer */}
      <Card className="bg-gradient-to-r from-orange-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              🚀 Built for <strong>Amazon Nova AI Hackathon 2026</strong> - Agentic AI Category
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Powered by Amazon Nova Foundation Models • Advanced Reasoning • Multimodal Intelligence
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovaAIIntegration;