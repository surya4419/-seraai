import { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown,
  Instagram,
  Youtube,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getProxiedImageUrl } from '../utils/imageProxy';

/**
 * Sample Match Selector Component
 * Swipe-like interface for selecting 5 reference creators
 * These creators are used to find similar matches for the campaign
 */
export default function SampleMatchSelector({ 
  candidates = [], 
  loading = false,
  onComplete,
  onUpdateFeedback
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [rejectedMatches, setRejectedMatches] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  const currentCreator = candidates[currentIndex];
  const requiredMatches = 5;
  const hasEnoughMatches = selectedMatches.length >= requiredMatches;

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleMatch = () => {
    if (!currentCreator) return;
    
    const newSelectedMatches = [...selectedMatches, currentCreator];
    setSelectedMatches(newSelectedMatches);
    
    // If we have enough matches, directly call onComplete to skip the summary page
    if (newSelectedMatches.length >= requiredMatches) {
      if (onComplete) {
        onComplete(newSelectedMatches);
      }
    } else if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more creators, show summary even if not enough matches
      setShowSummary(true);
    }
  };

  const handleNotMatch = () => {
    if (!currentCreator) return;
    
    setRejectedMatches([...rejectedMatches, currentCreator]);
    
    // Move to next creator
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more creators, show summary
      setShowSummary(true);
    }
  };

  const handleNext = () => {
    if (hasEnoughMatches && onComplete) {
      onComplete(selectedMatches);
    }
  };

  const handleUpdateFeedback = () => {
    setShowSummary(false);
    setCurrentIndex(0);
    setSelectedMatches([]);
    setRejectedMatches([]);
    if (onUpdateFeedback) {
      onUpdateFeedback();
    }
  };

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
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
        <p className="text-gray-600">Try adjusting your campaign criteria</p>
      </div>
    );
  }

  // Show summary after selection
  if (showSummary) {
    return (
      <div className="space-y-6">
        {/* Summary Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Selection Complete
              </h3>
              <p className="text-gray-600">
                {hasEnoughMatches 
                  ? `You've selected ${selectedMatches.length} creators. These will be used to find similar matches.`
                  : `You've selected ${selectedMatches.length} creators. We recommend selecting at least ${requiredMatches} for better results.`
                }
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {selectedMatches.length}/{requiredMatches}
              </div>
              <div className="text-sm text-gray-600">Matches</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                hasEnoughMatches ? 'bg-green-500' : 'bg-blue-600'
              }`}
              style={{ width: `${(selectedMatches.length / requiredMatches) * 100}%` }}
            />
          </div>
        </div>

        {/* Selected Matches Grid */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Your Selected Matches
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedMatches.map((creator, index) => (
              <div
                key={creator._id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={getProxiedImageUrl(creator.avatarUrl)}
                    alt={creator.platform_display_name || creator.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-gray-900 truncate">
                        {creator.platform_display_name || creator.displayName}
                      </h5>
                      <Badge variant="outline" className="capitalize flex-shrink-0 text-xs">
                        {getPlatformIcon(creator.target_platform)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      @{creator.platform_handle || creator.displayName?.toLowerCase().replace(/\s+/g, '')} • {creator.followers?.toLocaleString()} followers
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getScoreColor(creator.growth_adjusted_score)}`}>
                      <Award className="w-3 h-3 mr-1" />
                      {creator.growth_adjusted_score}/100
                    </div>
                  </div>
                  <div className="text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border border-gray-200">
          <Button
            variant="outline"
            onClick={handleUpdateFeedback}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Update Feedback
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasEnoughMatches}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {hasEnoughMatches ? (
              <>
                Next: Budget & Results
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Select {requiredMatches - selectedMatches.length} More
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Show current creator for selection
  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Preview Sample Matches
            </h3>
            
            {/* Simple Workflow */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <span className="font-medium">Review Profile</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Match or Skip</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Select 5 Creators</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-blue-600">Find Best Matches for Your Campaign</span>
            </div>
          </div>
          <div className="text-center ml-6">
            <div className="text-3xl font-bold text-blue-600">
              {selectedMatches.length}/{requiredMatches}
            </div>
            <div className="text-sm text-gray-600">Selected</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(selectedMatches.length / requiredMatches) * 100}%` }}
          />
        </div>

        {/* Counter */}
        <div className="mt-3 text-sm text-gray-600 text-center">
          Creator {currentIndex + 1} of {candidates.length}
        </div>
      </div>

      {/* Creator Card - Professional Design */}
      {currentCreator && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          {/* Creator Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <img
                src={getProxiedImageUrl(currentCreator.avatarUrl)}
                alt={currentCreator.platform_display_name || currentCreator.displayName}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />

              {/* Creator Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {currentCreator.platform_display_name || currentCreator.displayName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {getPlatformIcon(currentCreator.target_platform)}
                        <span className="ml-1">{currentCreator.target_platform}</span>
                      </Badge>
                      <span className="text-sm text-gray-600">
                        @{currentCreator.platform_handle || currentCreator.displayName?.toLowerCase().replace(/\s+/g, '')}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(currentCreator.growth_adjusted_score)}`}>
                    <Award className="w-4 h-4 inline mr-1" />
                    {currentCreator.growth_adjusted_score}/100
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900">
                      {currentCreator.followers?.toLocaleString()}
                    </span>
                    <span>followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900">
                      {(currentCreator.engagement_rate * 100).toFixed(2)}%
                    </span>
                    <span>engagement</span>
                  </div>
                  {currentCreator.avg_views && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">
                        {currentCreator.avg_views.toLocaleString()}
                      </span>
                      <span>avg views</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Creator Content */}
          <div className="p-6">
            {/* Bio */}
            {currentCreator.bio && (
              <div className="mb-4">
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                  {currentCreator.bio}
                </p>
              </div>
            )}

            {/* Topics */}
            {currentCreator.platform_metrics?.best_performing_topics && (
              <div className="mb-6">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Top Topics
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentCreator.platform_metrics.best_performing_topics.slice(0, 5).map((topic, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleNotMatch}
                variant="outline"
                size="lg"
                className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700"
              >
                <ThumbsDown className="w-5 h-5 mr-2" />
                Not a Match
              </Button>
              <Button
                onClick={handleMatch}
                size="lg"
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ThumbsUp className="w-5 h-5 mr-2" />
                Match
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
