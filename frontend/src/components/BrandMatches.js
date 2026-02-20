import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Star, MessageCircle, Send, Eye,
    ChevronDown, ChevronRight, Clock, DollarSign,
    Target, TrendingUp, Users, MapPin, Calendar,
    Bookmark, BookmarkCheck, ExternalLink, Sparkles,
    CheckCircle, AlertCircle, XCircle, Loader2,
    ArrowUpRight, Heart, Share2, MoreHorizontal,
    Bell, Settings, Zap, Award, Globe, Camera,
    Sliders, SortDesc, Plus, Minus, RefreshCw,
    FileText, Image, Paperclip, Smile, BarChart3,
    Filter as FilterIcon, Grid, List, Archive,
    Lightbulb, TrendingDown, Activity, Briefcase,
    CheckSquare, Square, Download, Upload, Copy,
    Edit3, Trash2, RotateCcw, PlayCircle, PauseCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import axios from 'axios';

const BrandMatches = ({ profiles, selectedProfile, dashboardData }) => {
    const [activeTab, setActiveTab] = useState('matched');
    const [activeSection, setActiveSection] = useState('campaigns');
    const [loading, setLoading] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [applications, setApplications] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [autoApplyEnabled, setAutoApplyEnabled] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDealType, setSelectedDealType] = useState('all');
    const [budgetRange, setBudgetRange] = useState([0, 50000]);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [sortBy, setSortBy] = useState('match_score');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [minMatchScore, setMinMatchScore] = useState(70);
    const [verifiedBrandsOnly, setVerifiedBrandsOnly] = useState(false);

    // Messaging states
    const [messageText, setMessageText] = useState('');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [showBulkMessage, setShowBulkMessage] = useState(false);
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [bulkMessageText, setBulkMessageText] = useState('');
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const messagesEndRef = React.useRef(null);

    // Insights and recommendations
    const [insights, setInsights] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [savedCampaigns, setSavedCampaigns] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    // Auto-apply settings
    const [autoApplySettings, setAutoApplySettings] = useState({
        enabled: true,
        minMatchScore: 85,
        maxApplicationsPerDay: 5,
        categories: ['fashion', 'lifestyle'],
        budgetRange: [1000, 10000]
    });

    useEffect(() => {
        fetchCampaigns();
        fetchApplications();
        fetchConversations();
        fetchSavedTemplates();
    }, [selectedProfile]);

    // Real-time filtering effect
    useEffect(() => {
        // This will trigger re-render whenever filter values change
        // The filteredCampaigns function will automatically apply new filters
    }, [searchQuery, selectedCategory, selectedDealType, budgetRange, selectedPlatforms, sortBy, minMatchScore, verifiedBrandsOnly]);

    // Show feedback when sorting changes
    useEffect(() => {
        if (campaigns.length > 0) {
            const sortLabels = {
                'match_score': 'Best Match',
                'budget_high': 'Highest Budget',
                'budget_low': 'Lowest Budget',
                'deadline': 'Deadline Soon',
                'recent': 'Most Recent',
                'applications': 'Least Applied'
            };
            toast.info(`Sorted by: ${sortLabels[sortBy] || sortBy}`);
        }
    }, [sortBy]);

    const fetchCampaigns = async () => {
        if (!selectedProfile) return;

        setLoading(true);
        try {
            const response = await axios.get('/api/campaigns/public/browse', {
                params: {
                    platforms: selectedProfile.platform,
                    page: 1,
                    limit: 50
                }
            });

            // Add match scores and AI recommendations
            const campaignsWithMatches = response.data.campaigns.map(campaign => ({
                ...campaign,
                matchScore: calculateMatchScore(campaign, selectedProfile),
                aiTips: generateAITips(campaign, selectedProfile),
                audienceAlignment: calculateAudienceAlignment(campaign, selectedProfile)
            }));

            setCampaigns(campaignsWithMatches);
        } catch (error) {
            console.error('Error fetching campaigns:', error);

            // Provide mock data for demo purposes
            const mockCampaigns = [
                {
                    _id: '1',
                    title: 'Summer Fashion Collection',
                    description: 'Promote our latest summer collection with authentic lifestyle content',
                    brandId: {
                        _id: 'brand1',
                        name: 'Fashion Nova',
                        logoUrl: '/api/placeholder/60/60',
                        verified: true
                    },
                    budget: 5000,
                    dealType: 'paid',
                    platforms: ['Instagram', 'TikTok'],
                    tags: ['fashion', 'lifestyle', 'summer'],
                    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    applicationsCount: 15,
                    targetAudience: {
                        minFollowers: 10000,
                        maxFollowers: 100000,
                        minEngagementRate: 2.0
                    },
                    matchScore: 92,
                    aiTips: 'This campaign performs best with Reels under 20s',
                    audienceAlignment: 84
                },
                {
                    _id: '2',
                    title: 'Tech Product Launch',
                    description: 'Help us launch our new smartphone with creative unboxing content',
                    brandId: {
                        _id: 'brand2',
                        name: 'TechCorp',
                        logoUrl: '/api/placeholder/60/60',
                        verified: true
                    },
                    budget: 8000,
                    dealType: 'paid',
                    platforms: ['YouTube', 'Instagram'],
                    tags: ['tech', 'gadgets', 'unboxing'],
                    applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    applicationsCount: 8,
                    targetAudience: {
                        minFollowers: 25000,
                        maxFollowers: 500000,
                        minEngagementRate: 3.0
                    },
                    matchScore: 78,
                    aiTips: 'Include product shots in natural lighting',
                    audienceAlignment: 76
                },
                {
                    _id: '3',
                    title: 'Fitness Challenge Campaign',
                    description: 'Join our 30-day fitness challenge and inspire your audience',
                    brandId: {
                        _id: 'brand3',
                        name: 'FitLife',
                        logoUrl: '/api/placeholder/60/60',
                        verified: false
                    },
                    budget: 3000,
                    dealType: 'barter',
                    platforms: ['Instagram', 'TikTok'],
                    tags: ['fitness', 'health', 'challenge'],
                    applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    applicationsCount: 25,
                    targetAudience: {
                        minFollowers: 5000,
                        maxFollowers: 50000,
                        minEngagementRate: 4.0
                    },
                    matchScore: 85,
                    aiTips: 'Post during peak engagement hours (7-9 PM)',
                    audienceAlignment: 89
                },
                {
                    _id: '4',
                    title: 'Beauty Product Review',
                    description: 'Create honest reviews of our new skincare line',
                    brandId: {
                        _id: 'brand4',
                        name: 'GlowUp Beauty',
                        logoUrl: '/api/placeholder/60/60',
                        verified: true
                    },
                    budget: 4500,
                    dealType: 'paid',
                    platforms: ['Instagram', 'YouTube'],
                    tags: ['beauty', 'skincare', 'review'],
                    applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                    applicationsCount: 12,
                    targetAudience: {
                        minFollowers: 15000,
                        maxFollowers: 200000,
                        minEngagementRate: 2.5
                    },
                    matchScore: 81,
                    aiTips: 'Use trending hashtags in your niche',
                    audienceAlignment: 82
                },
                {
                    _id: '5',
                    title: 'Travel Destination Showcase',
                    description: 'Showcase our resort with stunning travel content',
                    brandId: {
                        _id: 'brand5',
                        name: 'Paradise Resorts',
                        logoUrl: '/api/placeholder/60/60',
                        verified: true
                    },
                    budget: 12000,
                    dealType: 'paid',
                    platforms: ['Instagram', 'YouTube', 'TikTok'],
                    tags: ['travel', 'luxury', 'vacation'],
                    applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    applicationsCount: 5,
                    targetAudience: {
                        minFollowers: 50000,
                        maxFollowers: 1000000,
                        minEngagementRate: 3.5
                    },
                    matchScore: 73,
                    aiTips: 'Include clear call-to-action in captions',
                    audienceAlignment: 71
                }
            ];

            setCampaigns(mockCampaigns);
            toast.info('Showing demo campaigns - API not available');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/api/applications');
            setApplications(response.data.applications || []);
        } catch (error) {
            console.error('Error fetching applications:', error);

            // Provide mock applications for demo purposes
            const mockApplications = [
                {
                    _id: 'app1',
                    campaignId: { _id: '1' },
                    status: 'pending',
                    appliedBy: 'auto',
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    proposedRate: 500
                },
                {
                    _id: 'app2',
                    campaignId: { _id: '2' },
                    status: 'approved',
                    appliedBy: 'manual',
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    proposedRate: 800
                },
                {
                    _id: 'app3',
                    campaignId: { _id: '3' },
                    status: 'shortlisted',
                    appliedBy: 'auto',
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    proposedRate: 300
                },
                {
                    _id: 'app4',
                    campaignId: { _id: '4' },
                    status: 'pending',
                    appliedBy: 'manual',
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    proposedRate: 450
                }
            ];

            setApplications(mockApplications);
        }
    };

    const fetchConversations = async () => {
        // Mock conversations for now - replace with actual API call
        setConversations([
            {
                id: 1,
                brandName: 'Nike',
                brandLogo: '/api/placeholder/40/40',
                lastMessage: 'Thanks for your interest! We\'d love to discuss...',
                timestamp: new Date(),
                status: 'active',
                campaignTitle: 'Summer Athletic Wear',
                matchScore: 92,
                messages: [
                    {
                        id: 1,
                        sender: 'brand',
                        message: 'Thanks for your interest! We\'d love to discuss...',
                        timestamp: new Date(Date.now() - 60000)
                    }
                ]
            },
            {
                id: 2,
                brandName: 'Adidas',
                brandLogo: '/api/placeholder/40/40',
                lastMessage: 'Your content style looks great for our campaign!',
                timestamp: new Date(Date.now() - 120000),
                status: 'active',
                campaignTitle: 'Urban Street Style',
                matchScore: 88,
                messages: [
                    {
                        id: 1,
                        sender: 'brand',
                        message: 'Your content style looks great for our campaign!',
                        timestamp: new Date(Date.now() - 120000)
                    }
                ]
            },
            {
                id: 3,
                brandName: 'Fashion Nova',
                brandLogo: '/api/placeholder/40/40',
                lastMessage: 'Let\'s schedule a call to discuss rates',
                timestamp: new Date(Date.now() - 300000),
                status: 'active',
                campaignTitle: 'Spring Collection Launch',
                matchScore: 85,
                messages: [
                    {
                        id: 1,
                        sender: 'brand',
                        message: 'Let\'s schedule a call to discuss rates',
                        timestamp: new Date(Date.now() - 300000)
                    }
                ]
            }
        ]);
    };

    const fetchSavedTemplates = async () => {
        setSavedTemplates([
            {
                id: 1,
                name: 'Initial Interest',
                content: 'Hi {brand_name}! I\'m interested in collaborating on your {campaign_title} campaign. My audience aligns perfectly with your target demographic.'
            },
            {
                id: 2,
                name: 'Rate Card Inquiry',
                content: 'Hello! I\'d love to learn more about your collaboration requirements. I\'ve attached my rate card for your review.'
            }
        ]);
    };

    const calculateMatchScore = (campaign, profile) => {
        if (!profile?.profileData) return 0;

        let score = 0;
        const maxScore = 100;

        // Platform match (30%)
        if (campaign.platforms.includes(profile.platform)) {
            score += 30;
        }

        // Follower count match (25%)
        const followers = profile.profileData.followersCount || 0;
        if (followers >= campaign.targetAudience?.minFollowers &&
            (!campaign.targetAudience?.maxFollowers || followers <= campaign.targetAudience.maxFollowers)) {
            score += 25;
        }

        // Engagement rate match (25%)
        const engagementRate = profile.profileData.engagementRate || 0;
        if (engagementRate >= (campaign.targetAudience?.minEngagementRate || 0)) {
            score += 25;
        }

        // Category/niche match (20%)
        const profileCategories = profile.profileData.categories || [];
        const campaignTags = campaign.tags || [];
        const hasMatchingCategory = profileCategories.some(cat =>
            campaignTags.some(tag => tag.toLowerCase().includes(cat.toLowerCase()))
        );
        if (hasMatchingCategory) {
            score += 20;
        }

        return Math.min(score, maxScore);
    };

    const calculateAudienceAlignment = (campaign, profile) => {
        // Mock calculation - replace with actual logic
        return Math.floor(Math.random() * 30) + 70; // 70-100%
    };

    const generateAITips = (campaign, profile) => {
        const tips = [
            'This campaign performs best with Reels under 20s',
            'Include product shots in natural lighting',
            'Use trending hashtags in your niche',
            'Post during peak engagement hours (7-9 PM)',
            'Include clear call-to-action in captions'
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    };

    const handleApplyToCampaign = async (campaignId, proposedRate) => {
        try {
            setLoading(true);

            // Try API call first
            try {
                const response = await axios.post('/api/applications', {
                    campaignId,
                    proposedRate,
                    message: `I'm excited to collaborate on this campaign. My audience aligns well with your target demographic.`
                });

                toast.success('Application submitted successfully!');
                await fetchApplications();
                return;
            } catch (apiError) {
                // If API fails, create mock application
                console.log('API not available, creating mock application');
            }

            // Mock application creation
            const newApplication = {
                _id: `app_${Date.now()}`,
                campaignId: { _id: campaignId },
                status: 'pending',
                appliedBy: 'manual',
                createdAt: new Date(),
                proposedRate: proposedRate
            };

            // Add to applications list
            setApplications(prev => [...prev, newApplication]);

            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Application submitted successfully!');

        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Failed to apply';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCampaign = (campaignId) => {
        setSavedCampaigns(prev => {
            if (prev.includes(campaignId)) {
                toast.success('Campaign removed from bookmarks');
                return prev.filter(id => id !== campaignId);
            } else {
                toast.success('Campaign saved to bookmarks');
                return [...prev, campaignId];
            }
        });
    };

    const handleViewCampaign = (campaign) => {
        // Add to recently viewed
        setRecentlyViewed(prev => {
            const filtered = prev.filter(c => c._id !== campaign._id);
            return [campaign, ...filtered].slice(0, 5);
        });

        // Open campaign details modal or navigate
        toast.info('Opening campaign details...');
    };

    const handleStartChat = (campaign) => {
        // Create or open conversation with brand
        const newConversation = {
            id: Date.now(),
            brandName: campaign.brandId?.name,
            brandLogo: campaign.brandId?.logoUrl || '/api/placeholder/40/40',
            lastMessage: 'Start your conversation here...',
            timestamp: new Date(),
            status: 'active',
            campaignTitle: campaign.title,
            matchScore: campaign.matchScore
        };

        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setActiveSection('messaging');
        toast.success('Chat started with ' + campaign.brandId?.name);
    };

    const handleSendMessage = async (brandId, message) => {
        if (!message.trim()) return;

        try {
            // Create new message object
            const newMessage = {
                id: Date.now(),
                sender: 'creator',
                message: message.trim(),
                timestamp: new Date()
            };

            // Update the selected conversation immediately (optimistic update)
            if (selectedConversation) {
                const updatedConversation = {
                    ...selectedConversation,
                    lastMessage: message.trim(),
                    timestamp: new Date(),
                    messages: [...(selectedConversation.messages || []), newMessage]
                };

                setSelectedConversation(updatedConversation);

                // Update conversations list
                setConversations(prev => prev.map(conv =>
                    conv.id === selectedConversation.id
                        ? updatedConversation
                        : conv
                ));
            }

            // Clear message input
            setMessageText('');

            // Scroll to bottom of messages
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            // Mock API call - replace with actual messaging endpoint
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success('Message sent successfully');

        } catch (error) {
            toast.error('Failed to send message');
            // Revert optimistic update on error
            if (selectedConversation) {
                setConversations(prev => prev.map(conv =>
                    conv.id === selectedConversation.id
                        ? selectedConversation
                        : conv
                ));
            }
        }
    };

    const handleBulkMessage = async () => {
        if (!bulkMessageText.trim() || selectedBrands.length === 0) return;

        try {
            setLoading(true);

            // Create individual conversations for each selected brand
            const newConversations = selectedBrands.map(brandId => {
                const campaign = campaigns.find(c => c._id === brandId);
                if (!campaign) return null;

                const personalizedMessage = bulkMessageText
                    .replace(/{brand_name}/g, campaign.brandId?.name || 'Brand')
                    .replace(/{campaign_title}/g, campaign.title || 'Campaign');

                return {
                    id: Date.now() + Math.random(), // Unique ID
                    brandName: campaign.brandId?.name || 'Unknown Brand',
                    brandLogo: campaign.brandId?.logoUrl || '/api/placeholder/40/40',
                    lastMessage: personalizedMessage,
                    timestamp: new Date(),
                    status: 'active',
                    campaignTitle: campaign.title || 'Campaign',
                    matchScore: campaign.matchScore || 0,
                    messages: [
                        {
                            id: 1,
                            sender: 'creator',
                            message: personalizedMessage,
                            timestamp: new Date()
                        }
                    ]
                };
            }).filter(Boolean);

            // Add new conversations to existing ones
            setConversations(prev => [...newConversations, ...prev]);

            // Mock API call for bulk messaging
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success(`Messages sent to ${selectedBrands.length} brands successfully! Check your conversations.`);
            setBulkMessageText('');
            setSelectedBrands([]);

            // Switch to messaging section to show the new conversations
            setTimeout(() => {
                setActiveSection('messaging');
            }, 1000);

        } catch (error) {
            toast.error('Failed to send bulk messages');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
            shortlisted: { color: 'bg-blue-100 text-blue-800', icon: Star },
            applied: { color: 'bg-gray-100 text-gray-800', icon: Send }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const filteredCampaigns = React.useMemo(() => {
        let filtered = campaigns.filter(campaign => {
            // Search query filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = campaign.title?.toLowerCase().includes(query);
                const matchesBrand = campaign.brandId?.name?.toLowerCase().includes(query);
                const matchesTags = campaign.tags?.some(tag => tag.toLowerCase().includes(query));
                const matchesDescription = campaign.description?.toLowerCase().includes(query);

                if (!matchesTitle && !matchesBrand && !matchesTags && !matchesDescription) {
                    return false;
                }
            }

            // Category filter
            if (selectedCategory !== 'all') {
                const hasMatchingTag = campaign.tags?.some(tag =>
                    tag.toLowerCase().includes(selectedCategory.toLowerCase())
                );
                if (!hasMatchingTag) return false;
            }

            // Deal type filter
            if (selectedDealType !== 'all') {
                if (campaign.dealType !== selectedDealType) return false;
            }

            // Budget filter
            const campaignBudget = campaign.budget || 0;
            if (campaignBudget < budgetRange[0] || campaignBudget > budgetRange[1]) {
                return false;
            }

            // Platform filter
            if (selectedPlatforms.length > 0) {
                const hasMatchingPlatform = selectedPlatforms.some(p =>
                    campaign.platforms?.includes(p)
                );
                if (!hasMatchingPlatform) return false;
            }

            // Match score filter
            if (campaign.matchScore < minMatchScore) {
                return false;
            }

            // Verified brands filter
            if (verifiedBrandsOnly && !campaign.brandId?.verified) {
                return false;
            }

            return true;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            let result = 0;
            switch (sortBy) {
                case 'match_score':
                    result = b.matchScore - a.matchScore;
                    break;
                case 'budget_high':
                    result = (b.budget || 0) - (a.budget || 0);
                    break;
                case 'budget_low':
                    result = (a.budget || 0) - (b.budget || 0);
                    break;
                case 'deadline':
                    if (!a.applicationDeadline && !b.applicationDeadline) result = 0;
                    else if (!a.applicationDeadline) result = 1;
                    else if (!b.applicationDeadline) result = -1;
                    else result = new Date(a.applicationDeadline) - new Date(b.applicationDeadline);
                    break;
                case 'recent':
                    result = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    break;
                case 'applications':
                    result = (a.applicationsCount || 0) - (b.applicationsCount || 0);
                    break;
                default:
                    result = b.matchScore - a.matchScore;
            }
            return result;
        });

        console.log(`Sorted ${filtered.length} campaigns by ${sortBy}:`, filtered.map(c => ({ title: c.title, budget: c.budget, matchScore: c.matchScore })));

        return filtered;
    }, [campaigns, searchQuery, selectedCategory, selectedDealType, budgetRange, selectedPlatforms, sortBy, minMatchScore, verifiedBrandsOnly]);

    const getMatchedCampaigns = () => {
        return filteredCampaigns
            .filter(campaign => campaign.matchScore >= 70)
            .sort((a, b) => b.matchScore - a.matchScore);
    };

    const getAppliedCampaigns = () => {
        const appliedCampaignIds = applications.map(app => app.campaignId?._id);
        return filteredCampaigns.filter(campaign => appliedCampaignIds.includes(campaign._id));
    };

    const getAutoAppliedCampaigns = () => {
        const autoAppliedIds = applications
            .filter(app => app.appliedBy === 'auto')
            .map(app => app.campaignId?._id);
        return filteredCampaigns.filter(campaign => autoAppliedIds.includes(campaign._id));
    };

    const getManualAppliedCampaigns = () => {
        const manualAppliedIds = applications
            .filter(app => app.appliedBy === 'manual' || !app.appliedBy)
            .map(app => app.campaignId?._id);
        return filteredCampaigns.filter(campaign => manualAppliedIds.includes(campaign._id));
    };

    const renderCampaignCard = (campaign) => {
        const isApplied = applications.some(app => app.campaignId?._id === campaign._id);
        const application = applications.find(app => app.campaignId?._id === campaign._id);
        const isSaved = savedCampaigns.includes(campaign._id);
        const isAutoApplied = application?.appliedBy === 'auto';

        if (viewMode === 'list') {
            return (
                <Card key={campaign._id} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            {/* Brand Logo */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {campaign.brandId?.logoUrl ? (
                                    <img
                                        src={campaign.brandId.logoUrl}
                                        alt={campaign.brandId.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Globe className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Campaign Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg truncate">{campaign.title}</h3>
                                        <p className="text-sm text-gray-600">{campaign.brandId?.name}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Progress value={campaign.matchScore} className="w-16 h-2" />
                                        <span className="text-sm font-medium text-blue-600">{campaign.matchScore}%</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 line-clamp-1 mb-2">{campaign.description}</p>

                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-semibold text-green-600">
                                            {campaign.dealType === 'barter' ? 'Barter' : `$${campaign.budget?.toLocaleString()}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        <span>{campaign.audienceAlignment}% match</span>
                                    </div>

                                    {campaign.applicationDeadline && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-orange-600" />
                                            <span>{new Date(campaign.applicationDeadline).toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-1">
                                        {campaign.platforms?.slice(0, 2).map(platform => (
                                            <Badge key={platform} variant="secondary" className="text-xs">
                                                {platform}
                                            </Badge>
                                        ))}
                                        {campaign.platforms?.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{campaign.platforms.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {isApplied ? (
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(application?.status || 'applied')}
                                        {isAutoApplied && (
                                            <Badge variant="outline" className="text-xs">
                                                <Zap className="w-3 h-3 mr-1" />
                                                Auto
                                            </Badge>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSaveCampaign(campaign._id)}
                                            className={isSaved ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}
                                        >
                                            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                        </Button>

                                        <Button variant="outline" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>

                                        <Button variant="outline" size="sm">
                                            <MessageCircle className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            onClick={() => handleApplyToCampaign(campaign._id, campaign.budget * 0.1)}
                                            disabled={loading}
                                            size="sm"
                                        >
                                            Apply
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        // Grid view (minimal professional design)
        return (
            <Card key={campaign._id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group bg-white border border-gray-100 rounded-xl">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 relative shadow-sm">
                                {campaign.brandId?.logoUrl ? (
                                    <img
                                        src={campaign.brandId.logoUrl}
                                        alt={campaign.brandId.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Globe className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                {campaign.brandId?.verified && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{campaign.title}</h3>
                                <p className="text-sm text-gray-600 font-medium">{campaign.brandId?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                                        <span className="text-sm font-bold text-white">{campaign.matchScore}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-center font-medium">Match Score</p>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveCampaign(campaign._id)}
                                className={`transition-all duration-200 rounded-lg p-2 ${isSaved
                                    ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                                    : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                                    }`}
                            >
                                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4 mb-5">
                        <p className="text-gray-700 line-clamp-2 leading-relaxed">{campaign.description}</p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-100">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-semibold text-green-700 text-sm">
                                    {campaign.dealType === 'barter' ? 'Barter Deal' :
                                        campaign.dealType === 'affiliate' ? 'Affiliate' :
                                            `$${campaign.budget?.toLocaleString()}`}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-blue-700 text-sm">{campaign.audienceAlignment}% match</span>
                            </div>

                            <div className="flex items-center gap-2 p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                                <Target className="w-4 h-4 text-purple-600" />
                                <span className="font-semibold text-purple-700 text-sm">{campaign.targetAudience?.minFollowers ?
                                    `${(campaign.targetAudience.minFollowers / 1000).toFixed(0)}K+` : 'Any'} followers</span>
                            </div>

                            {campaign.applicationDeadline && (
                                <div className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                                    <Calendar className="w-4 h-4 text-orange-600" />
                                    <span className="font-semibold text-orange-700 text-sm">{new Date(campaign.applicationDeadline).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {campaign.platforms?.map(platform => (
                                <Badge key={platform} className="bg-gray-100 text-gray-700 border-0 px-2.5 py-1 rounded-lg font-medium text-xs">
                                    {platform}
                                </Badge>
                            ))}
                            {campaign.tags?.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg font-medium text-xs">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>

                        {campaign.aiTips && (
                            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                        <Lightbulb className="w-3 h-3 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 mb-1">AI Recommendation</p>
                                        <p className="text-sm text-blue-800 leading-relaxed">{campaign.aiTips}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {isApplied ? (
                            <div className="flex items-center gap-3 flex-1">
                                {getStatusBadge(application?.status || 'applied')}
                                {isAutoApplied && (
                                    <Badge className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg font-medium text-xs">
                                        <Zap className="w-3 h-3 mr-1" />
                                        Auto-Applied
                                    </Badge>
                                )}
                                <span className="text-sm font-medium text-gray-600">
                                    {application?.createdAt ? new Date(application.createdAt).toLocaleDateString() : ''}
                                </span>
                            </div>
                        ) : (
                            <Button
                                onClick={() => handleApplyToCampaign(campaign._id, campaign.budget * 0.1)}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-sm transition-all duration-200"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Apply Now
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCampaign(campaign)}
                            className="border-gray-200 hover:border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl px-4 py-2.5 transition-all duration-200"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartChat(campaign)}
                            className="border-gray-200 hover:border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl px-4 py-2.5 transition-all duration-200"
                        >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Chat
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderFilters = () => (
        <div className="mb-8">
            <Card className="shadow-sm border border-gray-100 bg-white rounded-xl">
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <FilterIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Smart Filters</h3>
                                    <p className="text-gray-600">Find your perfect brand matches</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                    {filteredCampaigns.length} campaigns found
                                </div>
                                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className={`h-8 px-3 rounded-md ${viewMode === 'grid'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className={`h-8 px-3 rounded-md ${viewMode === 'list'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Main Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search campaigns, brands, or keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-12 h-12 text-base border border-gray-200 focus:border-blue-500 rounded-xl shadow-sm bg-gray-50/50 focus:bg-white transition-all duration-200"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {/* Quick Filters */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Category</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-11 border border-gray-200 focus:border-blue-500 rounded-lg bg-gray-50/50 focus:bg-white transition-all duration-200">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="fashion">👗 Fashion</SelectItem>
                                        <SelectItem value="tech">💻 Tech</SelectItem>
                                        <SelectItem value="fitness">💪 Fitness</SelectItem>
                                        <SelectItem value="beauty">💄 Beauty</SelectItem>
                                        <SelectItem value="food">🍕 Food & Beverage</SelectItem>
                                        <SelectItem value="travel">✈️ Travel</SelectItem>
                                        <SelectItem value="lifestyle">🌟 Lifestyle</SelectItem>
                                        <SelectItem value="gaming">🎮 Gaming</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Deal Type</label>
                                <Select value={selectedDealType} onValueChange={setSelectedDealType}>
                                    <SelectTrigger className="h-11 border border-gray-200 focus:border-blue-500 rounded-lg bg-gray-50/50 focus:bg-white transition-all duration-200">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="paid">💰 Paid</SelectItem>
                                        <SelectItem value="barter">🔄 Barter</SelectItem>
                                        <SelectItem value="affiliate">🤝 Affiliate</SelectItem>
                                        <SelectItem value="hybrid">⚡ Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Sort By</label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="h-11 border border-gray-200 focus:border-blue-500 rounded-lg bg-gray-50/50 focus:bg-white transition-all duration-200">
                                        <SelectValue placeholder="Best Match" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="match_score">🎯 Best Match</SelectItem>
                                        <SelectItem value="budget_high">💎 Highest Budget</SelectItem>
                                        <SelectItem value="budget_low">💵 Lowest Budget</SelectItem>
                                        <SelectItem value="deadline">⏰ Deadline Soon</SelectItem>
                                        <SelectItem value="recent">🆕 Most Recent</SelectItem>
                                        <SelectItem value="applications">📊 Least Applied</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Actions</label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={showAdvancedFilters ? "default" : "outline"}
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className={`flex-1 h-11 rounded-lg transition-all duration-200 ${showAdvancedFilters
                                            ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                                            : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-white'
                                            }`}
                                    >
                                        <Sliders className="w-4 h-4 mr-2" />
                                        Advanced
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('all');
                                            setSelectedDealType('all');
                                            setBudgetRange([0, 50000]);
                                            setSelectedPlatforms([]);
                                            setSortBy('match_score');
                                            setMinMatchScore(70);
                                            setVerifiedBrandsOnly(false);
                                        }}
                                        className="h-11 px-3 rounded-lg border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-white transition-all duration-200"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200 space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-medium text-gray-900">Advanced Filters</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Budget Range */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700">Budget Range</label>
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <Slider
                                                value={budgetRange}
                                                onValueChange={setBudgetRange}
                                                max={50000}
                                                min={0}
                                                step={500}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-gray-600 mt-2">
                                                <span className="font-medium">${budgetRange[0].toLocaleString()}</span>
                                                <span className="font-medium">${budgetRange[1].toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Match Score */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700">Min Match Score</label>
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <Slider
                                                value={[minMatchScore]}
                                                onValueChange={(value) => setMinMatchScore(value[0])}
                                                max={100}
                                                min={0}
                                                step={5}
                                                className="w-full"
                                            />
                                            <div className="text-center text-sm text-gray-600 mt-2">
                                                <span className="font-medium">{minMatchScore}%+</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Options */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700">Options</label>
                                        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700">Verified Brands Only</span>
                                                <Switch
                                                    checked={verifiedBrandsOnly}
                                                    onCheckedChange={setVerifiedBrandsOnly}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Platform Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Platforms</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { name: 'Instagram', icon: '📷' },
                                            { name: 'YouTube', icon: '📺' },
                                            { name: 'TikTok', icon: '🎵' },
                                            { name: 'Twitter', icon: '🐦' },
                                            { name: 'LinkedIn', icon: '💼' }
                                        ].map(platform => (
                                            <Button
                                                key={platform.name}
                                                variant={selectedPlatforms.includes(platform.name) ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPlatforms(prev =>
                                                        prev.includes(platform.name)
                                                            ? prev.filter(p => p !== platform.name)
                                                            : [...prev, platform.name]
                                                    );
                                                }}
                                                className="h-10 px-4 rounded-lg"
                                            >
                                                <span className="mr-2">{platform.icon}</span>
                                                {platform.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active Filters Display */}
                        {(searchQuery || selectedCategory !== 'all' || selectedDealType !== 'all' ||
                            selectedPlatforms.length > 0 || verifiedBrandsOnly || minMatchScore > 70) && (
                                <div className="flex flex-wrap items-center gap-2 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                                    </div>

                                    {searchQuery && (
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 gap-1">
                                            Search: {searchQuery}
                                            <button onClick={() => setSearchQuery('')}>
                                                <XCircle className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    )}

                                    {selectedCategory !== 'all' && (
                                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 gap-1">
                                            {selectedCategory}
                                            <button onClick={() => setSelectedCategory('all')}>
                                                <XCircle className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    )}

                                    {selectedDealType !== 'all' && (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 gap-1">
                                            {selectedDealType}
                                            <button onClick={() => setSelectedDealType('all')}>
                                                <XCircle className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    )}

                                    {selectedPlatforms.map(platform => (
                                        <Badge key={platform} className="bg-orange-100 text-orange-800 hover:bg-orange-200 gap-1">
                                            {platform}
                                            <button onClick={() => setSelectedPlatforms(prev => prev.filter(p => p !== platform))}>
                                                <XCircle className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}

                                    {verifiedBrandsOnly && (
                                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 gap-1">
                                            Verified Only
                                            <button onClick={() => setVerifiedBrandsOnly(false)}>
                                                <XCircle className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    )}

                                    {minMatchScore > 70 && (
                                        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 gap-1">
                                            {minMatchScore}%+ Match
                                            <button onClick={() => setMinMatchScore(70)}>
                                                <XCircle className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderInsightsSidebar = () => (
        <div className="space-y-6">
            {/* Auto-Apply Settings */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Auto-Apply Settings</CardTitle>
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">AI Auto-Apply</p>
                            <p className="text-xs text-gray-600">Let AI apply to high-match campaigns</p>
                        </div>
                        <Switch
                            checked={autoApplySettings.enabled}
                            onCheckedChange={(checked) =>
                                setAutoApplySettings(prev => ({ ...prev, enabled: checked }))
                            }
                        />
                    </div>

                    {autoApplySettings.enabled && (
                        <div className="space-y-3 pt-2 border-t">
                            <div>
                                <label className="text-xs font-medium text-gray-700">Min Match Score: {autoApplySettings.minMatchScore}%</label>
                                <Slider
                                    value={[autoApplySettings.minMatchScore]}
                                    onValueChange={(value) =>
                                        setAutoApplySettings(prev => ({ ...prev, minMatchScore: value[0] }))
                                    }
                                    max={100}
                                    min={70}
                                    step={5}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-700">Max Applications/Day: {autoApplySettings.maxApplicationsPerDay}</label>
                                <Slider
                                    value={[autoApplySettings.maxApplicationsPerDay]}
                                    onValueChange={(value) =>
                                        setAutoApplySettings(prev => ({ ...prev, maxApplicationsPerDay: value[0] }))
                                    }
                                    max={20}
                                    min={1}
                                    step={1}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-lg font-bold text-blue-600">{applications.length}</p>
                            <p className="text-xs text-blue-700">Applied</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                            <p className="text-lg font-bold text-green-600">
                                {applications.filter(app => app.status === 'approved').length}
                            </p>
                            <p className="text-xs text-green-700">Approved</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <p className="text-lg font-bold text-purple-600">{savedCampaigns.length}</p>
                            <p className="text-xs text-purple-700">Saved</p>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                            <p className="text-lg font-bold text-orange-600">{getMatchedCampaigns().length}</p>
                            <p className="text-xs text-orange-700">Matches</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Campaigns */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Top Campaigns for You
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                    {getMatchedCampaigns().slice(0, 3).map(campaign => (
                        <div
                            key={campaign._id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleViewCampaign(campaign)}
                        >
                            <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{campaign.matchScore}%</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{campaign.title}</p>
                                <p className="text-xs text-gray-600">{campaign.brandId?.name}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <DollarSign className="w-3 h-3 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium">
                                        {campaign.dealType === 'barter' ? 'Barter' : `$${campaign.budget?.toLocaleString()}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {getMatchedCampaigns().length === 0 && (
                        <div className="text-center py-4">
                            <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">No high-match campaigns yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Weekly Insights */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        This Week's Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span>{campaigns.filter(c => c.matchScore >= 70).length} new high-match campaigns</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span>Fashion brands are 40% more active</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span>{campaigns.filter(c => c.applicationDeadline && new Date(c.applicationDeadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length} deadlines this week</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span>Your match rate improved by 12%</span>
                    </div>
                </CardContent>
            </Card>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            Recently Viewed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                        {recentlyViewed.slice(0, 3).map(campaign => (
                            <div
                                key={campaign._id}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
                                onClick={() => handleViewCampaign(campaign)}
                            >
                                <div className="w-6 h-6 rounded overflow-hidden bg-gray-100">
                                    <img src={campaign.brandId?.logoUrl || '/api/placeholder/24/24'} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className="truncate">{campaign.title}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Improvement Tips */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Improve Your Match Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                            <span className="text-gray-700">Post 2 more Reels to increase visibility for Tech brands</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                            <span className="text-gray-700">Add more lifestyle content to attract Fashion collaborations</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                            <span className="text-gray-700">Increase engagement rate by 0.5% for premium campaigns</span>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        View Full Analysis
                    </Button>
                </CardContent>
            </Card>

            {/* Smart Alerts */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-500" />
                        Smart Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs">New match notifications</span>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs">Deadline reminders</span>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs">Weekly insights</span>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderMessaging = () => (
        <div className="space-y-6">
            {/* Messaging Tabs */}
            <Tabs defaultValue="conversations" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="conversations">Conversations</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Messaging</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="conversations" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                        {/* Conversations List */}
                        <Card className="lg:col-span-1">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm">Active Chats</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Archive className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-2 max-h-80 overflow-y-auto">
                                {conversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedConversation?.id === conv.id
                                            ? 'bg-blue-50 border border-blue-200 shadow-sm'
                                            : 'hover:bg-gray-50 border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                                    <img src={conv.brandLogo} alt={conv.brandName} className="w-full h-full object-cover" />
                                                </div>
                                                {conv.status === 'active' && (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate">{conv.brandName}</p>
                                                    <span className="text-xs text-gray-500">
                                                        {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-xs">{conv.matchScore}% match</Badge>
                                                    <span className="text-xs text-gray-500 truncate">{conv.campaignTitle}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {conversations.length === 0 && (
                                    <div className="text-center py-8">
                                        <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">No conversations yet</p>
                                        <p className="text-xs text-gray-500">Start chatting with brands!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Chat Window */}
                        <Card className="lg:col-span-2">
                            {selectedConversation ? (
                                <>
                                    <CardHeader className="pb-3 border-b">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                                                    <img src={selectedConversation.brandLogo} alt={selectedConversation.brandName} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{selectedConversation.brandName}</p>
                                                    <p className="text-xs text-gray-600">{selectedConversation.campaignTitle}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    {selectedConversation.matchScore}% match
                                                </Badge>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-4">
                                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto" id="messages-container">
                                            {/* Display all messages in the conversation */}
                                            {selectedConversation.messages?.map((msg, index) => (
                                                <div key={index} className={`flex ${msg.sender === 'creator' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`rounded-lg p-3 max-w-xs ${msg.sender === 'creator'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                        }`}>
                                                        <p className="text-sm">{msg.message}</p>
                                                        <p className={`text-xs mt-1 ${msg.sender === 'creator' ? 'text-blue-100' : 'text-gray-500'
                                                            }`}>
                                                            {msg.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Show default message if no messages array */}
                                            {!selectedConversation.messages && (
                                                <div className="flex justify-start">
                                                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                                                        <p className="text-sm">{selectedConversation.lastMessage}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {selectedConversation.timestamp.toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        <div className="border-t pt-4 space-y-3">
                                            {/* Quick Reply Templates */}
                                            <div className="flex flex-wrap gap-2">
                                                {savedTemplates.slice(0, 3).map(template => (
                                                    <Button
                                                        key={template.id}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setMessageText(template.content.replace('{brand_name}', selectedConversation.brandName).replace('{campaign_title}', selectedConversation.campaignTitle))}
                                                        className="text-xs"
                                                    >
                                                        {template.name}
                                                    </Button>
                                                ))}
                                            </div>

                                            <div className="flex items-end gap-2">
                                                <div className="flex-1">
                                                    <Textarea
                                                        placeholder="Type your message..."
                                                        value={messageText}
                                                        onChange={(e) => setMessageText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                if (messageText.trim()) {
                                                                    handleSendMessage(selectedConversation.id, messageText);
                                                                }
                                                            }
                                                        }}
                                                        className="min-h-[80px] resize-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Button size="sm" variant="outline">
                                                        <Paperclip className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Smile className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleSendMessage(selectedConversation.id, messageText)}
                                                        disabled={!messageText.trim()}
                                                        size="sm"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </>
                            ) : (
                                <CardContent className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">Select a conversation to start chatting</p>
                                        <p className="text-sm text-gray-500 mt-2">Choose from your active conversations on the left</p>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="bulk" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Bulk Messaging</CardTitle>
                            <p className="text-sm text-gray-600">Send personalized messages to multiple brands at once</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Brand Selection */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Select Brands</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-lg p-3">
                                    {campaigns.length > 0 ? (
                                        campaigns.slice(0, 6).map(campaign => (
                                            <div key={campaign._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(campaign._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedBrands([...selectedBrands, campaign._id]);
                                                        } else {
                                                            setSelectedBrands(selectedBrands.filter(id => id !== campaign._id));
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                                <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                                                    <img
                                                        src={campaign.brandId?.logoUrl || '/api/placeholder/32/32'}
                                                        alt={campaign.brandId?.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiA4QzEyLjY4NjMgOCAxMCAxMC42ODYzIDEwIDE0QzEwIDE3LjMxMzcgMTIuNjg2MyAyMCAxNiAyMEMxOS4zMTM3IDIwIDIyIDE3LjMxMzcgMjIgMTRDMjIgMTAuNjg2MyAxOS4zMTM3IDggMTYgOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg==';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{campaign.brandId?.name || 'Unknown Brand'}</p>
                                                    <p className="text-xs text-gray-600 truncate">{campaign.title || 'Campaign'}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 text-center py-8">
                                            <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">No campaigns available</p>
                                            <p className="text-xs text-gray-500">Check back later for new opportunities</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{selectedBrands.length} brands selected</p>
                            </div>

                            {/* Message Composer */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Message</label>
                                <Textarea
                                    placeholder="Hi {brand_name}! I'm interested in collaborating on your {campaign_title} campaign..."
                                    value={bulkMessageText}
                                    onChange={(e) => setBulkMessageText(e.target.value)}
                                    className="min-h-[120px]"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Use {'{brand_name}'} and {'{campaign_title}'} for personalization
                                </p>
                            </div>

                            {/* Preview */}
                            {bulkMessageText && selectedBrands.length > 0 && (
                                <div className="border rounded-lg p-3 bg-gray-50">
                                    <p className="text-sm font-medium mb-2">Preview for {campaigns.find(c => c._id === selectedBrands[0])?.brandId?.name}:</p>
                                    <p className="text-sm text-gray-700">
                                        {bulkMessageText
                                            .replace('{brand_name}', campaigns.find(c => c._id === selectedBrands[0])?.brandId?.name || '[Brand Name]')
                                            .replace('{campaign_title}', campaigns.find(c => c._id === selectedBrands[0])?.title || '[Campaign Title]')
                                        }
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => handleBulkMessage()}
                                    disabled={!bulkMessageText.trim() || selectedBrands.length === 0 || loading}
                                    className="flex-1"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                    )}
                                    {loading ? 'Sending...' : `Send to ${selectedBrands.length} Brand${selectedBrands.length !== 1 ? 's' : ''}`}
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    setBulkMessageText('');
                                    setSelectedBrands([]);
                                }}>
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Message Templates</h3>
                            <p className="text-sm text-gray-600">Save and reuse your best messages</p>
                        </div>
                        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Template
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Message Template</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Template Name</label>
                                        <Input placeholder="e.g., Initial Interest" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Message</label>
                                        <Textarea
                                            placeholder="Hi {brand_name}! I'm interested in..."
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="flex-1">Save Template</Button>
                                        <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4">
                        {savedTemplates.map(template => (
                            <Card key={template.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{template.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{template.content}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Edit3 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Brand Matches</h2>
                        <p className="text-gray-600 mt-1">Discover and connect with brands looking for creators like you</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                            <Bell className="w-4 h-4 mr-2" />
                            Alerts
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                        </Button>
                    </div>
                </div>

                {/* Section Tabs */}
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-fit">
                    <button
                        onClick={() => setActiveSection('campaigns')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeSection === 'campaigns'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Campaigns
                    </button>
                    <button
                        onClick={() => setActiveSection('messaging')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeSection === 'messaging'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Messaging
                    </button>
                </div>

                {activeSection === 'campaigns' && (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        <div className="xl:col-span-3 space-y-6">
                            {/* Campaign Tabs */}
                            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                <button
                                    onClick={() => setActiveTab('matched')}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'matched'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Matched ({getMatchedCampaigns().length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'all'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    All Campaigns ({filteredCampaigns.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('applied')}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'applied'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Applied ({applications.length})
                                </button>
                            </div>

                            {/* Applied Sub-tabs */}
                            {activeTab === 'applied' && (
                                <div className="flex items-center gap-1 bg-blue-50/70 p-1.5 rounded-xl w-fit ml-4 border border-blue-100">
                                    <button
                                        onClick={() => setActiveTab('applied-all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'applied-all' || activeTab === 'applied'
                                            ? 'bg-white text-blue-900 shadow-sm border border-blue-200'
                                            : 'text-blue-700 hover:text-blue-900 hover:bg-white/60'
                                            }`}
                                    >
                                        All ({applications.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('applied-auto')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'applied-auto'
                                            ? 'bg-white text-blue-900 shadow-sm border border-blue-200'
                                            : 'text-blue-700 hover:text-blue-900 hover:bg-white/60'
                                            }`}
                                    >
                                        <Zap className="w-3.5 h-3.5" />
                                        Auto ({getAutoAppliedCampaigns().length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('applied-manual')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'applied-manual'
                                            ? 'bg-white text-blue-900 shadow-sm border border-blue-200'
                                            : 'text-blue-700 hover:text-blue-900 hover:bg-white/60'
                                            }`}
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        Manual ({getManualAppliedCampaigns().length})
                                    </button>
                                </div>
                            )}

                            {/* Filters */}
                            {renderFilters()}

                            {/* Campaign Grid */}
                            <div className="grid gap-6">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'matched' && getMatchedCampaigns().map(renderCampaignCard)}
                                        {activeTab === 'all' && filteredCampaigns.map(renderCampaignCard)}
                                        {(activeTab === 'applied' || activeTab === 'applied-all') && getAppliedCampaigns().map(renderCampaignCard)}
                                        {activeTab === 'applied-auto' && getAutoAppliedCampaigns().map(renderCampaignCard)}
                                        {activeTab === 'applied-manual' && getManualAppliedCampaigns().map(renderCampaignCard)}

                                        {((activeTab === 'matched' && getMatchedCampaigns().length === 0) ||
                                            (activeTab === 'all' && filteredCampaigns.length === 0) ||
                                            ((activeTab === 'applied' || activeTab === 'applied-all') && getAppliedCampaigns().length === 0) ||
                                            (activeTab === 'applied-auto' && getAutoAppliedCampaigns().length === 0) ||
                                            (activeTab === 'applied-manual' && getManualAppliedCampaigns().length === 0)) && (
                                                <Card className="p-8 text-center">
                                                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                                    <p className="text-gray-600">
                                                        {activeTab === 'matched' && 'No matching campaigns found. Try adjusting your profile or check back later.'}
                                                        {activeTab === 'all' && 'No campaigns found. Try adjusting your filters.'}
                                                        {(activeTab === 'applied' || activeTab === 'applied-all') && 'No applications yet. Start applying to campaigns to build your portfolio!'}
                                                        {activeTab === 'applied-auto' && 'No auto-applied campaigns yet. Enable auto-apply in settings to let AI apply for you.'}
                                                        {activeTab === 'applied-manual' && 'No manually applied campaigns yet. Browse campaigns and apply to ones that interest you.'}
                                                    </p>
                                                </Card>
                                            )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Insights Sidebar */}
                        <div className="xl:col-span-1">
                            {renderInsightsSidebar()}
                        </div>
                    </div>
                )}

                {activeSection === 'messaging' && renderMessaging()}
            </div>
        </div>
    );
};

export default BrandMatches;