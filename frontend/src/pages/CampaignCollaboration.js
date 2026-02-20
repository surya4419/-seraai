import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  DollarSign,
  Info,
  Search,
  Filter,
  Download,
  Settings,
  Star,
  MessageSquare,
  MoreHorizontal,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { getProxiedImageUrl } from '../utils/imageProxy';

// Import the creator profile view component content
import CreatorProfileView from './CreatorProfileView';
import BrandReportContent from '../components/BrandReportContent';

// Inline Creator Profile Component (without separate page navigation)
const CreatorProfileInline = ({ campaignId, applicationId, onBack }) => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-white border-b p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Collaborations</span>
        </button>
      </div>
      <CreatorProfileView
        campaignId={campaignId}
        applicationId={applicationId}
        embedded={true}
      />
    </div>
  );
};

const CampaignCollaboration = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [collaborations, setCollaborations] = useState(null);
  const [stats, setStats] = useState(null);
  const [budget, setBudget] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('collaboration');
  const [activeTab, setActiveTab] = useState('invited_influencers');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null); // Track selected creator
  const [activeStatusTab, setActiveStatusTab] = useState('pending_confirmation'); // Track active status tab
  const [processingAction, setProcessingAction] = useState(null); // Track which application is being processed

  // Helper function to safely extract CPM value
  const getCpmValue = (collab) => {
    // Use placement_metrics if available (from invitation)
    if (collab.placement_metrics?.cpm && typeof collab.placement_metrics.cpm === 'number') {
      return collab.placement_metrics.cpm;
    }

    // Fallback: Get from profileData.costEstimation
    const handle = collab.creator?.handles?.find(h => h.platform === collab.target_platform);
    let cpm = handle?.profileData?.costEstimation?.cpm || handle?.profileData?.cpm;

    // Handle case where cpm is an object (placement-specific)
    if (cpm && typeof cpm === 'object') {
      const placementType = collab.selected_placement?.type;
      cpm = cpm[placementType]?.value || cpm[placementType];

      // If still an object or not found, try to get first numeric value
      if (!cpm || typeof cpm !== 'number') {
        const values = Object.values(cpm || {});
        cpm = values.find(v => typeof v === 'number') ||
          values.find(v => v?.value && typeof v.value === 'number')?.value;
      }
    }

    return (cpm && typeof cpm === 'number') ? cpm : null;
  };

  useEffect(() => {
    fetchAllData();
  }, [campaignId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCollaborations(),
        fetchBudget(),
        fetchCampaign()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborations = async () => {
    try {
      const response = await axios.get(`/api/campaign-collaboration/${campaignId}/collaborations`);
      setCollaborations(response.data.collaborations);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      toast.error('Failed to load collaborations');
    }
  };

  const fetchBudget = async () => {
    try {
      const response = await axios.get(`/api/campaign-collaboration/${campaignId}/budget`);
      setBudget(response.data.budget);
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  const fetchCampaign = async () => {
    try {
      const response = await axios.get(`/api/campaigns/${campaignId}`);
      setCampaign(response.data.campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    }
  };

  const handleConfirm = async (applicationId) => {
    setProcessingAction(applicationId);
    try {
      const response = await axios.post(`/api/campaign-collaboration/${campaignId}/confirm/${applicationId}`);

      // Show success message
      toast.success('Collaboration confirmed');

      // Check if additional invites were triggered (Cycle 3 or Cycle 4)
      // Note: Backend handles this automatically, we just refresh the data

      await fetchCollaborations();
      await fetchBudget(); // Refresh budget after confirmation

      // Optional: Show notification if new invites were sent
      // This would require backend to return additional invite info in response

    } catch (error) {
      console.error('Error confirming collaboration:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm collaboration');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (applicationId, reason = 'Not a good fit for this campaign') => {
    setProcessingAction(applicationId);
    try {
      const response = await axios.post(`/api/campaign-collaboration/${campaignId}/reject/${applicationId}`, {
        reason
      });

      // Show success message with reinvite info if available
      if (response.data.reinvite?.success) {
        toast.success(`Collaboration rejected. Invited ${response.data.reinvite.creator?.name} as replacement.`);
      } else {
        toast.success('Collaboration rejected');
      }

      await fetchCollaborations();
      await fetchBudget(); // Refresh budget after rejection
    } catch (error) {
      console.error('Error rejecting collaboration:', error);
      toast.error(error.response?.data?.message || 'Failed to reject collaboration');
    } finally {
      setProcessingAction(null);
    }
  };

  // Render Budget Section
  const renderBudgetSection = () => {
    if (!budget) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 ml-3">Loading budget information...</p>
        </div>
      );
    }
    
    // Prepare data for main budget distribution pie chart (6 categories)
    const mainBudgetData = [
      { name: 'Committed (Base)', value: budget.committed_base || 0, color: '#f59e0b' },
      { name: 'Committed (Buffer)', value: budget.committed_buffer || 0, color: '#fbbf24' },
      { name: 'Withheld (Base)', value: budget.withheld_base || 0, color: '#3b82f6' },
      { name: 'Withheld (Buffer)', value: budget.withheld_buffer || 0, color: '#60a5fa' },
      { name: 'Released', value: budget.released || 0, color: '#10b981' },
      { name: 'Available', value: budget.available_for_invites || 0, color: '#94a3b8' }
    ].filter(item => item.value > 0);

    // Prepare data for status breakdown pie chart
    const statusBreakdownData = budget.detailed_breakdown?.by_status ? [
      { name: 'Pending', value: budget.detailed_breakdown.by_status.pending?.amount || 0, color: '#fbbf24' },
      { name: 'Accepted', value: budget.detailed_breakdown.by_status.creator_accepted?.amount || 0, color: '#f59e0b' },
      {
        name: 'Confirmed', value: (budget.detailed_breakdown.by_status.brand_confirmed?.amount || 0) +
          (budget.detailed_breakdown.by_status.content_submitted?.amount || 0) +
          (budget.detailed_breakdown.by_status.content_approved?.amount || 0), color: '#3b82f6'
      },
      { name: 'Published', value: budget.detailed_breakdown.by_status.published?.amount || 0, color: '#10b981' },
      {
        name: 'Rejected', value: (budget.detailed_breakdown.by_status.rejected?.amount || 0) +
          (budget.detailed_breakdown.by_status.withdrawn?.amount || 0), color: '#ef4444'
      }
    ].filter(item => item.value > 0) : [];

    // Prepare data for platform breakdown pie chart
    const platformBreakdownData = budget.detailed_breakdown?.by_platform ?
      Object.entries(budget.detailed_breakdown.by_platform).map(([platform, data]) => ({
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        value: data.amount || 0,
        color: platform === 'instagram' ? '#e1306c' : platform === 'youtube' ? '#ff0000' : '#3b82f6'
      })).filter(item => item.value > 0) : [];

    // Prepare data for placement breakdown pie chart
    const placementBreakdownData = budget.detailed_breakdown?.by_placement ?
      Object.entries(budget.detailed_breakdown.by_placement).map(([placement, data]) => ({
        name: placement.replace(/([A-Z])/g, ' $1').trim(),
        value: data.amount || 0,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      })).filter(item => item.value > 0) : [];

    // Calculate utilization percentage
    const utilizationPercentage = parseFloat(budget.utilization_percentage) || 0;

    return (
      <div className="p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Budget Overview</h1>
        
        {/* Budget Summary Cards - 6 Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Budget</p>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold">₹{(budget.total_budget || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Campaign Budget</p>
          </div>

          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Committed (Base)</p>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">₹{(budget.committed_base || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Base prices pending</p>
          </div>
          
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Committed (Buffer)</p>
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">₹{(budget.committed_buffer || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">20% negotiation buffers</p>
          </div>

          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Withheld</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">₹{((budget.withheld_base || 0) + (budget.withheld_buffer || 0)).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Confirmed creators</p>
          </div>

          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Released</p>
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">₹{(budget.released || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Published content</p>
          </div>

          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Available</p>
              <DollarSign className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold text-gray-700">₹{(budget.available_for_invites || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">For new invites</p>
          </div>
        </div>

        {/* Utilization Progress Bar */}
        <div className="bg-white rounded-lg border p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Budget Utilization</h3>
            <span className="text-2xl font-bold text-blue-600">{utilizationPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>₹{(budget.total_allocated || 0).toLocaleString()} allocated</span>
            <span>₹{(budget.available_for_invites || 0).toLocaleString()} available</span>
          </div>
        </div>

        {/* Pie Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Main Budget Distribution */}
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Budget Distribution</h3>
            {mainBudgetData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mainBudgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mainBudgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <p>No budget data available</p>
              </div>
            )}
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Budget by Status</h3>
            {statusBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <p>No status data available</p>
              </div>
            )}
          </div>

          {/* Platform Breakdown */}
          {platformBreakdownData.length > 0 && (
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Budget by Platform</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Placement Breakdown */}
          {placementBreakdownData.length > 0 && (
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Budget by Placement Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={placementBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {placementBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Creator Payment Table */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Creator Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Creator</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Platform</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Placement</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {budget.creators && budget.creators.length > 0 ? (
                  budget.creators.map((creator, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {creator.creator_avatar ? (
                            <img
                              src={getProxiedImageUrl(creator.creator_avatar)}
                              alt={creator.creator_name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${creator.creator_avatar ? 'hidden' : 'flex'} ${creator.platform === 'youtube'
                              ? 'bg-red-500'
                              : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
                              }`}
                          >
                            {creator.creator_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-medium">{creator.creator_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm capitalize">{creator.platform || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm capitalize">{creator.placement_type?.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold">₹{(creator.final_rate || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creator.status === 'published' ? 'bg-green-100 text-green-800' :
                          creator.status === 'brand_confirmed' || creator.status === 'content_submitted' || creator.status === 'content_approved' ? 'bg-blue-100 text-blue-800' :
                            creator.status === 'creator_accepted' ? 'bg-yellow-100 text-yellow-800' :
                              creator.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                          }`}>
                          {creator.status?.replace(/_/g, ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creator.payment_status === 'released' ? 'bg-green-100 text-green-800' :
                          creator.payment_status === 'withheld' ? 'bg-blue-100 text-blue-800' :
                            creator.payment_status === 'committed' ? 'bg-orange-100 text-orange-800' :
                              creator.payment_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {creator.payment_status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No creators invited yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Campaign Info Section
  const renderCampaignInfoSection = () => {
    if (!campaign) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">Loading campaign information...</p>
        </div>
      );
    }

    const extDetails = campaign.extendedDetails || {};

    return (
      <div className="p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Campaign Information</h1>

        <div className="space-y-6">
          {/* Campaign & Product Names */}
          {(extDetails.campaignName || extDetails.productName || extDetails.businessName) && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Campaign & Product Details</h2>

              {extDetails.campaignName && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Campaign Name</h3>
                  <p className="text-lg font-semibold text-blue-600">{extDetails.campaignName}</p>
                </div>
              )}

              {extDetails.productName && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Product Name</h3>
                  <p className="text-base font-semibold">{extDetails.productName}</p>
                </div>
              )}

              {extDetails.businessName && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Business Name</h3>
                  <p className="text-base">{extDetails.businessName}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {extDetails.productServiceType && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Product/Service Type</h3>
                    <p className="text-sm capitalize">{extDetails.productServiceType}</p>
                  </div>
                )}

                {extDetails.productRetailPrice && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Retail Price</h3>
                    <p className="text-sm font-semibold">₹{extDetails.productRetailPrice.toLocaleString()}</p>
                  </div>
                )}

                {extDetails.productDelivery && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Product Delivery</h3>
                    <p className="text-sm capitalize">{extDetails.productDelivery.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Business Introduction & Brand Highlights */}
          {(extDetails.businessIntroduction || extDetails.brandHighlights) && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Overview</h2>

              {extDetails.businessIntroduction && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Business Introduction</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                    {extDetails.businessIntroduction}
                  </p>
                </div>
              )}

              {extDetails.brandHighlights && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Brand Highlights</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 p-4 rounded">
                    {extDetails.brandHighlights}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Core Selling Points */}
          {extDetails.coreSellingPoints && extDetails.coreSellingPoints.length > 0 && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Core Selling Points</h2>

              <div className="space-y-2">
                {extDetails.coreSellingPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-800 flex-1">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Product Audiences */}
          {extDetails.coreProductAudiences && extDetails.coreProductAudiences.length > 0 && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Core Product Audiences</h2>

              <div className="space-y-2">
                {extDetails.coreProductAudiences.map((audience, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{audience.segment || audience}</p>
                    {audience.description && (
                      <p className="text-xs text-gray-600 mt-1">{audience.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmark Brands */}
          {extDetails.benchmarkBrands && extDetails.benchmarkBrands.length > 0 && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Benchmark Brands</h2>

              <div className="flex gap-2 flex-wrap">
                {extDetails.benchmarkBrands.map((brand, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-medium">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {extDetails.additionalInfo && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h2>

              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                {extDetails.additionalInfo}
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Campaign Title</h3>
              <p className="text-base font-semibold">{campaign.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Budget</h3>
                <p className="text-lg font-semibold text-blue-600">₹{campaign.budget?.toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                  {campaign.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Platforms</h3>
              <div className="flex gap-2 flex-wrap">
                {campaign.platforms?.map((platform, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {campaign.tags && campaign.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                <div className="flex gap-2 flex-wrap">
                  {campaign.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Campaign Dates */}
          {(campaign.startDate || campaign.endDate || campaign.applicationDeadline) && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Timeline</h2>

              <div className="grid grid-cols-3 gap-4">
                {campaign.startDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                    <p className="text-sm">{new Date(campaign.startDate).toLocaleDateString()}</p>
                  </div>
                )}

                {campaign.endDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                    <p className="text-sm">{new Date(campaign.endDate).toLocaleDateString()}</p>
                  </div>
                )}

                {campaign.applicationDeadline && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Application Deadline</h3>
                    <p className="text-sm">{new Date(campaign.applicationDeadline).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {campaign.deliverables && campaign.deliverables.length > 0 && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Deliverables</h2>

              <div className="space-y-3">
                {campaign.deliverables.map((deliverable, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm capitalize">{deliverable.type}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                          Qty: {deliverable.quantity}
                        </span>
                      </div>
                      {deliverable.requirements && (
                        <p className="text-xs text-gray-600">{deliverable.requirements}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience */}
          {campaign.targetAudience && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Target Audience</h2>

              <div className="grid grid-cols-2 gap-4">
                {campaign.targetAudience.minFollowers && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Follower Range</h3>
                    <p className="text-sm">
                      {campaign.targetAudience.minFollowers?.toLocaleString()}
                      {campaign.targetAudience.maxFollowers && ` - ${campaign.targetAudience.maxFollowers.toLocaleString()}`}
                    </p>
                  </div>
                )}

                {campaign.targetAudience.minEngagementRate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Min Engagement Rate</h3>
                    <p className="text-sm">{(campaign.targetAudience.minEngagementRate * 100).toFixed(2)}%</p>
                  </div>
                )}

                {campaign.targetAudience.ageRange && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Age Range</h3>
                    <p className="text-sm">
                      {campaign.targetAudience.ageRange.min} - {campaign.targetAudience.ageRange.max} years
                    </p>
                  </div>
                )}
              </div>

              {campaign.targetAudience.locations && campaign.targetAudience.locations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Locations</h3>
                  <div className="flex gap-2 flex-wrap">
                    {campaign.targetAudience.locations.map((location, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {campaign.targetAudience.languages && campaign.targetAudience.languages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Languages</h3>
                  <div className="flex gap-2 flex-wrap">
                    {campaign.targetAudience.languages.map((language, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {campaign.targetAudience.interests && campaign.targetAudience.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Interests</h3>
                  <div className="flex gap-2 flex-wrap">
                    {campaign.targetAudience.interests.map((interest, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campaign Settings & Brief */}
          {campaign.settings && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Campaign Settings</h2>

              {campaign.settings.campaignBrief && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Campaign Brief</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {campaign.settings.campaignBrief}
                  </p>
                </div>
              )}

              {campaign.settings.placements && campaign.settings.placements.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Placements</h3>
                  <div className="flex gap-2 flex-wrap">
                    {campaign.settings.placements.map((placement, idx) => (
                      <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                        {placement.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {campaign.settings.productLink && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Product Link</h3>
                  <a
                    href={campaign.settings.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {campaign.settings.productLink}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {campaign.settings.matchingAccuracy && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Matching Accuracy</h3>
                    <p className="text-sm capitalize">{campaign.settings.matchingAccuracy.replace(/_/g, ' ')}</p>
                  </div>
                )}

                {campaign.settings.postDateType && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Post Date Type</h3>
                    <p className="text-sm capitalize">{campaign.settings.postDateType}</p>
                  </div>
                )}

                {campaign.settings.autoApproveSubmissions !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Auto Approve Submissions</h3>
                    <p className="text-sm">{campaign.settings.autoApproveSubmissions ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>

              {campaign.settings.desiredInfluencerProfiles && campaign.settings.desiredInfluencerProfiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Desired Influencer Profiles</h3>
                  <div className="space-y-2">
                    {campaign.settings.desiredInfluencerProfiles.map((profile, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded text-sm text-gray-700">
                        {profile.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Brand Assets & Videos */}
          {(campaign.settings?.brandAssets || campaign.settings?.productExplainerVideo) && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Brand Assets & Media</h2>

              {campaign.settings.brandAssets && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Brand Assets</h3>
                  <a
                    href={campaign.settings.brandAssets}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    View Brand Assets
                  </a>
                </div>
              )}

              {campaign.settings.productExplainerVideo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Product Explainer Video</h3>
                  <div className="space-y-2">
                    <a
                      href={campaign.settings.productExplainerVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Watch Product Video
                    </a>

                    {/* Embed video if it's a YouTube link */}
                    {campaign.settings.productExplainerVideo.includes('youtube.com') ||
                      campaign.settings.productExplainerVideo.includes('youtu.be') ? (
                      <div className="mt-3">
                        <div className="aspect-video w-full max-w-2xl">
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={campaign.settings.productExplainerVideo.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            title="Product Explainer Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campaign Estimation */}
          {campaign.campaign_estimation && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Campaign Estimation</h2>

              {campaign.campaign_estimation.predicted_views && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Predicted Views</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">Minimum</p>
                      <p className="text-lg font-semibold text-blue-700">
                        {campaign.campaign_estimation.predicted_views.min?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">Average</p>
                      <p className="text-lg font-semibold text-green-700">
                        {campaign.campaign_estimation.predicted_views.average?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">Maximum</p>
                      <p className="text-lg font-semibold text-purple-700">
                        {campaign.campaign_estimation.predicted_views.max?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {campaign.campaign_estimation.cpm_range && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">CPM Range</h3>
                    <p className="text-sm">
                      ₹{campaign.campaign_estimation.cpm_range.min?.toFixed(2)} -
                      ₹{campaign.campaign_estimation.cpm_range.max?.toFixed(2)}
                    </p>
                  </div>

                  {campaign.campaign_estimation.cpc_range && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">CPC Range</h3>
                      <p className="text-sm">
                        ₹{campaign.campaign_estimation.cpc_range.min?.toFixed(2)} -
                        ₹{campaign.campaign_estimation.cpc_range.max?.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Metadata</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
                <p className="text-sm">{new Date(campaign.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                <p className="text-sm">{new Date(campaign.updatedAt).toLocaleString()}</p>
              </div>

              {campaign.invitations_sent_at && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Invitations Sent</h3>
                  <p className="text-sm">{new Date(campaign.invitations_sent_at).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Max Applications</h3>
                <p className="text-sm">{campaign.maxApplications || 'Unlimited'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Public Campaign</h3>
                <p className="text-sm">{campaign.isPublic ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Reports Section
  const renderReportsSection = () => {
    return <BrandReportContent campaignId={campaignId} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingCount = collaborations?.pending_confirmation?.length || 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        {/* Back Button */}
        <div className="p-4 border-b">
          <button
            onClick={() => navigate('/brand/campaigns')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Campaigns</span>
          </button>
        </div>



        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4">
          <button
            onClick={() => setActiveSection('collaboration')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-colors ${activeSection === 'collaboration'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Collaboration</span>
          </button>

          <button
            onClick={() => setActiveSection('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-colors ${activeSection === 'reports'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Report</span>
          </button>

          <button
            onClick={() => setActiveSection('budget')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-colors ${activeSection === 'budget'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">Budget</span>
          </button>

          <button
            onClick={() => setActiveSection('campaign-info')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-2 transition-colors ${activeSection === 'campaign-info'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Info className="w-5 h-5" />
            <span className="font-medium">Campaign info</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <p className="text-xs text-gray-500">Task</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Show Creator Profile if selected */}
        {selectedApplication ? (
          <CreatorProfileInline
            campaignId={campaignId}
            applicationId={selectedApplication}
            onBack={() => setSelectedApplication(null)}
          />
        ) : (
          <>
            {/* Render different sections based on activeSection */}
            {activeSection === 'collaboration' && (
              <>
                {/* Top Bar with To-dos cards */}
                <div className="bg-white border-b p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">To-dos</h1>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                        Add Filter
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <Settings className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* To-do Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    {(() => {
                      // Combine pending_confirmation and pending_review collaborations
                      const pendingConfirmation = collaborations?.pending_confirmation || [];
                      const pendingReview = collaborations?.pending_review || [];
                      const allTodos = [...pendingConfirmation, ...pendingReview];

                      // Take only first 4 items
                      const displayTodos = allTodos.slice(0, 4);

                      // If no todos, show empty state
                      if (displayTodos.length === 0) {
                        return (
                          <div className="col-span-4 text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm">No pending actions</p>
                            <p className="text-xs text-gray-400 mt-1">Updates will appear here when creators respond</p>
                          </div>
                        );
                      }

                      // Generate random colors for avatars
                      const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-pink-100', 'bg-yellow-100', 'bg-indigo-100'];

                      return displayTodos.map((collab, idx) => {
                        const isPendingConfirmation = pendingConfirmation.includes(collab);
                        const status = isPendingConfirmation ? 'Pending Confirmation' : 'Pending Review';
                        const color = colors[idx % colors.length];
                        const creatorName = collab.creator?.displayName || 'Unknown Creator';
                        const platform = collab.target_platform || 'N/A';
                        const matchScore = collab.match_score || 'N/A';
                        const updatedAt = collab.updatedAt ? new Date(collab.updatedAt).toLocaleDateString() : 'Recently';

                        return (
                          <div
                            key={collab._id || idx}
                            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedApplication(collab._id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              {collab.creator?.avatarUrl ? (
                                <img
                                  src={getProxiedImageUrl(collab.creator.avatarUrl)}
                                  alt={creatorName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
                                  <span className="text-lg font-semibold">{creatorName.charAt(0)}</span>
                                </div>
                              )}
                              {isPendingConfirmation && (
                                <div className="bg-yellow-500 rounded-full p-1" title="Needs Confirmation">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-semibold mb-1 truncate">{status}</p>
                            <p className="text-xs text-gray-600 mb-2 truncate">{creatorName}</p>
                            <div className="flex gap-1 mb-2">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded capitalize">
                                {platform}
                              </span>
                              <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">
                                {matchScore}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Updated: {updatedAt}</p>
                          </div>

                        );
                      });
                    })()
                    }
                  </div>
                </div>


                <div className="flex-1 overflow-auto p-6">
                  <div className="bg-white rounded-lg border">
                    {/* Section Header */}
                    <div className="p-4 border-b">
                      <h2 className="text-lg font-semibold">Influencer</h2>
                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={() => setActiveTab('invited_influencers')}
                          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'invited_influencers'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600'
                            }`}
                        >
                          Invited influencers
                        </button>
                        <button
                          onClick={() => setActiveTab('established_collaborations')}
                          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'established_collaborations'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600'
                            }`}
                        >
                          Established collaborations
                        </button>
                      </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="p-4 border-b bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search influencers or handle"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <select className="px-4 py-2 border rounded-lg text-sm">
                          <option>All statuses</option>
                        </select>
                        <select className="px-4 py-2 border rounded-lg text-sm">
                          <option>All categories</option>
                        </select>
                        <select className="px-4 py-2 border rounded-lg text-sm">
                          <option>All platforms</option>
                        </select>
                        <button className="p-2 border rounded-lg hover:bg-gray-100">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 border rounded-lg hover:bg-gray-100">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Status Tabs - Show for both tabs with different data */}
                    <div className="px-4 py-2 border-b bg-white">
                      <div className="flex gap-2 text-sm">
                        {activeTab === 'invited_influencers' ? (
                          <>
                            <button className="px-3 py-1 rounded bg-black text-white font-medium">
                              Pending Response {collaborations?.all?.filter(c => c.status === 'pending').length || 0}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setActiveStatusTab('pending_confirmation')}
                              className={`px-3 py-1 rounded font-medium transition-colors ${activeStatusTab === 'pending_confirmation'
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-100'
                                }`}
                            >
                              Pending Confirmation {collaborations?.pending_confirmation?.length || 0}
                            </button>
                            <button
                              onClick={() => setActiveStatusTab('pending_review')}
                              className={`px-3 py-1 rounded font-medium transition-colors ${activeStatusTab === 'pending_review'
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-100'
                                }`}
                            >
                              Pending Review {collaborations?.pending_review?.length || 0}
                            </button>
                            <button
                              onClick={() => setActiveStatusTab('published')}
                              className={`px-3 py-1 rounded font-medium transition-colors ${activeStatusTab === 'published'
                                ? 'bg-black text-white'
                                : 'hover:bg-gray-100'
                                }`}
                            >
                              Published {collaborations?.published?.length || 0}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Budget Info - Only show for Established Collaborations */}
                    {activeTab === 'established_collaborations' && (
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <p className="text-sm text-gray-600">
                          {collaborations?.all?.filter(c => c.status === 'accepted').length || 0} influencers selected
                        </p>
                        <div className="flex justify-end gap-2 mt-2">
                          <button className="px-4 py-1.5 text-sm border rounded hover:bg-white">
                            Reject
                          </button>
                          <button className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                            Approve
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left">
                              <input type="checkbox" className="rounded" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Platform</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Matching score ↑</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Offered Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Average Views</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">CPM</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Invited At</th>
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeTab === 'invited_influencers' && (
                            <>
                              {collaborations?.all?.filter(c => c.status === 'pending').length === 0 ? (
                                <tr>
                                  <td colSpan="10" className="px-4 py-12 text-center text-gray-500">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm">No invited influencers yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Invitations will appear here once sent</p>
                                  </td>
                                </tr>
                              ) : (
                                collaborations?.all?.filter(c => c.status === 'pending').map((collab, idx) => (
                                  <tr key={idx} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedApplication(collab._id)}>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                      <input type="checkbox" className="rounded" />
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        {collab.creator?.avatarUrl ? (
                                          <img
                                            src={getProxiedImageUrl(collab.creator.avatarUrl)}
                                            alt={collab.creator.displayName}
                                            className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                                          />
                                        ) : (
                                          <div
                                            className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-blue-500 transition-all"
                                          >
                                            {collab.creator?.displayName?.charAt(0) || 'N'}
                                          </div>
                                        )}
                                        <div>
                                          <p className="font-medium text-sm hover:text-blue-600 transition-colors">
                                            {collab.creator?.displayName || 'Unknown'}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {(() => { const h = collab.creator?.handle || collab.creator?.displayName?.toLowerCase().replace(/\s+/g, '') || 'handle'; return h.startsWith('@') ? h : '@' + h; })()}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded capitalize">
                                        {collab.target_platform || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                        Pending Response
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                                      {collab.match_score || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                                      ₹{collab.proposedRate?.toLocaleString() || '0'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {(() => {
                                        // Use placement_metrics if available (from invitation)
                                        if (collab.placement_metrics?.avg_views || collab.placement_metrics?.predicted_views) {
                                          const views = collab.placement_metrics.avg_views || collab.placement_metrics.predicted_views;
                                          return views.toLocaleString('en-IN');
                                        }

                                        // Fallback: Get from profileData
                                        const handle = collab.creator?.handles?.find(h => h.platform === collab.target_platform);
                                        const avgViews = handle?.profileData?.predictedViews ||
                                          handle?.profileData?.avgViews ||
                                          collab.creator?.platform_specific_metrics?.[collab.target_platform]?.avg_views;
                                        return avgViews ? avgViews.toLocaleString('en-IN') : 'N/A';
                                      })()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                                      {(() => {
                                        const cpm = getCpmValue(collab);
                                        return cpm ? `₹${cpm.toFixed(2)}` : 'N/A';
                                      })()}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                      {collab.invited_at
                                        ? new Date(collab.invited_at).toLocaleDateString()
                                        : new Date(collab.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center gap-2">
                                        <button
                                          className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                          title="View Profile"
                                        >
                                          <Star className="w-4 h-4" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-100 rounded">
                                          <MessageSquare className="w-4 h-4 text-gray-400" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-100 rounded">
                                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </>
                          )}

                          {activeTab === 'established_collaborations' && (
                            <>
                              {(() => {
                                // Filter collaborations based on active status tab
                                let filteredCollabs = [];
                                if (activeStatusTab === 'pending_confirmation') {
                                  filteredCollabs = collaborations?.pending_confirmation || [];
                                } else if (activeStatusTab === 'pending_review') {
                                  filteredCollabs = collaborations?.pending_review || [];
                                } else if (activeStatusTab === 'published') {
                                  filteredCollabs = collaborations?.published || [];
                                }

                                if (filteredCollabs.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan="10" className="px-4 py-12 text-center text-gray-500">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm">No collaborations in this status</p>
                                        <p className="text-xs text-gray-400 mt-1">Collaborations will appear here as they progress</p>
                                      </td>
                                    </tr>
                                  );
                                }

                                return filteredCollabs.map((collab, idx) => (
                                  <tr key={idx} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedApplication(collab._id)}>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                      <input type="checkbox" className="rounded" />
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        {collab.creator?.avatarUrl ? (
                                          <img
                                            src={getProxiedImageUrl(collab.creator.avatarUrl)}
                                            alt={collab.creator.displayName}
                                            className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                                          />
                                        ) : (
                                          <div
                                            className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-blue-500 transition-all"
                                          >
                                            {collab.creator?.displayName?.charAt(0) || 'N'}
                                          </div>
                                        )}
                                        <div>
                                          <p className="font-medium text-sm hover:text-blue-600 transition-colors">
                                            {collab.creator?.displayName || 'Unknown'}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {(() => { const h = collab.creator?.handle || collab.creator?.displayName?.toLowerCase().replace(/\s+/g, '') || 'handle'; return h.startsWith('@') ? h : '@' + h; })()}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded capitalize">
                                        {collab.target_platform || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-1 text-xs rounded ${activeStatusTab === 'pending_confirmation' ? 'bg-yellow-100 text-yellow-800' :
                                        activeStatusTab === 'pending_review' ? 'bg-blue-100 text-blue-800' :
                                          'bg-green-100 text-green-800'
                                        }`}>
                                        {activeStatusTab === 'pending_confirmation' ? 'Pending Confirmation' :
                                          activeStatusTab === 'pending_review' ? 'In Review' :
                                            'Published'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                                      {collab.match_score || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                                      ₹{collab.proposedRate?.toLocaleString() || '0'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {(() => {
                                        // Use placement_metrics if available (from invitation)
                                        if (collab.placement_metrics?.avg_views || collab.placement_metrics?.predicted_views) {
                                          const views = collab.placement_metrics.avg_views || collab.placement_metrics.predicted_views;
                                          return views.toLocaleString('en-IN');
                                        }

                                        // Fallback: Get from profileData
                                        const handle = collab.creator?.handles?.find(h => h.platform === collab.target_platform);
                                        const avgViews = handle?.profileData?.predictedViews ||
                                          handle?.profileData?.avgViews ||
                                          collab.creator?.platform_specific_metrics?.[collab.target_platform]?.avg_views;
                                        return avgViews ? avgViews.toLocaleString('en-IN') : 'N/A';
                                      })()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                                      {(() => {
                                        const cpm = getCpmValue(collab);
                                        return cpm ? `₹${cpm.toFixed(2)}` : 'N/A';
                                      })()}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                      {collab.confirmed_at
                                        ? new Date(collab.confirmed_at).toLocaleDateString()
                                        : collab.invited_at
                                          ? new Date(collab.invited_at).toLocaleDateString()
                                          : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                      {activeStatusTab === 'pending_confirmation' ? (
                                        // Show Accept/Reject buttons for pending confirmation
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleConfirm(collab._id);
                                            }}
                                            disabled={processingAction === collab._id}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Accept"
                                          >
                                            {processingAction === collab._id ? (
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <Check className="w-3 h-3" />
                                            )}
                                            Accept
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleReject(collab._id);
                                            }}
                                            disabled={processingAction === collab._id}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Reject"
                                          >
                                            {processingAction === collab._id ? (
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <X className="w-3 h-3" />
                                            )}
                                            Reject
                                          </button>
                                        </div>
                                      ) : (
                                        // Show regular action buttons for other statuses
                                        <div className="flex items-center gap-2">
                                          <button className="p-1 hover:bg-gray-100 rounded">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                          </button>
                                          <button className="p-1 hover:bg-gray-100 rounded">
                                            <MessageSquare className="w-4 h-4 text-gray-400" />
                                          </button>
                                          <button className="p-1 hover:bg-gray-100 rounded">
                                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </>
            )}

            {/* Budget Section */}
            {activeSection === 'budget' && renderBudgetSection()}

            {/* Reports Section */}
            {activeSection === 'reports' && renderReportsSection()}

            {/* Campaign Info Section */}
            {activeSection === 'campaign-info' && renderCampaignInfoSection()}
          </>
        )}
      </div>
    </div >
  );
};

export default CampaignCollaboration;

