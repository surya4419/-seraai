import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import BrandNavbar from '../components/BrandNavbar';
import {
  Loader2,
  CheckCircle, Package, Clock, FileCheck,
  ChevronDown, ChevronUp, MoreVertical, Check, X,
  ChevronRight, Paperclip, Play, ThumbsUp, MessageCircle, Share2, Eye
} from 'lucide-react';

const BrandHome = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('confirm-collaborations');
  const [expandedCampaigns, setExpandedCampaigns] = useState({});
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [actionItems, setActionItems] = useState({
    confirmCollaborations: 3,
    shipProducts: 2,
    timelineRequests: 1,
    reviewDeliverables: 2
  });
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    // Fetch action items from backend
    fetchActionItems();
  }, []);

  const fetchActionItems = async () => {
    try {
      // This would fetch real data from your backend
      // const response = await axios.get('/api/brand/action-items');
      // setActionItems(response.data);
      
      // Mock campaigns data for collaborations
      const mockCampaigns = [
        {
          id: 1,
          name: 'Summer Glow Launch',
          type: 'Brand awareness',
          newApplications: 2,
          status: 'Active',
          creators: [
            {
              id: 1,
              handle: '@neha_creates',
              platform: 'Instagram',
              location: 'India',
              language: 'English',
              price: '₹8,000',
              followers: '120K followers',
              views: '28K views',
              engagement: '6.4% eng',
              categories: ['Beauty', 'Skincare'],
              avatar: null
            },
            {
              id: 2,
              handle: '@arjunvlogs',
              platform: 'YouTube',
              location: 'India',
              language: 'English',
              price: '₹15,000',
              followers: '85K followers',
              views: '35K views',
              engagement: '7.1% eng',
              categories: ['Lifestyle', 'Travel'],
              avatar: null
            }
          ]
        }
      ];
      
      setCampaigns(mockCampaigns);
      
      // Set all campaigns to be expanded by default (IDs 1-10 to cover both campaigns and timeline requests)
      const initialExpandedState = {};
      for (let i = 1; i <= 10; i++) {
        initialExpandedState[i] = true;
      }
      setExpandedCampaigns(initialExpandedState);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching action items:', error);
      setLoading(false);
    }
  };

  // Mock deliverables data
  const deliverables = [
    {
      id: 1,
      campaignName: 'Summer Glow Launch',
      pendingCount: 3,
      creators: [
        {
          id: 1,
          handle: '@neha_creates',
          platform: 'Instagram',
          contentType: 'Reel',
          submittedDate: '9 June 2025',
          aiQC: '92%',
          avatar: null,
          videoUrl: 'https://example.com/video1.mp4',
          thumbnail: null,
          caption: 'Check out this amazing summer glow product! ✨ #SummerGlow #Beauty',
          metrics: {
            views: '125K',
            likes: '8.5K',
            comments: '342',
            shares: '156'
          }
        },
        {
          id: 2,
          handle: '@arjunvlogs',
          platform: 'YouTube',
          contentType: 'Short',
          submittedDate: '9 June 2025',
          aiQC: '88%',
          avatar: null,
          videoUrl: 'https://example.com/video2.mp4',
          thumbnail: null,
          caption: 'Summer vibes with the best glow products! Link in bio 🌟',
          metrics: {
            views: '89K',
            likes: '6.2K',
            comments: '218',
            shares: '94'
          }
        }
      ]
    }
  ];

  // Mock timeline requests data
  const timelineRequests = [
    {
      id: 1,
      campaignName: 'Radiant Glow',
      endDate: 'Ends: 17 Jun 2025',
      requestCount: 2,
      description: 'Click a card to open decision panel',
      creators: [
        {
          id: 1,
          name: 'Neha Creates',
          handle: '@neha_creates',
          platform: 'Instagram',
          contentType: 'Reel x1',
          dueDate: '10 Jun 2025',
          requestedDate: '12 Jun 2025',
          delay: '+2d',
          reason: '"Need product restock — packaging arrived late"',
          avatar: null
        },
        {
          id: 2,
          name: 'Rahul V',
          handle: '@rahulv',
          platform: 'YouTube',
          contentType: 'Integrated video',
          dueDate: '11 Jun 2025',
          requestedDate: '14 Jun 2025',
          delay: '+3d',
          reason: '"Weather delay for location shoot"',
          avatar: null
        }
      ]
    },
    {
      id: 2,
      campaignName: 'Summer Refresh',
      endDate: 'Ends: 22 Jun 2025',
      requestCount: 1,
      description: 'Click a card to open decision panel',
      creators: [
        {
          id: 3,
          name: 'Aditi Sharma',
          handle: '@aditishar',
          platform: 'Instagram',
          contentType: 'Static post',
          dueDate: '09 Jun 2025',
          requestedDate: '10 Jun 2025',
          delay: '+1d',
          reason: '"Late product arrival"',
          avatar: null
        }
      ]
    }
  ];

  const toggleCampaign = (campaignId) => {
    setExpandedCampaigns(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  const handleApprove = (campaignId, creatorId) => {
    toast.success('Creator approved!');
    // Add API call here
  };

  const handleReject = (campaignId, creatorId) => {
    toast.error('Creator rejected');
    // Add API call here
  };

  const handleAuthError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    toast.error('Session expired. Please log in again.');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const actionCenterItems = [
    {
      id: 'confirm-collaborations',
      label: 'Confirm Collaborations',
      count: actionItems.confirmCollaborations,
      icon: CheckCircle
    },
    {
      id: 'ship-products',
      label: 'Ship Products',
      count: actionItems.shipProducts,
      icon: Package
    },
    {
      id: 'timeline-requests',
      label: 'Timeline Requests',
      count: actionItems.timelineRequests,
      icon: Clock
    },
    {
      id: 'review-deliverables',
      label: 'Review Deliverables',
      count: actionItems.reviewDeliverables,
      icon: FileCheck
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandNavbar user={user} onLogout={onLogout} />

      {/* Page Content */}
      <div className="p-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back{user?.name ? `, ${user.name}` : ''} 👋
              </h1>
              <p className="text-gray-600">
                Campaigns thrive on momentum — keep an eye on what needs your attention today.
              </p>
            </div>
            <Button
              onClick={() => navigate('/new-campaign')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
            >
              Create new campaign
            </Button>
          </div>

          {/* Action Center */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Action Center</h2>
            
            {/* Action Items */}
            <div className="flex gap-4 mb-6">
              {actionCenterItems.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedAction === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedAction(selectedAction === item.id ? null : item.id);
                    }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                    <Badge className={`${
                      isSelected
                        ? 'bg-white text-blue-600'
                        : 'bg-gray-200 text-gray-600'
                    } rounded-full px-2 py-0.5 text-xs font-semibold`}>
                      {item.count}
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Content Area */}
            {!selectedAction ? (
              /* Empty State */
              <Card className="bg-white border border-gray-200 rounded-xl">
                <CardContent className="py-24">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Great job — everything's up to date! No pending actions for now.
                    </h3>
                    <p className="text-gray-600">
                      Keep an eye here — new actions will appear as your campaigns progress.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : selectedAction === 'confirm-collaborations' ? (
              /* Confirm Collaborations Content */
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const isExpanded = expandedCampaigns[campaign.id];
                  
                  return (
                    <Card key={campaign.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      {/* Campaign Header */}
                      <div 
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleCampaign(campaign.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {campaign.name}
                              </h3>
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-2 py-1 text-xs font-medium">
                                {campaign.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm">
                              {campaign.type} • {campaign.newApplications} new application{campaign.newApplications !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Creators List (Collapsible) */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <div className="p-6 space-y-4">
                            {campaign.creators.map((creator) => (
                              <div 
                                key={creator.id}
                                className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  {/* Creator Info */}
                                  <div className="flex items-start gap-4 flex-1">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                      {creator.handle.charAt(1).toUpperCase()}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">
                                          {creator.handle}
                                        </span>
                                        <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5">
                                          {creator.platform}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-gray-600 mb-3">
                                        {creator.location} • {creator.language}
                                      </div>

                                      {/* Stats */}
                                      <div className="flex items-center gap-6 text-sm text-gray-700 mb-3">
                                        <span className="font-medium">{creator.price}</span>
                                        <span>{creator.followers}</span>
                                        <span>{creator.views}</span>
                                        <span>{creator.engagement}</span>
                                      </div>

                                      {/* Categories */}
                                      <div className="flex items-center gap-2">
                                        {creator.categories.map((category, idx) => (
                                          <Badge 
                                            key={idx}
                                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1"
                                          >
                                            {category}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 ml-4">
                                    <button
                                      onClick={() => handleReject(campaign.id, creator.id)}
                                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                      title="Reject"
                                    >
                                      <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                      onClick={() => handleApprove(campaign.id, creator.id)}
                                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                      title="Approve"
                                    >
                                      <Check className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                      title="More options"
                                    >
                                      <MoreVertical className="w-5 h-5 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : selectedAction === 'ship-products' ? (
              /* Ship Products Content */
              <Card className="bg-white border border-gray-200 rounded-xl">
                <CardContent className="py-24">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Ship Products
                    </h3>
                    <p className="text-gray-600">
                      You have {actionItems.shipProducts} products ready to ship to creators
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : selectedAction === 'timeline-requests' ? (
              /* Timeline Requests Content */
              <div>
                {/* Header with Filter and Review All */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Timeline Requests</h3>
                    <p className="text-gray-600 text-sm">
                      Review extension requests grouped by campaign — cleaner, readable layout for brands.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-gray-300 text-gray-700">
                      Filter
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Review All
                    </Button>
                  </div>
                </div>

                {/* Timeline Request Cards */}
                <div className="space-y-4">
                  {timelineRequests.map((request) => {
                    const isExpanded = expandedCampaigns[request.id];
                    
                    return (
                      <Card key={request.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {/* Campaign Header */}
                        <div 
                          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleCampaign(request.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold text-gray-900">
                                  {request.campaignName}
                                </h4>
                                <span className="text-sm text-gray-500">{request.endDate}</span>
                              </div>
                              <p className="text-gray-600 text-sm">
                                {request.requestCount} request{request.requestCount !== 1 ? 's' : ''} • {request.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="ghost" 
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle review campaign
                                }}
                              >
                                Review Campaign
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="text-gray-600 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle export
                                }}
                              >
                                Export
                              </Button>
                              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Creators List (Collapsible) */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-gray-50">
                            <div className="p-6 space-y-3">
                              {request.creators.map((creator) => (
                                <div 
                                  key={creator.id}
                                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => setSelectedCreator({ ...creator, campaignName: request.campaignName })}
                                >
                                  <div className="flex items-center justify-between">
                                    {/* Creator Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                      {/* Avatar */}
                                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {creator.name.charAt(0).toUpperCase()}
                                      </div>

                                      {/* Details */}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-gray-900">
                                            {creator.name}
                                          </span>
                                          <span className="text-gray-500 text-sm">{creator.handle}</span>
                                          <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5">
                                            {creator.platform}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {creator.contentType}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Timeline Info */}
                                    <div className="flex items-center gap-8 mr-4">
                                      <div className="text-right">
                                        <div className="text-xs text-gray-500 mb-1">Due</div>
                                        <div className="text-sm font-medium text-gray-900">{creator.dueDate}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-gray-500 mb-1">Requested</div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-gray-900">{creator.requestedDate}</span>
                                          <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                                            {creator.delay}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Reason */}
                                    <div className="flex items-center gap-3 max-w-xs">
                                      <p className="text-sm text-gray-600 italic">
                                        {creator.reason}
                                      </p>
                                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Paperclip className="w-4 h-4 text-gray-400" />
                                      </button>
                                    </div>

                                    {/* Arrow */}
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                      <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : selectedAction === 'review-deliverables' ? (
              /* Review Deliverables Content */
              <div>
                {/* Header with Filter and Approve All */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Deliverables & Feedback</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Campaigns</option>
                      {deliverables.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.campaignName}
                        </option>
                      ))}
                    </select>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Approve All
                    </Button>
                  </div>
                </div>

                {/* Deliverables Cards */}
                <div className="space-y-4">
                  {deliverables.map((deliverable) => {
                    const isExpanded = expandedCampaigns[deliverable.id];
                    
                    return (
                      <Card key={deliverable.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {/* Campaign Header */}
                        <div 
                          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleCampaign(deliverable.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900 mb-1">
                                {deliverable.campaignName}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {deliverable.pendingCount} pending deliverable{deliverable.pendingCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Creators List (Collapsible) */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-gray-50">
                            <div className="p-6 space-y-3">
                              {deliverable.creators.map((creator) => (
                                <div 
                                  key={creator.id}
                                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => setSelectedCreator({ ...creator, campaignName: deliverable.campaignName, type: 'deliverable' })}
                                >
                                  <div className="flex items-center justify-between">
                                    {/* Creator Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                      {/* Avatar */}
                                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {creator.handle.charAt(1).toUpperCase()}
                                      </div>

                                      {/* Details */}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-gray-900">
                                            {creator.handle}
                                          </span>
                                          <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5">
                                            {creator.platform}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {creator.contentType} • Submitted {creator.submittedDate}
                                        </div>
                                      </div>
                                    </div>

                                    {/* AI QC Score */}
                                    <div className="flex items-center gap-3">
                                      <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 text-sm font-semibold">
                                        AI QC {creator.aiQC}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Side Panel for Creator Details */}
      {selectedCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto">
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedCreator.name ? selectedCreator.name.charAt(0).toUpperCase() : selectedCreator.handle.charAt(1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{selectedCreator.handle}</span>
                      <span className="text-gray-500">•</span>
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5">
                        {selectedCreator.platform}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedCreator.contentType} • Status: Submitted {selectedCreator.type === 'deliverable' ? '— Ready for review' : '— Timeline request'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCreator(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-6 space-y-6">
              {selectedCreator.type === 'deliverable' ? (
                /* Deliverable Content */
                <>
                  {/* Video Preview */}
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                    <button className="relative z-10 w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    </button>
                  </div>

                  {/* AI QC Score */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <div className="text-sm text-green-700 font-medium mb-1">AI Quality Check</div>
                      <div className="text-xs text-green-600">Content meets brand guidelines</div>
                    </div>
                    <Badge className="bg-green-600 text-white px-4 py-2 text-lg font-bold">
                      {selectedCreator.aiQC}
                    </Badge>
                  </div>

                  {/* Caption */}
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">Caption</div>
                    <p className="text-gray-700">{selectedCreator.caption}</p>
                  </div>

                  {/* Metrics */}
                  {selectedCreator.metrics && (
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-3">Expected Performance</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Eye className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-xs text-gray-500">Views</div>
                            <div className="font-semibold text-gray-900">{selectedCreator.metrics.views}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <ThumbsUp className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-xs text-gray-500">Likes</div>
                            <div className="font-semibold text-gray-900">{selectedCreator.metrics.likes}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-xs text-gray-500">Comments</div>
                            <div className="font-semibold text-gray-900">{selectedCreator.metrics.comments}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Share2 className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-xs text-gray-500">Shares</div>
                            <div className="font-semibold text-gray-900">{selectedCreator.metrics.shares}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        toast.info('Feedback requested');
                        setSelectedCreator(null);
                      }}
                    >
                      Request Changes
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        toast.success('Deliverable approved!');
                        setSelectedCreator(null);
                      }}
                    >
                      Approve & Publish
                    </Button>
                  </div>
                </>
              ) : (
                /* Timeline Request Content */
                <>
                  {/* Timeline Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Current Due</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedCreator.dueDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Requested Date</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900">{selectedCreator.requestedDate}</span>
                        <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                          {selectedCreator.delay}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Reason</div>
                    <p className="text-gray-900 italic">{selectedCreator.reason}</p>
                  </div>

                  {/* Attachments */}
                  <div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      View attachments
                    </button>
                  </div>

                  {/* Impact Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Impact Preview</div>
                    <p className="text-sm text-gray-700">
                      Approving will shift review & publish dates by <span className="font-semibold">+2 days</span>. 
                      Campaign end may extend from 17 Jun 2025.
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold"
                    onClick={() => {
                      toast.success('Timeline request approved!');
                      setSelectedCreator(null);
                    }}
                  >
                    Approve requested date
                  </Button>

                  {/* Helper Text */}
                  <p className="text-xs text-gray-500 text-center">
                    Approves the date requested by creator ({selectedCreator.requestedDate}). 
                    Notifications will be sent automatically.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandHome;
