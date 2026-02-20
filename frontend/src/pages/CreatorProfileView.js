import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Users,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  Video,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  ExternalLink,
  Award,
  ThumbsUp,
  Share2,
  PlayCircle,
  Sparkles,
  Star,
  Activity,
  Package,
  FileText,
  MessageSquare,
  Info,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getProxiedImageUrl } from '../utils/imageProxy';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

const renderVideoPreview = (url) => {
  if (!url) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
        <AlertCircle className="w-8 h-8 mb-2 text-red-500" />
        <span className="text-sm font-medium">No Video URL available</span>
      </div>
    );
  }

  // FIXED: Ensure URL has protocol
  let videoUrl = url;
  if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
    videoUrl = 'https://' + videoUrl;
  }

  // YouTube (Standard, Short, Embed)
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    let videoId = null;
    
    // Handle shorts
    if (videoUrl.includes('shorts/')) {
      videoId = videoUrl.split('shorts/')[1]?.split('?')[0];
    } 
    // Handle standard watch URLs
    else if (videoUrl.includes('watch?v=')) {
      videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1];
    }
    // Handle youtu.be short URLs
    else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    }
    // Handle embed URLs
    else if (videoUrl.includes('youtube.com/embed/')) {
      videoId = videoUrl.split('embed/')[1]?.split('?')[0];
    }

    if (videoId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          title="Video Preview"
        />
      );
    }
  }

  // Vimeo
  if (videoUrl.includes('vimeo.com')) {
    const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          title="Vimeo Preview"
        />
      );
    }
  }

  // Instagram
  if (videoUrl.includes('instagram.com')) {
    // Ensure URL ends with /embed/ or add it
    let embedUrl = videoUrl;
    if (embedUrl.includes('?')) embedUrl = embedUrl.split('?')[0];
    // Remove trailing slash if present to normalize
    if (embedUrl.endsWith('/')) embedUrl = embedUrl.slice(0, -1);

    // Add /embed
    embedUrl += '/embed';

    return (
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full bg-white"
        allowFullScreen
        title="Instagram Preview"
      />
    );
  }

  // Direct File
  if (videoUrl.match(/\.(mp4|mov|webm)$/i)) {
    return <video src={videoUrl} controls className="absolute inset-0 w-full h-full object-contain bg-black" />;
  }

  // Fallback - show link to open externally
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
      <Video className="w-12 h-12 mb-2 text-gray-400" />
      <span className="text-xs mb-2">Preview not available</span>
      <a href={videoUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm z-20 flex items-center gap-2 hover:text-blue-800 bg-white/80 px-4 py-2 rounded-full shadow-sm">
        <ExternalLink className="w-4 h-4" />
        Open External Video Link
      </a>
    </div>
  );
};

const CreatorProfileView = ({ campaignId: propCampaignId, applicationId: propApplicationId, embedded = false }) => {
  const params = useParams();
  const campaignId = propCampaignId || params.campaignId;
  const applicationId = propApplicationId || params.applicationId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [creator, setCreator] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [collaborationHistory, setCollaborationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'content'
  const [feedbackValues, setFeedbackValues] = useState({}); // Map for feedback inputs by step/id

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/campaign-collaboration/${campaignId}/application/${applicationId}`);

      setApplication(response.data.application);
      console.log('CreatorProfileView: Fetched application', response.data.application);
      console.log('CreatorProfileView: Content field', response.data.application.content);
      setCreator(response.data.creator);

      // Get platform-specific data
      const platform = response.data.application.target_platform;
      const handle = response.data.creator.handles?.find(h => h.platform === platform);
      setPlatformData(handle?.profileData || {});

      // Set collaboration history if available
      if (response.data.creator.collaboration_history) {
        setCollaborationHistory(response.data.creator.collaboration_history.categories_worked || []);
      }

    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (!application || !creator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Creator profile not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const placementType = application.selected_placement?.type || 'N/A';
  const platform = application.target_platform;
  const metrics = application.placement_metrics || {};
  const costEstimation = platformData.costEstimation || {};

  // Get platform-specific metrics from creator profile
  const platformMetrics = creator?.platform_specific_metrics?.find(m => m.platform === platform) || {};

  // Get collaboration history
  const collabHistory = creator?.collaboration_history || {};

  // Format placement name
  const formatPlacementName = (type) => {
    const names = {
      reel: 'Instagram Reel',
      staticPost: 'Instagram Post',
      carousel: 'Instagram Carousel',
      story: 'Instagram Story',
      dedicatedVideo: 'YouTube Dedicated Video',
      integratedVideo: 'YouTube Integrated Video',
      shorts: 'YouTube Shorts',
      communityPost: 'YouTube Community Post'
    };
    return names[type] || type;
  };

  // Generate match summary
  const generateMatchSummary = () => {
    const reasons = [];

    if (application.match_score >= 80) {
      reasons.push('Excellent match score indicating strong alignment with campaign goals');
    } else if (application.match_score >= 60) {
      reasons.push('Good match score showing compatibility with campaign requirements');
    }

    const engagementRate = platformData.engagementRate || platformMetrics.engagement_rate || 0;
    if (engagementRate > 0) {
      const displayRate = engagementRate > 1 ? engagementRate : engagementRate * 100;
      reasons.push(`Strong engagement rate of ${displayRate.toFixed(2)}% ensures active audience interaction`);
    }

    if (collabHistory.completion_rate >= 0.8) {
      reasons.push(`Proven track record with ${(collabHistory.completion_rate * 100).toFixed(0)}% campaign completion rate`);
    }

    if (collabHistory.total_campaigns > 5) {
      reasons.push(`Experienced creator with ${collabHistory.total_campaigns} successful campaigns`);
    }

    const followers = platformData.followersCount || platformData.subscribersCount || platformMetrics.followers || 0;
    if (followers > 100000) {
      reasons.push(`Large audience reach with ${followers.toLocaleString()} followers`);
    } else if (followers > 10000) {
      reasons.push(`Growing audience with ${followers.toLocaleString()} engaged followers`);
    }

    if (platformData.isVerified) {
      reasons.push('Verified account adds credibility and trust');
    }

    const avgViews = platformData.avgViewsPerVideo || platformMetrics.avg_views || 0;
    if (avgViews > 50000) {
      reasons.push(`High visibility with average ${avgViews.toLocaleString()} views per post`);
    }

    if (reasons.length === 0) {
      reasons.push('This creator meets your campaign criteria and is available for collaboration');
    }

    return reasons;
  };

  // Calculate ROI metrics if not available
  const calculateROIMetrics = () => {
    // Map placement type to costEstimation key
    const placementToCostKey = {
      reel: 'reel',
      staticPost: 'post',
      carousel: 'carousel',
      story: 'story',
      dedicatedVideo: 'dedicatedVideo',
      integratedVideo: 'integratedVideo',
      shorts: 'shorts',
      communityPost: 'communityPost'
    };

    const costKey = placementToCostKey[placementType] || 'dedicatedVideo';

    // Try to get data from costEstimation object
    const predictedViewsData = costEstimation.predictedViews?.[costKey];
    const predictedClicksData = costEstimation.predictedClicks?.[costKey];
    const cpmData = costEstimation.cpm?.[costKey];
    const cpcData = costEstimation.cpc?.[costKey];
    const roiData = costEstimation.roiMetrics?.[costKey];

    // Get views from multiple sources
    const avgViews = predictedViewsData?.predicted ||
      metrics.avg_views ||
      metrics.predicted_views ||
      platformData.avgViewsPerVideo ||
      platformMetrics.avg_views || 0;

    const cost = metrics.cost || application.proposedRate || 0;
    const engagementRate = platformData.engagementRate || platformMetrics.engagement_rate || 0;
    const displayEngagementRate = engagementRate > 1 ? engagementRate / 100 : engagementRate;

    // Use predicted clicks if available, otherwise calculate
    const expectedClicks = predictedClicksData?.predicted ||
      Math.round(avgViews * ((metrics.ctr || cpmData?.ctr || 2.0) / 100));

    // Use CPC if available, otherwise calculate
    const costPerClick = cpcData?.cpc || (expectedClicks > 0 ? cost / expectedClicks : 0);

    // Calculate total engagements (likes + comments + shares)
    const totalEngagements = Math.round(avgViews * displayEngagementRate);

    // Cost per engagement - use from roiData if available, otherwise calculate
    const costPerEngagement = roiData?.costPerEngagement ||
      (totalEngagements > 0 ? cost / totalEngagements : 0);

    return {
      expectedClicks: expectedClicks || 0,
      costPerClick: costPerClick || 0,
      costPerEngagement: costPerEngagement || 0,
      totalEngagements: totalEngagements || 0,
      avgViews: avgViews,
      cpm: cpmData?.cpm || 0,
      ctr: cpmData?.ctr || metrics.ctr || 2.0
    };
  };

  const roiMetrics = calculateROIMetrics();

  const handleContentStatusUpdate = async (type, status) => {
    try {
      if (type === 'script') {
        const feedback = feedbackValues['script'] || '';
        await axios.post(`/api/campaign-collaboration/${campaignId}/content/${applicationId}/script/status`, {
          status,
          feedback
        });
        toast.success(`Script ${status === 'approved' ? 'approved' : 'returned for changes'}`);
        setFeedbackValues(prev => ({ ...prev, script: '' }));
      }
      fetchApplicationDetails(); // Refresh
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleVideoFeedback = async (draftVersion) => {
    try {
      const feedback = feedbackValues[`draft_${draftVersion}`] || '';
      await axios.post(`/api/campaign-collaboration/${campaignId}/content/${applicationId}/video/feedback`, {
        draftVersion,
        feedback
      });
      toast.success('Feedback sent for video draft');
      setFeedbackValues(prev => ({ ...prev, [`draft_${draftVersion}`]: '' }));
      fetchApplicationDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to send feedback');
    }
  };

  const handleVideoApprove = async (draftVersion) => {
    try {
      await axios.post(`/api/campaign-collaboration/${campaignId}/content/${applicationId}/video/approve`, {
        draftVersion
      });
      toast.success('Video draft approved and marked as final!');
      fetchApplicationDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to approve video');
    }
  };

  return (
    <div className={embedded ? "bg-gradient-to-br from-blue-50 via-white to-indigo-50" : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"}>
      {/* Header - only show if not embedded */}
      {!embedded && (
        <div className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-blue-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Creator Profile</h1>
                  <p className="text-sm text-gray-500">Detailed collaboration information</p>
                </div>
              </div>



              <div className="flex items-center gap-3">
                <Badge className={`${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {application.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* NEW HEADER LAYOUT: Profile Card at Top */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="shrink-0 mx-auto md:mx-0">
              {platformData.profilePictureUrl || creator.avatarUrl ? (
                <img
                  src={getProxiedImageUrl(platformData.profilePictureUrl || creator.avatarUrl)}
                  alt={platformData.fullName || platformData.channelName || creator.displayName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                  {(platformData.fullName || platformData.channelName || creator.displayName)?.charAt(0) || 'C'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {platformData.fullName || platformData.channelName || creator.displayName || platformData.username}
                </h2>
                {platformData.isVerified && (
                  <Badge className="bg-blue-100 text-blue-800 w-fit mx-auto md:mx-0 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </Badge>
                )}
                <Badge className={`${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  } w-fit mx-auto md:mx-0`}>
                  {application.status === 'pending_confirmation' ? 'Pending Confirmation' : application.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  {platform === 'instagram' ? <div className="w-4 h-4 rounded-full bg-pink-500" /> : <div className="w-4 h-4 rounded-full bg-red-600" />}
                  <span className="capitalize">{platform}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="capitalize">{formatPlacementName(placementType)}</span>
                </div>
                {/* Dynamic Tags/Niche if available */}
                {creator.niche && creator.niche.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span>{creator.niche[0]}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>{creator.language || 'English'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {application.status === 'accepted' || application.status === 'pending_confirmation' ? (
                  <>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={async () => {
                        try {
                          await axios.post(`/api/campaign-collaboration/${campaignId}/confirm/${applicationId}`);
                          toast.success('Collaboration confirmed!');
                          fetchApplicationDetails();
                        } catch (error) {
                          toast.error('Failed to confirm');
                        }
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to remove this creator?')) {
                          try {
                            await axios.post(`/api/campaign-collaboration/${campaignId}/reject/${applicationId}`, { reason: 'Removed by brand' });
                            toast.success('Creator removed');
                            navigate(-1);
                          } catch (error) {
                            toast.error('Failed to remove');
                          }
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </>
                ) : null}

                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600"
                  onClick={() => toast.info('Timeline postponed (mock)')}
                >
                  Postpone the timeline
                </Button>
              </div>
            </div>

            {/* Right Side Stats in Header (Optional - to match 'Aha' dense header) */}
            <div className="hidden lg:block text-right space-y-2">
              <span className="text-xs text-gray-500 block">Match Score</span>
              <div className="text-3xl font-bold text-gray-900">{application.match_score || 0}</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-8 mb-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'overview'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === 'content'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Content Delivery
          </button>
        </div>





        {/* TAB CONTENT: Content Delivery */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Timeline Status */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Delivery Timeline</h3>
                <Button variant="outline" size="sm" onClick={() => toast.info('Timeline postponement request sent to creator')}>
                  Postpone Timeline
                </Button>
              </div>
              <div className="relative">
                {(() => {
                  const content = application.content || {};
                  const script = content.script || {};
                  const video = content.video || {};
                  const scriptVersions = script.versions || [];
                  const drafts = video.drafts || [];

                  // Generate Dynamic Steps
                  const steps = [];

                  // Script History
                  // Always show at least 'Script' if no versions, or if there are versions, show them potentially with 'Script V X'
                  if (scriptVersions.length > 0) {
                    scriptVersions.forEach(v => steps.push(`Script V${v.version}`));
                    // If current status is PENDING and version is newer than latest in array?
                    // My backend pushes immediately. So array should be up to date.
                  } else {
                    steps.push('Script');
                  }

                  // Video History
                  if (drafts.length > 0) {
                    drafts.forEach(d => steps.push(`Video Draft ${d.version}`));
                  } else {
                    steps.push('Video Draft 1');
                  }

                  steps.push('Final_Video_Step');

                  return steps.map((step, idx) => {
                    let isActive = false;
                    let isCompleted = false;
                    let detailCard = null;

                    // --- SCRIPT RENDERING ---
                    if (step.startsWith('Script')) {
                      // Resolve Version
                      let versionData = script; // Default to top-level
                      const verMatch = step.match(/Script V(\d+)/);
                      let isLatest = true;

                      if (verMatch) {
                        const verNum = parseInt(verMatch[1]);
                        versionData = scriptVersions.find(v => v.version === verNum) || script;
                        isLatest = (verNum === (scriptVersions.length || 1));
                      } else {
                        // 'Script' fallback -> Is latest if no versions array or empty
                        isLatest = true;
                      }

                      // Status Logic
                      // If it's a past version (not latest), it is effectively 'completed' (history)
                      if (!isLatest) {
                        isCompleted = true; // Historical items are done
                        isActive = false;
                      } else {
                        // Latest Item Logic
                        isCompleted = script.status === 'approved' || script.status === 'skipped';
                        isActive = !isCompleted; // If not approved/skipped, it's active (pending/submitted/changes_requested)
                      }

                      const showDetails = isActive || (isLatest && script.status === 'submitted'); // Show by default if active

                      if (showDetails || versionData.status === 'approved' || versionData.status === 'changes_requested') {
                        detailCard = (
                          <div className="mt-3 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <Badge className={
                                  versionData.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    versionData.status === 'changes_requested' ? 'bg-orange-100 text-orange-800' :
                                      'bg-blue-100 text-blue-800'
                                }>
                                  {versionData.status === 'submitted' ? 'Under Review' : versionData.status?.replace('_', ' ')}
                                </Badge>
                                {versionData.submittedAt && (
                                  <p className="text-xs text-gray-500 mt-2">Submitted on {new Date(versionData.submittedAt).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>

                            <div className="mb-4">
                              <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Script Content</h5>
                              <div className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-100 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                {versionData.text || 'No text content.'}
                              </div>
                            </div>

                            {/* Feedback Display */}
                            {versionData.feedback && (
                              <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                <p className="text-xs font-bold text-orange-800 mb-1">Feedback:</p>
                                <p className="text-sm text-gray-700">{versionData.feedback}</p>
                              </div>
                            )}

                            {/* Actions - Only for Latest Version and if Submitted */}
                            {isLatest && script.status === 'submitted' && (
                              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-900">Review Action</p>
                                
                                {/* FIXED: Check if max revisions reached (version 4 = 3 brand revisions) */}
                                {script.currentVersion >= 4 ? (
                                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-2">
                                    <p className="text-xs font-bold text-red-800 mb-1">Maximum Revisions Reached</p>
                                    <p className="text-xs text-red-600">You have already requested 3 changes. Please approve this version or reject the collaboration.</p>
                                  </div>
                                ) : null}
                                
                                <div className="flex gap-2">
                                  <input
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={script.currentVersion >= 4 ? "Max revisions reached" : "Enter feedback..."}
                                    value={feedbackValues['script'] || ''}
                                    onChange={(e) => setFeedbackValues(prev => ({ ...prev, script: e.target.value }))}
                                    disabled={script.currentVersion >= 4}
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={() => handleContentStatusUpdate('script', 'changes_requested')}
                                    disabled={!feedbackValues['script'] || script.currentVersion >= 4}
                                  >
                                    Request Changes
                                  </Button>
                                  <Button
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={() => handleContentStatusUpdate('script', 'approved')}
                                  >
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                    }
                    // --- VIDEO RENDERING ---
                    else if (step.startsWith('Video Draft')) {
                      // Resolve Version
                      let draft = null;
                      const verMatch = step.match(/Video Draft (\d+)/);
                      let isLatest = true;

                      if (verMatch) {
                        const vNum = parseInt(verMatch[1]);
                        draft = drafts.find(d => d.version === vNum);
                        isLatest = (vNum === (drafts.length || 1));
                      } else {
                        draft = drafts[0]; // Fallback
                      }

                      // Logic
                      if (draft) {
                        isCompleted = draft.status === 'approved';
                        // If draft is older, it's completed history effectively unless it's waiting? No, old drafts are replaced.
                        if (!isLatest) isCompleted = true;

                        isActive = isLatest && !isCompleted;
                        if (script.status !== 'approved' && script.status !== 'skipped') isActive = false; // Blocked by script

                        detailCard = (
                          <div className="mt-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            {/* Smart Video Player */}
                            <div className="aspect-video bg-black relative group flex items-center justify-center max-w-[50%] rounded-lg overflow-hidden">
                              {renderVideoPreview(draft.url)}
                              <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-mono">
                                DRAFT_V{draft.version}
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <Badge className={
                                  draft.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    draft.status === 'changes_requested' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                }>
                                  {draft.status === 'pending_review' ? 'Under Review' : draft.status?.replace('_', ' ')}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-2">Submitted on {new Date(draft.submittedAt).toLocaleDateString()}</p>
                              </div>

                              {draft.feedback && (
                                <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                  <p className="text-xs font-bold text-orange-800 mb-1">Feedback:</p>
                                  <p className="text-sm text-gray-700">{draft.feedback}</p>
                                </div>
                              )}

                              {isLatest && (draft.status === 'pending_review' || draft.status === 'draft_submitted') && (
                                <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
                                  <p className="text-sm font-medium text-gray-900">Review Action</p>

                                  {/* Approve Button always visible if not max revisions or if max revisions reached */}
                                  <Button
                                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={() => handleVideoApprove(draft.version)}
                                  >
                                    Approve {draft.version >= 4 ? '(Final Video)' : ''}
                                  </Button>

                                  {/* Feedback Section */}
                                  {draft.version < 4 ? (
                                    <>
                                      {!feedbackValues[`show_input_${draft.version}`] ? (
                                        <Button
                                          variant="outline"
                                          className="w-full"
                                          onClick={() => setFeedbackValues(prev => ({ ...prev, [`show_input_${draft.version}`]: true }))}
                                        >
                                          Provide Feedback / Request Changes
                                        </Button>
                                      ) : (
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2 animate-in fade-in zoom-in-95 duration-200">
                                          <textarea
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] mb-2"
                                            placeholder="Describe changes needed..."
                                            value={feedbackValues[`draft_${draft.version}`] || ''}
                                            onChange={(e) => setFeedbackValues(prev => ({ ...prev, [`draft_${draft.version}`]: e.target.value }))}
                                          />
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                                              onClick={() => handleVideoFeedback(draft.version)}
                                              disabled={!feedbackValues[`draft_${draft.version}`]}
                                            >
                                              Send Feedback
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => setFeedbackValues(prev => ({ ...prev, [`show_input_${draft.version}`]: false }))}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-center p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                                      Max Revisions Reached (Draft 4 is Final). Please Approve.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    }
                    // --- FINAL VIDEO / LINK ---
                    else if (step === 'Final_Video_Step') {
                      isCompleted = application.status === 'completed' || application.status === 'paid' || application.status === 'published' || application.status === 'final_link_submitted';

                      // Check for Approved Video
                      const approvedDraft = application.content?.video?.drafts?.find(d => d.status === 'approved');
                      const isVideoApproved = application.content?.video?.status === 'approved' || video.status === 'approved' || !!approvedDraft;
                      
                      // FIXED: Final link is ONLY from creator's submission, NOT from approved draft
                      const hasFinalLink = !!(application.content?.finalLink?.url);
                      const finalPublishedUrl = application.content?.finalLink?.url; // Only use submitted final link
                      
                      // Only active if video is approved (to show waiting state)
                      isActive = isVideoApproved;

                      detailCard = (
                        <div className="mt-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-5">
                          {/* FIXED: Only show final video preview if creator has submitted the final link */}
                          {isVideoApproved && hasFinalLink && finalPublishedUrl ? (
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-3">
                                <Video className="w-4 h-4 text-gray-700" />
                                <h5 className="font-bold text-gray-900 text-sm">Final Published Video</h5>
                              </div>
                              <div className="aspect-video bg-black relative group flex items-center justify-center max-w-[50%] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                {renderVideoPreview(finalPublishedUrl)}
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded font-bold shadow-sm z-10">
                                  PUBLISHED CONTENT
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {/* Final Link Section - Show if video approved and link submitted */}
                          {isVideoApproved && hasFinalLink ? (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                  <LinkIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-900 text-sm">Final Published Link</h5>
                                  <p className="text-xs text-gray-500">
                                    {application.content?.finalLink?.submittedAt
                                      ? `Submitted on ${new Date(application.content.finalLink.submittedAt).toLocaleDateString()}`
                                      : 'Link available'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={finalPublishedUrl?.startsWith('http') ? finalPublishedUrl : `https://${finalPublishedUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full"
                                >
                                  <Button variant="outline" className="w-full bg-white hover:bg-gray-50 text-green-700 border-green-200">
                                    <Globe className="w-4 h-4 mr-2" /> Open Published Link
                                  </Button>
                                </a>
                              </div>
                            </div>
                          ) : isVideoApproved && !hasFinalLink ? (
                            // Show waiting message if video is approved but link not submitted yet
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                              <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center text-blue-500 mb-3 shadow-sm">
                                <Clock className="w-6 h-6" />
                              </div>
                              <h5 className="text-sm font-medium text-gray-900 mb-1">Waiting for Final Published Link</h5>
                              <p className="text-xs text-gray-500">Video draft approved! Creator will submit the final published link once the video is live on their platform.</p>
                            </div>
                          ) : (
                            // Video not approved yet
                            <div className="mt-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
                              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                                <Video className="w-6 h-6" />
                              </div>
                              <h5 className="text-sm font-medium text-gray-900 mb-1">Video Approval Pending</h5>
                              <p className="text-xs text-gray-500">Final link will be available after video draft is approved.</p>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Future Step
                      isActive = false;
                    }


                    return (
                      <div key={idx} className="flex items-start gap-4 mb-8 last:mb-0 relative min-h-[40px]">
                        {/* Vertical Line */}
                        {idx !== steps.length - 1 && <div className="absolute left-[15px] top-8 bottom-[-40px] w-0.5 bg-gray-100"></div>}

                        {/* Circle */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm border-2 ${isCompleted ? 'bg-green-50 border-green-500 text-green-700' :
                          isActive ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200' :
                            'bg-white border-gray-200 text-gray-400'
                          }`}>
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>

                        <div className="pt-1 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>{step === 'Final_Video_Step' ? 'Final Video' : step}</h4>
                              <p className="text-xs text-gray-500">
                                {step.startsWith('Script') ? 'Review creator script' : step === 'Final_Video_Step' ? 'Ready for publishing' : 'Draft review'}
                              </p>
                            </div>
                          </div>


                          {/* THE DETAIL CARD */}
                          <div className="animate-in slide-in-from-top-2 duration-300">
                            {detailCard}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div >
        )}

        {
          activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {/* Left Column - Creator Info */}
              <div className="lg:col-span-1 space-y-6">

                {/* Quick Stats */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Quick Stats
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Followers</span>
                      </div>
                      <span className="font-bold text-blue-900">
                        {(platformData.followersCount || platformData.subscribersCount || platformMetrics.followers || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Video className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium">Total {platform === 'youtube' ? 'Videos' : 'Posts'}</span>
                      </div>
                      <span className="font-bold text-indigo-900">
                        {(platformData.mediaCount || platformData.videoCount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Eye className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Avg Views</span>
                      </div>
                      <span className="font-bold text-purple-900">
                        {(platformData.avgViewsPerVideo || platformMetrics.avg_views || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-700">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Engagement Rate</span>
                      </div>
                      <span className="font-bold text-green-900">
                        {(() => {
                          const rate = platformData.engagementRate || platformMetrics.engagement_rate || 0;
                          const displayRate = rate > 1 ? rate : rate * 100;
                          return displayRate > 0 ? `${displayRate.toFixed(2)}%` : 'N/A';
                        })()}
                      </span>
                    </div>

                    {platform === 'youtube' && platformData.totalViews && (
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-700">
                          <PlayCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium">Total Views</span>
                        </div>
                        <span className="font-bold text-red-900">
                          {platformData.totalViews.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Collaboration History */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Collaboration History
                  </h3>

                  {collabHistory.total_campaigns > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Campaigns</span>
                        <span className="font-semibold text-gray-900">{collabHistory.total_campaigns}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completion Rate</span>
                        <span className="font-semibold text-green-600">
                          {(collabHistory.completion_rate * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reliability Score</span>
                        <span className="font-semibold text-blue-600">{collabHistory.reliability_score}/100</span>
                      </div>

                      {collabHistory.categories_worked && collabHistory.categories_worked.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600 mb-2">Worked With</p>
                          <div className="flex flex-wrap gap-2">
                            {collabHistory.categories_worked.slice(0, 5).map((cat, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-700 text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No collaboration history available</p>
                      <p className="text-xs text-gray-400 mt-1">This could be a new creator</p>
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Content Information</h3>

                  <div className="space-y-4">
                    {platformData.contentCategories && platformData.contentCategories.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Content Categories</p>
                        <div className="flex flex-wrap gap-2">
                          {platformData.contentCategories.slice(0, 5).map((cat, idx) => (
                            <Badge key={idx} className="bg-blue-100 text-blue-700">
                              {typeof cat === 'object' ? cat.category_id : cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {platformData.country && platformData.country !== 'N/A' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{platformData.country}</span>
                      </div>
                    )}

                    {platform === 'youtube' && platformData.joinedDateFormatted && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {platformData.joinedDateFormatted}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Metrics & Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Collaboration Overview */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaboration Overview</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium">Offered Rate</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        Γé╣{application.proposedRate?.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-medium">Match Score</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {application.match_score || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                      <div className="flex items-center gap-2 text-indigo-700 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">Invited On</span>
                      </div>
                      <p className="text-sm font-semibold text-indigo-900">
                        {application.invited_at
                          ? new Date(application.invited_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Placement Metrics */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatPlacementName(placementType)} Metrics
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      Placement-Specific
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <Eye className="w-5 h-5" />
                        <span className="text-sm font-medium">Expected Views</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {roiMetrics.avgViews.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm font-medium">CPM</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        Γé╣{roiMetrics.cpm > 0 ? roiMetrics.cpm.toFixed(2) : (() => {
                          const cost = metrics.cost || application.proposedRate || 0;
                          const cpm = roiMetrics.avgViews > 0 ? (cost / roiMetrics.avgViews) * 1000 : 0;
                          return cpm.toFixed(2);
                        })()}
                      </p>
                      <p className="text-xs text-green-700 mt-1">Cost per 1000 views</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-purple-700 mb-2">
                        <Target className="w-5 h-5" />
                        <span className="text-sm font-medium">CTR</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {roiMetrics.ctr.toFixed(2)}%
                      </p>
                      <p className="text-xs text-purple-700 mt-1">Click-through rate</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-orange-700 mb-2">
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-sm font-medium">Total Cost</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">
                        Γé╣{(metrics.cost || application.proposedRate || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Additional Engagement Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-xs">Avg Likes</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {(platformData.avgLikesPerVideo || platformData.avgLikesPerPost || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-xs">Avg Comments</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {(platformData.avgCommentsPerVideo || platformData.avgCommentsPerPost || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                        <Share2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs">Engagement</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {(platformData.avgEngagementPerVideo || platformData.avgEngagementPerPost || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* ROI Projection */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mt-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      ROI Projection
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Expected Clicks</p>
                        <p className="font-bold text-blue-900 text-lg">
                          {roiMetrics.expectedClicks.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Based on {roiMetrics.ctr.toFixed(1)}% CTR</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Cost per Click</p>
                        <p className="font-bold text-green-900 text-lg">
                          Γé╣{roiMetrics.costPerClick.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Per user click</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Cost per Engagement</p>
                        <p className="font-bold text-purple-900 text-lg">
                          Γé╣{roiMetrics.costPerEngagement.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{roiMetrics.totalEngagements.toLocaleString()} expected engagements</p>
                      </div>
                    </div>

                    {/* Value Assessment */}
                    {roiMetrics.costPerEngagement > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Value Assessment:</span>
                          <span className={`font-semibold ${roiMetrics.costPerEngagement < 10 ? 'text-green-600' :
                            roiMetrics.costPerEngagement < 25 ? 'text-blue-600' :
                              roiMetrics.costPerEngagement < 50 ? 'text-yellow-600' :
                                'text-orange-600'
                            }`}>
                            {roiMetrics.costPerEngagement < 10 ? 'Excellent Value' :
                              roiMetrics.costPerEngagement < 25 ? 'Good Value' :
                                roiMetrics.costPerEngagement < 50 ? 'Fair Value' :
                                  'Premium Pricing'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Content */}
                {((platformData.recentVideos && platformData.recentVideos.length > 0) ||
                  (platformData.recentPosts && platformData.recentPosts.length > 0)) && (
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Video className="w-5 h-5 text-blue-600" />
                        Recent {platform === 'youtube' ? 'Videos' : 'Posts'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(platformData.recentVideos || platformData.recentPosts || []).slice(0, 5).map((post, idx) => (
                          <div key={idx} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50">
                            {post.thumbnail && (
                              <img
                                src={post.thumbnail}
                                alt={post.title || 'Post'}
                                className="w-full h-40 object-cover"
                              />
                            )}

                            <div className="p-4">
                              <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                                {post.title || 'Untitled'}
                              </h4>

                              <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                {post.views && (
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{post.views.toLocaleString()}</span>
                                  </div>
                                )}
                                {post.likes && (
                                  <div className="flex items-center gap-1">
                                    <Heart className="w-3 h-3 text-red-500" />
                                    <span>{post.likes.toLocaleString()}</span>
                                  </div>
                                )}
                                {post.comments && (
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3 text-blue-500" />
                                    <span>{post.comments.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>

                              {post.publishedAt && (
                                <p className="text-xs text-gray-500">
                                  {new Date(post.publishedAt).toLocaleDateString()}
                                </p>
                              )}

                              {post.url && (
                                <a
                                  href={post.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1"
                                >
                                  View Post <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};

export default CreatorProfileView;
