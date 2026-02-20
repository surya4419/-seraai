import React, { useState } from 'react';
import geminiService from '../services/geminiService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const GeminiTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testGeminiConnection = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      // Test with a simple prompt
      const testProfile = {
        displayName: 'Test Creator',
        platform: 'instagram',
        profileData: {
          followersCount: 50000,
          engagementRate: 3.5,
          biography: 'Fashion and lifestyle content creator',
          categories: ['fashion', 'lifestyle'],
          location: 'United States'
        }
      };

      const testRateCard = {
        platformRates: [{
          platform: 'instagram',
          format: 'post',
          conservative: 150,
          expected: 250,
          premium: 400,
          confidence: 0.8
        }],
        overallConfidence: 0.8
      };

      const result = await geminiService.generateEnhancedRateCard(testProfile, testRateCard);
      setResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Gemini AI Integration Test
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${geminiService.isAvailable() ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              API Key: {geminiService.isAvailable() ? 'Available' : 'Missing'}
            </span>
          </div>
          
          <Button
            onClick={testGeminiConnection}
            disabled={testing || !geminiService.isAvailable()}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {testing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...</>
            ) : (
              <><Brain className="w-4 h-4 mr-2" /> Test Connection</>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-red-800">Test Failed</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="font-medium text-green-800">Test Successful!</div>
            </div>
            <div className="text-sm text-green-700">
              Gemini AI is working correctly. Generated enhanced rate card with confidence score: {(result.data?.confidenceScore * 100 || 0).toFixed(0)}%
            </div>
            {result.data?.marketIntelligence && (
              <div className="mt-2 text-xs text-green-600">
                Market analysis includes: {Object.keys(result.data.marketIntelligence).join(', ')}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>• This test verifies the Gemini API connection and rate card enhancement</div>
          <div>• Model: gemini-2.0-flash-exp</div>
          <div>• Features: Enhanced pricing, market intelligence, recommendations</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeminiTest;