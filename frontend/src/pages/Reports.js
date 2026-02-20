import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import BrandNavbar from '../components/BrandNavbar';
import {
  Calendar, Loader2, TrendingUp,
  DollarSign, Users, Heart, Target
} from 'lucide-react';

const Reports = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/campaigns?status=${statusFilter}`);
      if (response.data.success) {
        // Filter only completed campaigns for reports
        const completedCampaigns = response.data.campaigns.filter(
          c => c.status === 'completed' || c.status === 'active'
        );
        setReports(completedCampaigns);
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        toast.error('Session expired. Please log in again.');
        navigate('/');
      } else {
        toast.error('Failed to load reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllReports = () => {
    toast.success('Exporting all reports...');
    // Add export logic here
  };

  const handleViewFullReport = (campaignId) => {
    navigate(`/campaign/${campaignId}/report`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandNavbar user={user} onLogout={onLogout} />

      {/* Page Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Reports Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Reports</h2>
              <p className="text-gray-600">Track campaign performance and discover what's driving your best results.</p>
            </div>
            <Button
              onClick={handleExportAllReports}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
            >
              Export All Reports
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            {/* Date Range Picker */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Select Date Range</span>
            </div>
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports available</h3>
              <p className="text-gray-600 mb-6">Complete campaigns to see their performance reports</p>
              <Button
                onClick={() => navigate('/brand/campaigns')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Campaigns
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-1 gap-6">
              {reports.map((campaign) => {
                // Mock data for demonstration
                const budget = campaign.requirements?.budget?.totalAmount || 100000;
                const spent = Math.floor(budget * 0.78);
                const reach = 210000;
                const targetReach = 220000;
                const engagement = 8.2;
                const targetEngagement = 10.8;
                const roi = 32;

                return (
                  <Card
                    key={campaign._id || campaign.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300 cursor-pointer"
                    onClick={() => handleViewFullReport(campaign._id || campaign.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {campaign.summary?.campaignName || campaign.campaignName || 'Summer Glow Launch'}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Calendar className="w-4 h-4" />
                                <span>Duration: 10 May – 25 June 2025 | Objective: Brand Awareness</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Badge className="bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
                                  {campaign.status === 'active' ? 'Active' : 'Completed'}
                                </Badge>
                                <span>| Platforms: Instagram, YouTube</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-orange-500" />
                              <div>
                                <p className="text-xs text-gray-500">Spend</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  ₹{spent.toLocaleString()} (of ₹{budget.toLocaleString()} budget)
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <div>
                                <p className="text-xs text-gray-500">Reach</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {reach.toLocaleString()} / {targetReach.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-pink-500" />
                              <div>
                                <p className="text-xs text-gray-500">Engagement</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {engagement}% ({targetEngagement}%)
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <div>
                                <p className="text-xs text-gray-500">ROI</p>
                                <p className="text-sm font-semibold text-green-600">
                                  +{roi}% uplift
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFullReport(campaign._id || campaign.id);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg ml-4"
                        >
                          View Full Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
