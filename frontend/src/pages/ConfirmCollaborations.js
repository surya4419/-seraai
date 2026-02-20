import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import BrandNavbar from '../components/BrandNavbar';
import {
  Loader2, ChevronDown, ChevronUp, Star, MoreVertical, Check, X
} from 'lucide-react';

const ConfirmCollaborations = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [expandedCampaigns, setExpandedCampaigns] = useState({});
  const [filterCampaign, setFilterCampaign] = useState('all');

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      // Mock data - replace with actual API call
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      toast.error('Failed to load collaborations');
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandNavbar user={user} onLogout={onLogout} />

      {/* Page Content */}
      <div className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Confirm Collaborations
            </h1>
            <p className="text-gray-600">
              Review and approve creator applications for your campaigns
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-4">
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campaign Cards */}
          <div className="space-y-4">
            {campaigns
              .filter(campaign => filterCampaign === 'all' || campaign.id === parseInt(filterCampaign))
              .map((campaign) => {
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

          {/* Empty State */}
          {campaigns.length === 0 && (
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="py-24">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Check className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No pending collaborations
                  </h3>
                  <p className="text-gray-600">
                    All creator applications have been reviewed
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmCollaborations;
