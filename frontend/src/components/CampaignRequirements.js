import React, { useState } from 'react';
import {
    ArrowLeft, Users, DollarSign, CheckCircle, Star,
    Loader2, Upload, Video, UserPlus, X, Plus, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import axios from 'axios';

const CampaignRequirements = ({ onBack, onComplete, campaignData = {}, isEditMode = false, editingCampaignId = null }) => {
    const [requirements, setRequirements] = useState({
        // Audience Requirements
        minFollowers: [10000],
        maxFollowers: [100000],
        minEngagementRate: [2.0],
        targetAudience: {
            ageRange: [18, 35],
            gender: 'any', // 'male', 'female', 'any'
            interests: []
        },

        // Budget & Compensation
        budget: {
            type: 'fixed', // 'fixed', 'negotiable', 'performance'
            totalAmount: '',
            perCreatorAmount: '',
            currency: 'USD',
            paymentTerms: 'completion' // 'upfront', 'completion', 'milestone'
        },

        // Product Explainer Video
        productVideo: {
            hasVideo: false,
            videoFile: null,
            videoUrl: '',
            description: ''
        },

        // Reference Influencers
        referenceInfluencers: {
            uploadedList: null,
            manualList: [],
            currentInfluencer: ''
        },

        // Number of Creators
        numberOfCreators: {
            min: 1,
            max: 10,
            preferred: 5
        },



        // Additional Requirements
        additionalRequirements: ''
    });

    const [loading, setLoading] = useState(false);

    const handleRequirementChange = (path, value) => {
        setRequirements(prev => {
            const newReq = { ...prev };
            const keys = path.split('.');
            let current = newReq;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newReq;
        });
    };

    const addReferenceInfluencer = () => {
        if (requirements.referenceInfluencers.currentInfluencer.trim()) {
            const newList = [...requirements.referenceInfluencers.manualList, requirements.referenceInfluencers.currentInfluencer.trim()];
            handleRequirementChange('referenceInfluencers.manualList', newList);
            handleRequirementChange('referenceInfluencers.currentInfluencer', '');
        }
    };

    const removeReferenceInfluencer = (index) => {
        const newList = requirements.referenceInfluencers.manualList.filter((_, i) => i !== index);
        handleRequirementChange('referenceInfluencers.manualList', newList);
    };

    const handleVideoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith('video/')) {
                handleRequirementChange('productVideo.videoFile', file);
                handleRequirementChange('productVideo.hasVideo', true);
                toast.success('Video uploaded successfully');
            } else {
                toast.error('Please upload a valid video file');
            }
        }
    };

    const handleInfluencerListUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
                handleRequirementChange('referenceInfluencers.uploadedList', file);
                toast.success('Influencer list uploaded successfully');
            } else {
                toast.error('Please upload a CSV file');
            }
        }
    };

    const generateCampaignSummary = () => {
        // Extract data from all 3 sections: Basic Info, Campaign Details, and Requirements
        const summary = {
            // Basic Info (from campaignData)
            campaignName: campaignData.campaignName || 'Untitled Campaign',
            brand: campaignData.brandName || campaignData.brand || 'Your Brand',
            businessType: campaignData.businessType || 'General',
            serviceType: campaignData.serviceType || 'N/A',

            // Campaign Details (from campaignData)
            placements: campaignData.placements || [],
            locations: campaignData.locations || [],
            languages: campaignData.languages || [],
            postDate: campaignData.postDate || campaignData.postDatePeriod || 'TBD',
            campaignBrief: campaignData.campaignBrief || 'N/A',
            audienceLinks: campaignData.audienceLinks || [],

            // Requirements (from requirements state)
            budget: `${requirements.budget.currency} ${requirements.budget.totalAmount || requirements.budget.perCreatorAmount || 'TBD'}`,
            creators: `${requirements.numberOfCreators.min}-${requirements.numberOfCreators.max}`,
            audienceSize: `${requirements.minFollowers[0].toLocaleString()}-${requirements.maxFollowers[0].toLocaleString()}`,
            engagement: `${requirements.minEngagementRate[0]}%+`,
            targetAge: `${requirements.targetAudience.ageRange[0]}-${requirements.targetAudience.ageRange[1]} years`,
            targetGender: requirements.targetAudience.gender,
            paymentTerms: requirements.budget.paymentTerms,

            // Calculated metrics
            estimatedReach: Math.floor((requirements.minFollowers[0] + requirements.maxFollowers[0]) / 2 * requirements.numberOfCreators.preferred),
            estimatedCPM: requirements.budget.totalAmount ?
                Math.floor((parseFloat(requirements.budget.totalAmount) / (Math.floor((requirements.minFollowers[0] + requirements.maxFollowers[0]) / 2 * requirements.numberOfCreators.preferred / 1000)))) : 'TBD'
        };
        return summary;
    };

    const handleFinishCampaign = async () => {
        // Validation
        if (!requirements.budget.totalAmount && !requirements.budget.perCreatorAmount) {
            toast.error('Please specify the campaign budget');
            return;
        }

        if (requirements.numberOfCreators.min < 1) {
            toast.error('Please specify at least 1 creator required');
            return;
        }

        setLoading(true);
        try {
            const campaignSummary = generateCampaignSummary();
            const finalCampaignData = {
                ...campaignData,
                requirements,
                summary: campaignSummary,
                status: 'active' // Launch the campaign immediately
            };

            let response;
            
            if (isEditMode && editingCampaignId) {
                // Update existing campaign
                response = await axios.put(`/api/campaigns/${editingCampaignId}`, finalCampaignData);
            } else {
                // Create new campaign
                response = await axios.post('/api/campaigns', finalCampaignData);
            }

            if (response.data.success) {
                const successMessage = isEditMode 
                    ? '🚀 Campaign updated and relaunched successfully! It\'s now live and visible to creators.'
                    : '🚀 Campaign launched successfully! It\'s now live and visible to creators.';
                
                toast.success(successMessage);
                
                // Navigate to completion or back to dashboard
                if (onComplete) {
                    onComplete(response.data.campaign);
                } else if (onBack) {
                    onBack();
                }
            } else {
                throw new Error(response.data.error || `Failed to ${isEditMode ? 'update' : 'launch'} campaign`);
            }
        } catch (error) {
            console.error('Campaign creation error:', error);
            toast.error('Failed to create campaign. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Campaign Requirements
                            </h1>
                            <p className="text-slate-600 mt-1">Set your influencer criteria and campaign budget</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 px-3 py-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Step 3 of 3
                        </Badge>
                    </div>
                </div>

                {/* Audience Requirements */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Audience Requirements</h3>
                                <p className="text-sm text-slate-600 font-normal">Define your ideal influencer audience criteria</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        {/* Follower Count */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <label className="text-sm font-semibold text-slate-700">Follower Count Range</label>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-4 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-slate-600">Minimum Followers</span>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                                            {requirements.minFollowers[0].toLocaleString()}
                                        </Badge>
                                    </div>
                                    <Slider
                                        value={requirements.minFollowers}
                                        onValueChange={(value) => handleRequirementChange('minFollowers', value)}
                                        max={1000000}
                                        min={1000}
                                        step={1000}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-slate-600">Maximum Followers</span>
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                            {requirements.maxFollowers[0].toLocaleString()}
                                        </Badge>
                                    </div>
                                    <Slider
                                        value={requirements.maxFollowers}
                                        onValueChange={(value) => handleRequirementChange('maxFollowers', value)}
                                        max={10000000}
                                        min={requirements.minFollowers[0]}
                                        step={5000}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Engagement Rate */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <label className="text-sm font-semibold text-slate-700">Minimum Engagement Rate</label>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-slate-600">Engagement Rate</span>
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                        {requirements.minEngagementRate[0]}%
                                    </Badge>
                                </div>
                                <Slider
                                    value={requirements.minEngagementRate}
                                    onValueChange={(value) => handleRequirementChange('minEngagementRate', value)}
                                    max={15}
                                    min={0.5}
                                    step={0.1}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Age Range */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <label className="text-sm font-semibold text-slate-700">Target Age Range</label>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-slate-600">Age Range</span>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                                        {requirements.targetAudience.ageRange[0]} - {requirements.targetAudience.ageRange[1]} years
                                    </Badge>
                                </div>
                                <Slider
                                    value={requirements.targetAudience.ageRange}
                                    onValueChange={(value) => handleRequirementChange('targetAudience.ageRange', value)}
                                    max={65}
                                    min={13}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <label className="text-sm font-semibold text-slate-700">Target Gender</label>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { value: 'any', label: 'Any Gender', icon: '👥' },
                                    { value: 'male', label: 'Male', icon: '👨' },
                                    { value: 'female', label: 'Female', icon: '👩' }
                                ].map(option => (
                                    <label key={option.value} className={`
                                        flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${requirements.targetAudience.gender === option.value
                                            ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                                        }
                                    `}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={option.value}
                                            checked={requirements.targetAudience.gender === option.value}
                                            onChange={(e) => handleRequirementChange('targetAudience.gender', e.target.value)}
                                            className="sr-only"
                                        />
                                        <span className="text-lg">{option.icon}</span>
                                        <span className="text-sm font-medium text-slate-700">{option.label}</span>
                                        {requirements.targetAudience.gender === option.value && (
                                            <CheckCircle className="w-4 h-4 text-orange-600 ml-auto" />
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>


                    </CardContent>
                </Card>

                {/* Budget & Compensation */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100/50">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Budget & Compensation</h3>
                                <p className="text-sm text-slate-600 font-normal">Set your campaign budget and payment structure</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        {/* Budget Type */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <label className="text-sm font-semibold text-slate-700">Budget Type</label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { value: 'fixed', label: 'Fixed Amount', desc: 'Set price per influencer', icon: '💰', color: 'green' },
                                    { value: 'negotiable', label: 'Negotiable', desc: 'Open to proposals', icon: '🤝', color: 'blue' },
                                    { value: 'performance', label: 'Performance-based', desc: 'Pay based on results', icon: '📈', color: 'purple' }
                                ].map(option => (
                                    <label key={option.value} className={`
                                        flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${requirements.budget.type === option.value
                                            ? `border-${option.color}-300 bg-gradient-to-br from-${option.color}-50 to-${option.color}-100/50 shadow-sm`
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                                        }
                                    `}>
                                        <input
                                            type="radio"
                                            name="budgetType"
                                            value={option.value}
                                            checked={requirements.budget.type === option.value}
                                            onChange={(e) => handleRequirementChange('budget.type', e.target.value)}
                                            className="sr-only"
                                        />
                                        <span className="text-lg">{option.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                                                {requirements.budget.type === option.value && (
                                                    <CheckCircle className={`w-4 h-4 text-${option.color}-600`} />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 mt-1">{option.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Budget Amount */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <label className="text-sm font-semibold text-slate-700">Budget Details</label>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-xl p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Total Campaign Budget</label>
                                        <Input
                                            type="number"
                                            placeholder="Enter total budget"
                                            value={requirements.budget.totalAmount}
                                            onChange={(e) => handleRequirementChange('budget.totalAmount', e.target.value)}
                                            className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Per Creator Amount</label>
                                        <Input
                                            type="number"
                                            placeholder="Amount per creator"
                                            value={requirements.budget.perCreatorAmount}
                                            onChange={(e) => handleRequirementChange('budget.perCreatorAmount', e.target.value)}
                                            className="bg-white/80 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Currency</label>
                                        <select
                                            value={requirements.budget.currency}
                                            onChange={(e) => handleRequirementChange('budget.currency', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/80 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="CAD">CAD ($)</option>
                                            <option value="AUD">AUD ($)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Terms */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <label className="text-sm font-semibold text-slate-700">Payment Terms</label>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { value: 'upfront', label: '50% Upfront', icon: '⚡', desc: 'Pay half upfront' },
                                    { value: 'completion', label: 'On Completion', icon: '✅', desc: 'Pay after delivery' },
                                    { value: 'milestone', label: 'Milestone-based', icon: '🎯', desc: 'Pay in stages' }
                                ].map(option => (
                                    <label key={option.value} className={`
                                        flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${requirements.budget.paymentTerms === option.value
                                            ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                                        }
                                    `}>
                                        <input
                                            type="radio"
                                            name="paymentTerms"
                                            value={option.value}
                                            checked={requirements.budget.paymentTerms === option.value}
                                            onChange={(e) => handleRequirementChange('budget.paymentTerms', e.target.value)}
                                            className="sr-only"
                                        />
                                        <span className="text-lg">{option.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-700">{option.label}</span>
                                                {requirements.budget.paymentTerms === option.value && (
                                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Product Explainer Video */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center">
                                <Video className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Product Explainer Video</h3>
                                <p className="text-sm text-slate-600 font-normal">Upload a video to help influencers understand your product</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl p-4 space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <label className="text-sm font-semibold text-slate-700">Upload Video</label>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        className="hidden"
                                        id="video-upload"
                                    />
                                    <label
                                        htmlFor="video-upload"
                                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
                                    >
                                        <Upload className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm font-medium text-purple-700">Choose Video File</span>
                                    </label>
                                    {requirements.productVideo.videoFile && (
                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {requirements.productVideo.videoFile.name}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                    <label className="text-sm font-semibold text-slate-700">Or Video URL</label>
                                </div>
                                <Input
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={requirements.productVideo.videoUrl}
                                    onChange={(e) => handleRequirementChange('productVideo.videoUrl', e.target.value)}
                                    className="bg-white/80 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <label className="text-sm font-semibold text-slate-700">Video Description</label>
                                </div>
                                <Textarea
                                    placeholder="Describe what's in the video and key points for influencers..."
                                    value={requirements.productVideo.description}
                                    onChange={(e) => handleRequirementChange('productVideo.description', e.target.value)}
                                    className="min-h-[80px] bg-white/80 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reference Influencers */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100/50">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Reference Influencers</h3>
                                <p className="text-sm text-slate-600 font-normal">Upload or list influencers you'd like to work with or find similar ones</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-xl p-4 space-y-6">
                            {/* Upload CSV */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    <label className="text-sm font-semibold text-slate-700">Upload Influencer List (CSV)</label>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleInfluencerListUpload}
                                        className="hidden"
                                        id="influencer-upload"
                                    />
                                    <label
                                        htmlFor="influencer-upload"
                                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-orange-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all"
                                    >
                                        <Upload className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-medium text-orange-700">Upload CSV File</span>
                                    </label>
                                    {requirements.referenceInfluencers.uploadedList && (
                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {requirements.referenceInfluencers.uploadedList.name}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Manual Entry */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <label className="text-sm font-semibold text-slate-700">Or Add Manually</label>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="@username or influencer name"
                                        value={requirements.referenceInfluencers.currentInfluencer}
                                        onChange={(e) => handleRequirementChange('referenceInfluencers.currentInfluencer', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addReferenceInfluencer()}
                                        className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addReferenceInfluencer}
                                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                                        size="sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Listed Influencers */}
                            {requirements.referenceInfluencers.manualList.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <label className="text-sm font-semibold text-slate-700">Added Influencers</label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {requirements.referenceInfluencers.manualList.map((influencer, index) => (
                                            <Badge key={index} className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200 flex items-center gap-1 px-3 py-1">
                                                <span className="text-sm">👤</span>
                                                {influencer}
                                                <X
                                                    className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                                                    onClick={() => removeReferenceInfluencer(index)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Number of Creators Required */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100/50">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Number of Creators Required</h3>
                                <p className="text-sm text-slate-600 font-normal">Specify how many creators you want for this campaign</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-xl p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        <label className="text-sm font-semibold text-slate-700">Minimum</label>
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={requirements.numberOfCreators.min}
                                        onChange={(e) => handleRequirementChange('numberOfCreators.min', parseInt(e.target.value) || 1)}
                                        className="bg-white/80 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <label className="text-sm font-semibold text-slate-700">Maximum</label>
                                    </div>
                                    <Input
                                        type="number"
                                        min={requirements.numberOfCreators.min}
                                        value={requirements.numberOfCreators.max}
                                        onChange={(e) => handleRequirementChange('numberOfCreators.max', parseInt(e.target.value) || 1)}
                                        className="bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        <label className="text-sm font-semibold text-slate-700">Preferred</label>
                                    </div>
                                    <Input
                                        type="number"
                                        min={requirements.numberOfCreators.min}
                                        max={requirements.numberOfCreators.max}
                                        value={requirements.numberOfCreators.preferred}
                                        onChange={(e) => handleRequirementChange('numberOfCreators.preferred', parseInt(e.target.value) || 1)}
                                        className="bg-white/80 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>



                {/* Additional Requirements */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100/50">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white flex items-center justify-center">
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Additional Requirements</h3>
                                <p className="text-sm text-slate-600 font-normal">Any special instructions, guidelines, or additional information for influencers</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="bg-gradient-to-r from-yellow-50/50 to-orange-50/50 rounded-xl p-4">
                            <Textarea
                                placeholder="Enter any additional requirements, brand guidelines, content restrictions, hashtags to use, posting times, or special instructions for influencers..."
                                value={requirements.additionalRequirements}
                                onChange={(e) => handleRequirementChange('additionalRequirements', e.target.value)}
                                className="min-h-[120px] bg-white/80 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Campaign Summary Table */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-100/50">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-gray-700 text-white flex items-center justify-center">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Campaign Summary</h3>
                                <p className="text-sm text-slate-600 font-normal">Review your campaign details and estimated performance</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="bg-gradient-to-r from-slate-50/50 to-gray-50/50 rounded-xl p-4">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-200">
                                            <th className="text-left py-4 px-4 font-semibold text-slate-800">Metric</th>
                                            <th className="text-left py-4 px-4 font-semibold text-slate-800">Value</th>
                                            <th className="text-left py-4 px-4 font-semibold text-slate-800">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {/* Basic Info Section */}
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Brand Name</td>
                                            <td className="py-4 px-4 text-slate-900">{campaignData.brandName || campaignData.brand || 'Your Brand'}</td>
                                            <td className="py-4 px-4 text-sm text-slate-600">{campaignData.businessType || 'General'}</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Campaign Name</td>
                                            <td className="py-4 px-4 text-slate-900">{campaignData.campaignName || 'Untitled Campaign'}</td>
                                            <td className="py-4 px-4 text-sm text-slate-600">{campaignData.serviceType || 'N/A'}</td>
                                        </tr>

                                        {/* Campaign Details Section */}
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Placements</td>
                                            <td className="py-4 px-4 text-slate-900">
                                                {campaignData.placements?.length > 0
                                                    ? `${campaignData.placements.length} selected`
                                                    : 'TBD'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {campaignData.placements?.slice(0, 2).map(p => p.name).join(', ')}
                                                {campaignData.placements?.length > 2 && '...'}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Target Locations</td>
                                            <td className="py-4 px-4 text-slate-900">
                                                {campaignData.locations?.length > 0
                                                    ? `${campaignData.locations.length} locations`
                                                    : 'Global'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {campaignData.locations?.slice(0, 2).map(l => l.country).join(', ')}
                                                {campaignData.locations?.length > 2 && '...'}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Languages</td>
                                            <td className="py-4 px-4 text-slate-900">
                                                {campaignData.languages?.length > 0
                                                    ? `${campaignData.languages.length} languages`
                                                    : 'Any'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {campaignData.languages?.slice(0, 3).join(', ')}
                                                {campaignData.languages?.length > 3 && '...'}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Post Date</td>
                                            <td className="py-4 px-4 text-slate-900">
                                                {campaignData.postDate
                                                    ? new Date(campaignData.postDate).toLocaleDateString()
                                                    : campaignData.postDatePeriod?.start
                                                        ? `${new Date(campaignData.postDatePeriod.start).toLocaleDateString()} - ${new Date(campaignData.postDatePeriod.end).toLocaleDateString()}`
                                                        : 'TBD'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">Publishing timeline</td>
                                        </tr>

                                        {/* Requirements Section */}
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Total Budget</td>
                                            <td className="py-4 px-4 font-bold text-green-600">
                                                {requirements.budget.currency} {requirements.budget.totalAmount || requirements.budget.perCreatorAmount || 'TBD'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {requirements.budget.perCreatorAmount && `${requirements.budget.currency} ${requirements.budget.perCreatorAmount} per creator`}
                                                {requirements.budget.paymentTerms && ` • ${requirements.budget.paymentTerms}`}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Creators Required</td>
                                            <td className="py-4 px-4 text-slate-900">
                                                {requirements.numberOfCreators.min === requirements.numberOfCreators.max
                                                    ? requirements.numberOfCreators.min
                                                    : `${requirements.numberOfCreators.min}-${requirements.numberOfCreators.max}`}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                Preferred: {requirements.numberOfCreators.preferred}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Audience Size</td>
                                            <td className="py-4 px-4 text-slate-900">
                                                {requirements.minFollowers[0].toLocaleString()}-{requirements.maxFollowers[0].toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">Follower range</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Min Engagement</td>
                                            <td className="py-4 px-4 text-slate-900">{requirements.minEngagementRate[0]}%</td>
                                            <td className="py-4 px-4 text-sm text-slate-600">Minimum engagement rate</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Target Demographics</td>
                                            <td className="py-4 px-4 text-slate-900">
                                                {requirements.targetAudience.ageRange[0]}-{requirements.targetAudience.ageRange[1]} years
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {requirements.targetAudience.gender !== 'any' && `${requirements.targetAudience.gender}`}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Reference Influencers</td>
                                            <td className="py-4 px-4 text-slate-900">
                                                {requirements.referenceInfluencers.manualList.length > 0
                                                    ? `${requirements.referenceInfluencers.manualList.length} added`
                                                    : requirements.referenceInfluencers.uploadedList
                                                        ? 'CSV uploaded'
                                                        : 'None'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">For matching similar creators</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Product Video</td>
                                            <td className="py-4 px-4 text-slate-900">
                                                {requirements.productVideo.videoFile
                                                    ? 'Uploaded'
                                                    : requirements.productVideo.videoUrl
                                                        ? 'URL provided'
                                                        : 'None'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">For creator reference</td>
                                        </tr>

                                        {/* Calculated Metrics */}
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Estimated Reach</td>
                                            <td className="py-4 px-4 font-bold text-blue-600">
                                                {Math.floor((requirements.minFollowers[0] + requirements.maxFollowers[0]) / 2 * requirements.numberOfCreators.preferred).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">Total potential impressions</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-slate-700">Estimated CPM</td>
                                            <td className="py-4 px-4 font-bold text-purple-600">
                                                {requirements.budget.totalAmount ?
                                                    `${requirements.budget.currency} ${Math.floor((parseFloat(requirements.budget.totalAmount) / (Math.floor((requirements.minFollowers[0] + requirements.maxFollowers[0]) / 2 * requirements.numberOfCreators.preferred / 1000))))}`
                                                    : 'TBD'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">Cost per thousand impressions</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Finish Campaign */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                    <div className="mb-4 sm:mb-0">
                        <h4 className="text-lg font-semibold text-slate-900 mb-1">
                            {isEditMode ? 'Ready to Relaunch?' : 'Ready to Launch?'}
                        </h4>
                        <p className="text-sm text-slate-600">
                            {isEditMode 
                                ? 'Review all updated details above and relaunch your campaign with new settings'
                                : 'Review all details above and launch your campaign to start finding creators'
                            }
                        </p>
                    </div>
                    <Button
                        onClick={handleFinishCampaign}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        {loading 
                            ? (isEditMode ? 'Updating Campaign...' : 'Launching Campaign...')
                            : (isEditMode ? 'Update & Relaunch' : 'Launch Campaign')
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CampaignRequirements;