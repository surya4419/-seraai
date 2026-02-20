import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
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

const CampaignBudget = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(null);
  
  useEffect(() => {
    fetchBudget();
  }, [campaignId]);
  
  const fetchBudget = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/campaign-collaboration/${campaignId}/budget`);
      setBudget(response.data.budget);
    } catch (error) {
      console.error('Error fetching budget:', error);
      toast.error('Failed to load budget information');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budget...</p>
        </div>
      </div>
    );
  }
  
  if (!budget) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No budget information available</p>
      </div>
    );
  }
  
  // Prepare data for pie chart
  const pieData = [
    { name: 'Committed', value: budget.committed, color: '#f97316' },
    { name: 'In Negotiation', value: budget.in_negotiation, color: '#eab308' },
    { name: 'Withheld', value: budget.withheld, color: '#3b82f6' },
    { name: 'Released', value: budget.released, color: '#22c55e' },
    { name: 'Available', value: budget.available, color: '#94a3b8' }
  ].filter(item => item.value > 0);
  
  // Prepare data for bar chart (creators)
  const barData = budget.creators.map(creator => ({
    name: creator.creator_name,
    amount: creator.final_rate,
    status: creator.payment_status
  }));
  
  const COLORS = ['#f97316', '#eab308', '#3b82f6', '#22c55e', '#94a3b8'];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/brand/campaigns')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Budget Overview</h1>
              <p className="text-sm text-gray-600">Track your campaign spending</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Budget Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Budget</p>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold">₹{budget.total_budget.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Campaign allocation</p>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Committed</p>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600">₹{budget.committed.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {budget.committed_percentage.toFixed(1)}% of total
            </p>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Released</p>
              <TrendingDown className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">₹{budget.released.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Paid to creators</p>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Available</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">₹{budget.available.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {budget.available_percentage.toFixed(1)}% remaining
            </p>
          </div>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Budget Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Bar Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Creator Payments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Budget Breakdown */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Budget Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Invitation Budget (80%)</p>
                <p className="text-sm text-gray-600">For initial creator invitations</p>
              </div>
              <p className="text-xl font-bold">₹{budget.invitation_budget.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Negotiation Buffer (20%)</p>
                <p className="text-sm text-gray-600">Reserved for price negotiations</p>
              </div>
              <p className="text-xl font-bold">₹{budget.negotiation_buffer.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Creator List */}
        <div className="bg-white rounded-lg border p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Creator Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Creator</th>
                  <th className="text-left py-3 px-4">Platform</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Proposed Rate</th>
                  <th className="text-right py-3 px-4">Final Rate</th>
                  <th className="text-left py-3 px-4">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {budget.creators.map((creator, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{creator.creator_name}</td>
                    <td className="py-3 px-4 capitalize">{creator.platform}</td>
                    <td className="py-3 px-4 capitalize">{creator.status}</td>
                    <td className="py-3 px-4 text-right">₹{creator.proposed_rate.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">₹{creator.final_rate.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        creator.payment_status === 'released' ? 'bg-green-100 text-green-800' :
                        creator.payment_status === 'withheld' ? 'bg-blue-100 text-blue-800' :
                        creator.payment_status === 'committed' ? 'bg-orange-100 text-orange-800' :
                        creator.payment_status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {creator.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignBudget;
