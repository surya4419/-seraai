import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, MousePointer, Eye, Info, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import { toast } from 'sonner';

/**
 * Campaign Estimation Component
 * Shows real-time budget-based campaign predictions
 */
export default function CampaignEstimation({ budget, onBudgetChange, onEstimationComplete }) {
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localBudget, setLocalBudget] = useState(budget || '');
  const [showDetails, setShowDetails] = useState(true); // Open by default

  // Debounce budget changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localBudget && parseInt(localBudget) >= 10000) {
        fetchEstimation(parseInt(localBudget));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localBudget]);

  const fetchEstimation = async (budgetAmount) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/enhanced-matching/estimate', {
        budget: budgetAmount
      });

      if (response.data.success) {
        setEstimation(response.data.estimation);
        if (onEstimationComplete) {
          onEstimationComplete(response.data.estimation);
        }
      }
    } catch (error) {
      console.error('Estimation error:', error);
      toast.error('Failed to calculate estimation');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setLocalBudget(value);
    if (onBudgetChange) {
      onBudgetChange(value);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Budget Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Budget
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
          <Input
            type="text"
            value={localBudget}
            onChange={handleBudgetChange}
            placeholder="Enter budget (minimum ₹10,000)"
            className="pl-8 text-lg"
          />
        </div>
        {localBudget && parseInt(localBudget) < 10000 && (
          <p className="text-sm text-red-600 mt-2">
            Minimum campaign budget is ₹10,000
          </p>
        )}
      </div>

      {/* Estimation Results */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {estimation && !loading && (
        <div className="space-y-6">
          {/* Estimated Campaign Results Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Estimated campaign results
              </h3>
            </div>

            {/* Key Metrics in Single Row */}
            <div className="grid grid-cols-4 gap-6">
              {/* Views */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Views</div>
                <div className="text-xl font-semibold text-gray-900">
                  {estimation.predicted_views.display}
                </div>
              </div>

              {/* CPM */}
              <div>
                <div className="text-sm text-gray-600 mb-1">CPM</div>
                <div className="text-xl font-semibold text-gray-900">
                  {estimation.cpm_range.display}
                </div>
              </div>

              {/* Clicks */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Clicks</div>
                <div className="text-xl font-semibold text-gray-900">
                  {estimation.predicted_clicks.display}
                </div>
              </div>

              {/* CPC */}
              <div>
                <div className="text-sm text-gray-600 mb-1">CPC</div>
                <div className="text-xl font-semibold text-gray-900">
                  {estimation.cpc_range?.display || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                CPM across different platforms
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>

            {showDetails && (
              <div className="space-y-3">
                {estimation.platform_breakdown.map((platform, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="text-sm text-gray-700 capitalize">
                      {platform.platform} {platform.content_type.replace('_', ' ')}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {platform.display}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
