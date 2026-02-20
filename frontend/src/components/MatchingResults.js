import { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Instagram,
  Youtube,
  ChevronDown,
  ChevronUp,
  Loader2,
  DollarSign
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getProxiedImageUrl } from '../utils/imageProxy';

/**
 * Matching Results Display Component
 * Shows platform-specific creator matches with scores and efficiency
 */
export default function MatchingResults({ 
  candidates = [], 
  platformBreakdown = {},
  loading = false,
  onViewProfile
}) {
  const [expandedCreator, setExpandedCreator] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRiskColor = (riskScore) => {
    if (riskScore <= 20) return 'text-green-600';
    if (riskScore <= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredCandidates = selectedPlatform === 'all' 
    ? candidates 
    : candidates.filter(c => c.target_platform === selectedPlatform);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
        <p className="text-gray-600">Finding perfect creator matches...</p>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
        <p className="text-gray-600">Try adjusting your campaign criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Breakdown Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Platform-Specific Matches
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Matches</div>
            <div className="text-3xl font-bold text-purple-600">{candidates.length}</div>
          </div>
          {Object.entries(platformBreakdown).map(([platform, data]) => (
            <div key={platform} className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getPlatformIcon(platform)}
                <span className="text-sm text-gray-600 capitalize">{platform}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{data.count}</div>
              <div className="text-xs text-gray-500 mt-1">
                Avg Score: {data.avg_score?.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Filter */}
      <div className="flex gap-2">
        <Button
          variant={selectedPlatform === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPlatform('all')}
        >
          All Platforms
        </Button>
        {Object.keys(platformBreakdown).map(platform => (
          <Button
            key={platform}
            variant={selectedPlatform === platform ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPlatform(platform)}
          >
            <span className="mr-2">{getPlatformIcon(platform)}</span>
            <span className="capitalize">{platform}</span>
          </Button>
        ))}
      </div>

      {/* Creator Cards */}
      <div className="space-y-4">
        {filteredCandidates.map((creator) => (
          <div
            key={creator._id}
            className="bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-all"
          >
            {/* Creator Header */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <img
                    src={getProxiedImageUrl(creator.avatarUrl)}
                    alt={creator.platform_display_name || creator.displayName}
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  {/* Creator Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {creator.platform_display_name || creator.displayName}
                      </h3>
                      <Badge variant="outline" className="capitalize">
                        {getPlatformIcon(creator.target_platform)}
                        <span className="ml-1">{creator.target_platform}</span>
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>@{creator.platform_handle || creator.displayName?.toLowerCase().replace(/\s+/g, '')}</span>
                      <span>•</span>
                      <span>{creator.followers?.toLocaleString()} followers</span>
                      <span>•</span>
                      <span>{(creator.engagement_rate * 100).toFixed(2)}% engagement</span>
                      {creator.avg_views && (
                        <>
                          <span>•</span>
                          <span>{creator.avg_views.toLocaleString()} avg views</span>
                        </>
                      )}
                    </div>

                    {/* Score Badges */}
                    <div className="flex flex-wrap gap-2">
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(creator.growth_adjusted_score)}`}>
                        <Award className="w-3 h-3 inline mr-1" />
                        Match: {creator.growth_adjusted_score}/100
                      </div>
                      {creator.efficiency_score && (
                        <div className="px-3 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-600 text-sm font-medium">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          Efficiency: {creator.efficiency_score.toFixed(2)}
                        </div>
                      )}
                      {creator.risk_profile && (
                        <div className={`px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-sm font-medium ${getRiskColor(creator.risk_profile.overall_risk_score)}`}>
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          Risk: {creator.risk_profile.overall_risk_score}/100
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {creator.negotiated_price && (
                    <div className="text-right mb-2">
                      <div className="text-sm text-gray-600">Estimated Price</div>
                      <div className="text-xl font-bold text-purple-600">
                        ₹{creator.negotiated_price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setExpandedCreator(
                      expandedCreator === creator._id ? null : creator._id
                    )}
                  >
                    {expandedCreator === creator._id ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Details
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCreator === creator._id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Score Breakdown */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Score Breakdown</h4>
                      <div className="space-y-2">
                        {creator.score_breakdown && Object.entries(creator.score_breakdown).map(([key, value]) => (
                          key !== 'platform' && (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 capitalize">
                                {key.replace('_', ' ')}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-600 rounded-full"
                                    style={{ width: `${value}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">
                                  {value}
                                </span>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>

                    {/* Platform Metrics */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Platform Metrics</h4>
                      <div className="space-y-2 text-sm">
                        {creator.platform_metrics && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Posting Frequency</span>
                              <span className="font-medium">
                                {creator.platform_metrics.posting_frequency || 0} posts/week
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Content Quality</span>
                              <span className="font-medium">
                                {creator.platform_metrics.content_quality_score || 70}/100
                              </span>
                            </div>
                            {creator.platform_metrics.best_performing_topics && (
                              <div>
                                <span className="text-gray-600">Top Topics</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {creator.platform_metrics.best_performing_topics.slice(0, 3).map((topic, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    {creator.pricing_breakdown && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-900 mb-3">Pricing Details</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base Price</span>
                            <span className="font-medium">
                              ₹{creator.pricing_breakdown.base?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {creator.pricing_breakdown.bulk_discount && (
                            <div className="flex justify-between text-green-600">
                              <span>Bulk Discount</span>
                              <span>-{creator.pricing_breakdown.bulk_discount}%</span>
                            </div>
                          )}
                          {creator.pricing_breakdown.relationship_discount && (
                            <div className="flex justify-between text-green-600">
                              <span>Relationship Discount</span>
                              <span>-{creator.pricing_breakdown.relationship_discount}%</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-gray-300 font-semibold">
                            <span>Final Price</span>
                            <span className="text-purple-600">
                              ₹{creator.pricing_breakdown.final_price?.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">
            {filteredCandidates.length} Creators Found
          </h4>
          <p className="text-sm text-gray-600">
            Platform-specific matching ensures optimal creator-campaign fit
          </p>
        </div>
      </div>
    </div>
  );
}
