import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import BrandNavbar from '../components/BrandNavbar';
import { useSettings } from '../contexts/SettingsContext';
import {
  Users, TrendingUp, Target, Filter, BarChart3, Briefcase,
  Plus, Search, Calendar, MoreVertical, Loader2, Trash2, Edit
} from 'lucide-react';

// Brand settings components are now in GlobalSettingsModal.js



const BrandDashboard = ({ user, onLogout, initialTab = 'campaigns' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSettings: showSettingsModal } = useSettings();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openMenuId, setOpenMenuId] = useState(null); // Track which campaign menu is open

  // Helper function to handle authentication errors
  const handleAuthError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    toast.error('Session expired. Please log in again.');
    navigate('/');
  };


  
  // Campaigns state
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignFilter, setCampaignFilter] = useState('all'); // all, current, past
  const [campaignToDelete, setCampaignToDelete] = useState(null); // Track campaign to delete
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Show delete confirmation modal

  useEffect(() => {
    fetchDashboard();
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    const openSettings = urlParams.get('openSettings');
    
    // Handle tab switching from URL
    if (tab) {
      setActiveTab(tab);
    }
    
    // Handle settings auto-open from URL
    if (openSettings === 'true') {
      showSettingsModal();
      // Clean up the URL parameter
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('openSettings');
      window.history.replaceState({}, '', newUrl);
    }
    
    // Handle refresh from navigation state
    if (location.state?.refresh) {
      fetchCampaigns();
      // Clear the state to prevent refresh on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.search, location.state]);

  // Fetch campaigns when campaigns tab is active or filter changes
  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaigns();
    }
  }, [activeTab, campaignFilter]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.campaign-menu')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);



  // Settings are now handled globally via SettingsProvider

  const fetchDashboard = async () => {
    try {
      // For now, just set loading to false since we don't have a dedicated dashboard endpoint
      // Dashboard data will come from campaigns and other sources
      setDashboardData({ loaded: true });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      if (error.response?.status === 401) {
        console.log('User not authenticated for brand dashboard');
        handleAuthError();
      } else {
        toast.error('Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      console.log('Fetching campaigns with filter:', campaignFilter);
      const response = await axios.get(`/api/campaigns?status=${campaignFilter}&limit=1000`);
      console.log('Campaigns response:', response.data);
      if (response.data.success && Array.isArray(response.data.campaigns)) {
        setCampaigns(response.data.campaigns);
        console.log('Campaigns set:', response.data.campaigns.length);
      } else if (Array.isArray(response.data.campaigns)) {
        // Handle case where success flag might not be present
        setCampaigns(response.data.campaigns);
        console.log('Campaigns set (no success flag):', response.data.campaigns.length);
      } else {
        console.error('Invalid campaigns response:', response.data);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Campaigns fetch error:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        toast.error('Failed to load campaigns');
        setCampaigns([]);
      }
    } finally {
      setCampaignsLoading(false);
    }
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
      <div className="p-6">
        <div className="space-y-8">
          {activeTab === 'campaigns' ? (
            // Campaigns Section
            <div className="space-y-6">
              {/* Campaigns Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">Campaigns</h2>
                  <p className="text-gray-600">Your campaigns — quick overview and next steps.</p>
                </div>
                <Button
                  onClick={() => navigate('/new-campaign')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
                >
                  Create a campaign
                </Button>
              </div>

              {/* Filters and Search */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Status Tabs */}
                  {['all', 'active', 'draft', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setCampaignFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        campaignFilter === status
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaign name"
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Campaigns List */}
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : !campaigns || campaigns.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 mb-6">Create your first campaign to start working with influencers</p>
                  <Button
                    onClick={() => navigate('/new-campaign')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create new campaign
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign) => {
                    return (
                      <div 
                        key={campaign._id || campaign.id} 
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300 cursor-pointer relative"
                      >
                        {/* Campaign Card */}
                        <div 
                          className="p-6"
                          onClick={() => {
                            // If campaign is active, navigate to collaboration page
                            if (campaign.status === 'active') {
                              navigate(`/campaign/${campaign._id || campaign.id}/collaboration`);
                            } else {
                              // If draft, continue editing
                              localStorage.setItem('editingCampaign', JSON.stringify(campaign));
                              navigate(`/new-campaign?mode=edit&id=${campaign._id || campaign.id}`);
                            }
                          }}
                        >
                          {/* Header with Logo and Menu */}
                          <div className="flex items-start justify-between mb-4">
                            {/* Logo or Placeholder */}
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {campaign.brandId?.logoUrl ? (
                                <img 
                                  src={campaign.brandId.logoUrl} 
                                  alt={campaign.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Briefcase className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            
                            {/* Three Dots Menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === campaign._id ? null : campaign._id);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-400" />
                              </button>
                              
                              {/* Dropdown Menu */}
                              {openMenuId === campaign._id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                    }}
                                  />
                                  <div className="campaign-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        localStorage.setItem('editingCampaign', JSON.stringify(campaign));
                                        navigate(`/new-campaign?mode=edit`);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit & Relaunch
                                    </button>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          // Create a duplicate
                                          const duplicateData = {
                                            ...campaign,
                                            title: `${campaign.title} (Copy)`,
                                            status: 'draft'
                                          };
                                          delete duplicateData._id;
                                          delete duplicateData.id;
                                          delete duplicateData.createdAt;
                                          delete duplicateData.updatedAt;
                                          
                                          const response = await axios.post('/api/campaigns', duplicateData);
                                          if (response.data.success) {
                                            toast.success('Campaign duplicated successfully');
                                            fetchCampaigns();
                                          }
                                        } catch (error) {
                                          toast.error('Failed to duplicate campaign');
                                        }
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Duplicate
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCampaignToDelete(campaign);
                                        setShowDeleteModal(true);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Campaign Title */}
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {campaign.title || 'Untitled Campaign'}
                          </h3>

                          {/* Status Badge */}
                          <div className="mb-4">
                            <Badge className={`px-3 py-1 text-xs font-medium ${
                              campaign.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : campaign.status === 'completed'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {campaign.status === 'active' ? 'Active' : campaign.status === 'completed' ? 'Completed' : 'Draft'}
                            </Badge>
                          </div>

                          {/* Budget */}
                          <div className="text-sm text-gray-600 mb-4">
                            <span className="font-medium">Budget:</span> ₹{campaign.budget?.toLocaleString('en-IN') || '0'}
                          </div>

                          {/* Progress Bar (for active campaigns) */}
                          {campaign.status === 'active' && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>60%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: '60%' }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Deliverables Status */}
                          <div className="text-xs text-gray-500">
                            {campaign.status === 'active' ? '0% deliverables completed' : '0% deliverables completed'}
                          </div>

                          {/* Last Updated */}
                          <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                            Last updated {(() => {
                              const date = new Date(campaign.createdAt);
                              const now = new Date();
                              const diffTime = Math.abs(now - date);
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              if (diffDays === 0) return 'today';
                              if (diffDays === 1) return '1 day ago';
                              if (diffDays < 7) return `${diffDays} days ago`;
                              return date.toLocaleDateString();
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Original Stats Section
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Available Creators</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData?.available_creators || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Reach</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Creator List */}
          {activeTab !== 'campaigns' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Creators</CardTitle>
                <Button variant="outline" size="sm" data-testid="filter-creators-btn">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                {dashboardData?.creators && dashboardData.creators.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.creators.map((creator, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedCreator(creator)}
                        data-testid={`creator-item-${index}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">@{creator.handle}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {creator.platform}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Followers: </span>
                              <span className="font-medium">{creator.profile_data.followers.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Engagement: </span>
                              <span className="font-medium">{creator.profile_data.engagement_rate}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Growth: </span>
                              <span className="font-medium text-green-600">+{creator.profile_data.growth_rate}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          {creator.rate_card && creator.rate_card.length > 0 && (
                            <div>
                              <div className="text-sm text-gray-500">Starting at</div>
                              <div className="text-xl font-bold text-blue-600">
                                ${creator.rate_card[0].expected}
                              </div>
                            </div>
                          )}
                          <Button
                            size="sm"
                            className="mt-2 bg-blue-600 hover:bg-blue-700"
                            data-testid={`invite-creator-${index}`}
                          >
                            Invite
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No creators available yet</p>
                    <p className="text-sm text-gray-500 mt-2">Check back soon for creator recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Settings are now handled globally via GlobalSettingsModal */}

      {/* Delete Campaign Confirmation Modal */}
      {showDeleteModal && campaignToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Delete Campaign
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold">"{campaignToDelete.title}"</span>? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCampaignToDelete(null);
                }}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await axios.delete(`/api/campaigns/${campaignToDelete._id || campaignToDelete.id}`);
                    toast.success('Campaign deleted successfully');
                    fetchCampaigns();
                    setShowDeleteModal(false);
                    setCampaignToDelete(null);
                  } catch (error) {
                    toast.error(error.response?.data?.error?.message || 'Failed to delete campaign');
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandDashboard;