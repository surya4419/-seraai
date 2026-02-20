import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import geminiService from '../services/geminiService';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
    User, Users, TrendingUp, Target, Star, Award,
    Download, Share2, FileText, Brain, Sparkles,
    CheckCircle, AlertCircle, Info, ExternalLink,
    BarChart3, Calendar, Clock, MapPin,
    DollarSign, Zap, Shield, Eye, Heart, MessageCircle,
    Loader2, RefreshCw, Camera, Video, Image as ImageIcon,
    Globe, Instagram, Youtube, Twitter, Linkedin,
    ArrowUp, ArrowDown, Minus, Plus, Edit3, Upload,
    Link, Copy, Mail, Phone, Briefcase, TrendingDown
} from 'lucide-react';

const PitchAudit = ({ profiles, selectedProfile, rateCardData, dashboardData }) => {
    // State management
    const [auditData, setAuditData] = useState(null);
    const [pitchData, setPitchData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [progressScore, setProgressScore] = useState(0);
    const [shareableLink, setShareableLink] = useState('');
    const [aiTips, setAiTips] = useState([]);
    const [aiBrandRecommendations, setAiBrandRecommendations] = useState([]);

    // Form data for additional details
    const [formData, setFormData] = useState({
        name: '',
        handle: '',
        platform: 'Instagram',
        followers: 0,
        engagementRate: 0,
        category: 'Lifestyle',
        country: 'India',
        city: 'Mumbai',
        avgViews: 0,
        avgReach: 0,
        collaborationType: 'Paid Collaboration',
        contactEmail: '',
        phoneNumber: '',
        mediaKitUrl: ''
    });

    // Initialize data when profile is selected
    useEffect(() => {
        if (selectedProfile) {
            initializeFormData();
        } else {
            // Initialize with demo data if no profile is selected
            setFormData({
                name: 'Demo Creator',
                handle: 'demo_creator',
                platform: 'Instagram',
                followers: 25000,
                engagementRate: 4.2,
                category: 'Lifestyle',
                country: 'India',
                city: 'Mumbai',
                avgViews: 2500,
                avgReach: 7500,
                collaborationType: 'Paid Collaboration',
                contactEmail: 'demo@creator.com',
                phoneNumber: '+91 98765 43210',
                mediaKitUrl: ''
            });
        }
    }, [selectedProfile]);

    // Generate audit report when formData is updated
    useEffect(() => {
        if (formData.handle && (selectedProfile || formData.followers > 0)) {
            generateAuditReport();
        }
    }, [formData]);

    const initializeFormData = () => {
        const profileData = selectedProfile.profileData || {};

        // Debug: Log the profile data to see what's available
        console.log('PitchAudit - Profile Data:', {
            selectedProfile,
            profileData,
            dashboardData,
            rateCardData
        });

        // Try to get additional data from rate card or dashboard
        const rateCard = rateCardData || dashboardData?.rateCard;
        const userProfile = dashboardData?.profile;

        // Ensure we have some default values for demo purposes
        const defaultFollowers = profileData.followersCount || 10000;
        const defaultEngagementRate = profileData.engagementRate || 3.5;

        setFormData({
            name: profileData.fullName || selectedProfile.handle || userProfile?.name || 'Creator',
            handle: selectedProfile.handle || userProfile?.handle || 'creator_handle',
            platform: selectedProfile.platform || 'Instagram',
            followers: defaultFollowers,
            engagementRate: defaultEngagementRate,
            category: profileData.categories?.[0] || rateCard?.category || 'Lifestyle',
            country: profileData.location?.split(',')[1]?.trim() || userProfile?.country || 'India',
            city: profileData.location?.split(',')[0]?.trim() || userProfile?.city || 'Mumbai',
            avgViews: profileData.avgViews30d || Math.round(defaultFollowers * 0.1),
            avgReach: Math.round(defaultFollowers * 0.3),
            collaborationType: rateCard?.collaborationType || 'Paid Collaboration',
            contactEmail: userProfile?.email || '',
            phoneNumber: userProfile?.phone || '',
            mediaKitUrl: rateCard?.mediaKitUrl || ''
        });
    };
    // Generate audit report with all metrics
    const generateAuditReport = async (showMessages = false) => {
        // Check if we have minimum required data
        const hasHandle = formData.handle || selectedProfile?.handle;
        const hasBasicData = formData.followers > 0 || selectedProfile?.profileData?.followersCount > 0;

        if (!hasHandle && !hasBasicData) {
            if (showMessages) {
                toast.error('Please provide profile information to generate audit report');
            }
            return;
        }

        setLoading(true);
        try {
            const auditReport = calculateAuditMetrics();
            setAuditData(auditReport);
            setProgressScore(auditReport.completionScore);
            generateAITips(auditReport);

            // Generate AI brand recommendations
            const profileData = selectedProfile?.profileData || {};
            const brands = await generateAIBrandRecommendations(
                profileData,
                auditReport.profile.category,
                auditReport.profile.followers,
                auditReport.profile.engagementRate
            );
            setAiBrandRecommendations(brands);

            // Always auto-generate pitch (AI or fallback)
            await generateAIPitch(auditReport);

            if (showMessages) {
                toast.success('Audit report generated successfully!');
            }
        } catch (error) {
            if (showMessages) {
                toast.error('Failed to generate audit report');
            }
            console.error('Audit generation error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate all audit metrics
    const calculateAuditMetrics = () => {
        const data = selectedProfile?.profileData || {};

        // Use actual data from profile, fallback to formData
        const actualFollowers = data.followersCount || formData.followers || 0;
        const actualEngagementRate = data.engagementRate || formData.engagementRate || 0;
        const actualHandle = selectedProfile?.handle || formData.handle || '';
        const actualPlatform = selectedProfile?.platform || formData.platform || 'Instagram';
        const actualCategory = data.categories?.[0] || formData.category || 'Lifestyle';

        // Performance Metrics
        const engagementScore = calculateEngagementScore(actualEngagementRate);
        const authenticityScore = calculateAuthenticityScore(data);
        const audienceQualityScore = calculateAudienceQuality(data, actualFollowers, actualEngagementRate);
        const contentConsistencyScore = calculateContentConsistency(data);
        const brandFitScore = calculateBrandFit(data, actualCategory);
        const growthTrendScore = calculateGrowthTrend(data);

        // Calculate completion score using actual data
        const completionFactors = [
            actualFollowers > 0 ? 15 : 0,
            actualEngagementRate > 0 ? 15 : 0,
            data.biography ? 10 : 0,
            actualCategory ? 10 : 0,
            (formData.country && formData.city) || data.location ? 10 : 0,
            data.recentPosts?.length >= 12 ? 15 : (data.recentPosts?.length || 0) * 1.25,
            data.audienceDemographics ? 15 : 0,
            data.website ? 5 : 0,
            data.isVerified ? 5 : 0
        ];
        const completionScore = Math.round(completionFactors.reduce((sum, score) => sum + score, 0));

        return {
            profile: {
                name: data.fullName || actualHandle || formData.name,
                handle: actualHandle,
                platform: actualPlatform,
                followers: actualFollowers,
                engagementRate: actualEngagementRate,
                category: actualCategory,
                country: formData.country || data.location?.split(',')[1]?.trim() || 'India',
                city: formData.city || data.location?.split(',')[0]?.trim() || 'Mumbai',
                avgViews: data.avgViews30d || Math.round(actualFollowers * 0.1),
                avgReach: Math.round(actualFollowers * 0.3),
                collaborationType: formData.collaborationType,
                isVerified: data.isVerified || false,
                website: data.website,
                biography: data.biography,
                profilePictureUrl: data.profilePictureUrl
            },
            performanceMetrics: {
                engagementScore,
                authenticityScore,
                audienceQualityScore,
                contentConsistencyScore,
                brandFitScore,
                growthTrendScore,
                overallRating: Math.round((engagementScore + authenticityScore + audienceQualityScore + contentConsistencyScore + brandFitScore + growthTrendScore) / 6)
            },
            audienceDemographics: generateAudienceDemographics(data),
            contentAnalysis: generateContentAnalysis(data, actualCategory),
            pitchInsights: generatePitchInsights(actualFollowers, actualEngagementRate, actualCategory),
            completionScore,
            recommendations: generateRecommendations(completionScore)
        };
    };
    // Helper calculation functions
    const calculateEngagementScore = (rate) => {
        if (rate >= 6) return 95;
        if (rate >= 4) return 85;
        if (rate >= 2) return 75;
        if (rate >= 1) return 65;
        return 45;
    };

    const calculateAuthenticityScore = (data) => {
        let score = 70;
        if (data.isVerified) score += 15;
        if (data.healthScore > 80) score += 10;
        if (data.followerGrowth > 0) score += 5;
        return Math.min(score, 100);
    };

    const calculateAudienceQuality = (data, followers, engagementRate) => {
        let score = 60;
        const location = data.location || formData.country;
        if (location === 'United States' || location?.includes('United States')) score += 20;
        if (engagementRate > 3) score += 15;
        if (followers > 10000) score += 5;
        return Math.min(score, 100);
    };

    const calculateContentConsistency = (data) => {
        let score = 50;
        const postCount = data.recentPosts?.length || 0;
        if (postCount >= 20) score += 25;
        else if (postCount >= 12) score += 15;
        if (data.postingHabits?.consistency === 'high') score += 25;
        return Math.min(score, 100);
    };

    const calculateBrandFit = (data, category) => {
        let score = 70;
        if (category && category !== 'Lifestyle') score += 10;
        if (data.biography && data.biography.length > 50) score += 10;
        if (data.website) score += 10;
        return Math.min(score, 100);
    };

    const calculateGrowthTrend = (data) => {
        const growth = data.followerGrowth || 0;
        if (growth > 10) return 90;
        if (growth > 5) return 80;
        if (growth > 0) return 70;
        return 50;
    };

    // Generate audience demographics with pie chart data
    const generateAudienceDemographics = (data) => {
        // Get creator's location for primary audience
        const creatorCountry = data.location?.split(',')[1]?.trim() || formData.country || 'India';
        const creatorCity = data.location?.split(',')[0]?.trim() || formData.city || 'Mumbai';

        // Generate realistic audience location data based on creator's location and category
        const generateLocationData = () => {
            if (creatorCountry === 'India') {
                return [
                    { country: 'India', percentage: 65 },
                    { country: 'United States', percentage: 15 },
                    { country: 'United Kingdom', percentage: 8 },
                    { country: 'Canada', percentage: 5 },
                    { country: 'Australia', percentage: 4 },
                    { country: 'UAE', percentage: 3 }
                ];
            } else if (creatorCountry === 'United States') {
                return [
                    { country: 'United States', percentage: 70 },
                    { country: 'Canada', percentage: 12 },
                    { country: 'United Kingdom', percentage: 8 },
                    { country: 'Australia', percentage: 5 },
                    { country: 'Germany', percentage: 3 },
                    { country: 'India', percentage: 2 }
                ];
            } else {
                return [
                    { country: creatorCountry, percentage: 55 },
                    { country: 'United States', percentage: 20 },
                    { country: 'United Kingdom', percentage: 10 },
                    { country: 'Canada', percentage: 8 },
                    { country: 'Australia', percentage: 4 },
                    { country: 'Germany', percentage: 3 }
                ];
            }
        };

        return {
            ageGroups: data.audienceDemographics?.ageGroups || [
                { name: '18-24', value: 35, color: '#8884d8' },
                { name: '25-34', value: 40, color: '#82ca9d' },
                { name: '35-44', value: 20, color: '#ffc658' },
                { name: '45+', value: 5, color: '#ff7c7c' }
            ],
            genderDistribution: [
                { name: 'Female', value: data.audienceDemographics?.genderDistribution?.female || 65, color: '#ff69b4' },
                { name: 'Male', value: data.audienceDemographics?.genderDistribution?.male || 35, color: '#4169e1' }
            ],
            topLocations: data.audienceDemographics?.topLocations || generateLocationData()
        };
    };
    // Generate content analysis
    const generateContentAnalysis = (data, category) => {
        const actualFollowers = data.followersCount || formData.followers || 0;
        const actualEngagementRate = data.engagementRate || formData.engagementRate || 0;

        return {
            topPerformingTypes: [
                { name: 'Reels', value: 45, engagement: 'High', color: '#8884d8' },
                { name: 'Carousel', value: 30, engagement: 'Medium', color: '#82ca9d' },
                { name: 'Single Post', value: 25, engagement: 'Medium', color: '#ffc658' }
            ],
            bestPostingTimes: ['6:00 PM - 8:00 PM', '12:00 PM - 2:00 PM', '8:00 AM - 10:00 AM'],
            contentThemes: [
                { theme: category, frequency: 'High', performance: 'Good' }
            ],
            growthTrend: generateGrowthTrendData(actualFollowers, actualEngagementRate)
        };
    };

    // Generate growth trend data for charts
    const generateGrowthTrendData = (followers, engagementRate) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const baseFollowers = followers * 0.7;
        return months.map((month, index) => ({
            month,
            followers: Math.round(baseFollowers + (index * followers * 0.05)),
            engagement: Math.round((engagementRate + (Math.random() - 0.5) * 0.5) * 100) / 100
        }));
    };

    // Generate pitch insights
    const generatePitchInsights = (followers, engagementRate, category) => {
        // Use rate card data if available, otherwise calculate
        const rateCard = rateCardData || dashboardData?.rateCard;

        let suggestedPrice;
        if (rateCard && rateCard.pricing) {
            // Use existing rate card pricing
            suggestedPrice = {
                post: rateCard.pricing.post || Math.round((followers / 1000) * 10),
                story: rateCard.pricing.story || Math.round((followers / 1000) * 5),
                reel: rateCard.pricing.reel || Math.round((followers / 1000) * 15)
            };
        } else {
            // Calculate based on followers and engagement
            const basePrice = (followers / 1000) * 10;
            const engagementMultiplier = Math.max(engagementRate / 2, 1);
            suggestedPrice = {
                post: Math.round(basePrice * engagementMultiplier),
                story: Math.round(basePrice * engagementMultiplier * 0.5),
                reel: Math.round(basePrice * engagementMultiplier * 1.5)
            };
        }

        return {
            suggestedPrice,
            recommendedBrands: aiBrandRecommendations.length > 0 ? aiBrandRecommendations : getStaticRecommendedBrands(category),
            topPerformingPostType: 'Reels',
            bestPostingTime: '6:00 PM - 8:00 PM',
            estimatedROI: {
                estimatedReach: Math.round(followers * 0.3),
                estimatedEngagement: Math.round(followers * 0.3 * (engagementRate / 100)),
                estimatedValue: Math.round(followers * 0.3 * (engagementRate / 100) * 0.5)
            }
        };
    };

    // AI-powered brand recommendations using Gemini
    const generateAIBrandRecommendations = async (profileData, category, followers, engagementRate) => {
        if (!geminiService || !geminiService.isAvailable()) {
            return getStaticRecommendedBrands(category);
        }

        try {
            const prompt = `Based on this creator profile, recommend 8-10 specific brand names that would be perfect for collaboration:

Creator Profile:
- Category/Niche: ${category}
- Followers: ${followers.toLocaleString()}
- Engagement Rate: ${engagementRate}%
- Platform: ${profileData.platform || 'Instagram'}
- Location: ${profileData.country || 'India'}
- Bio: ${profileData.biography || 'Not available'}

Return ONLY a JSON array of brand names like: ["Brand1", "Brand2", "Brand3", ...]

Focus on:
1. Brands that actively work with influencers in this niche
2. Mix of local and international brands
3. Brands suitable for this follower count and engagement
4. Include both premium and accessible brands`;

            const result = await geminiService.generateText(prompt);
            const brands = JSON.parse(result);

            if (Array.isArray(brands) && brands.length > 0) {
                return brands;
            }
        } catch (error) {
            console.error('AI brand recommendation error:', error);
        }

        // Fallback to static recommendations
        return getStaticRecommendedBrands(category);
    };

    // Static fallback brand recommendations
    const getStaticRecommendedBrands = (category) => {
        const brandMap = {
            'Fashion': ['Zara', 'H&M', 'Nike', 'Adidas', 'Myntra', 'Ajio', 'Forever 21', 'Uniqlo'],
            'Beauty': ['Nykaa', 'Lakme', 'Maybelline', 'L\'Oreal', 'MAC', 'Sephora', 'Sugar Cosmetics', 'Plum'],
            'Tech': ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo', 'Nothing'],
            'Fitness': ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour', 'Lululemon', 'Decathlon', 'Cult.fit'],
            'Food': ['Zomato', 'Swiggy', 'McDonald\'s', 'KFC', 'Domino\'s', 'Pizza Hut', 'Starbucks', 'Dunkin'],
            'Travel': ['MakeMyTrip', 'Goibibo', 'Airbnb', 'OYO', 'Booking.com', 'Expedia', 'Cleartrip', 'Yatra'],
            'Lifestyle': ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Urban Company', 'Swiggy', 'Zomato']
        };
        return brandMap[category] || brandMap['Lifestyle'];
    };

    // Generate AI tips
    const generateAITips = (auditReport) => {
        const tips = [];

        if (auditReport.performanceMetrics.engagementScore < 70) {
            tips.push({
                type: 'engagement',
                message: 'Post more Reels — they get 3.2x engagement in your niche',
                impact: 'High',
                color: 'text-blue-600 bg-blue-50'
            });
        }

        if (auditReport.performanceMetrics.contentConsistencyScore < 80) {
            tips.push({
                type: 'consistency',
                message: 'Maintain posting 4-5 times per week for better algorithm performance',
                impact: 'Medium',
                color: 'text-green-600 bg-green-50'
            });
        }

        if (!auditReport.profile.isVerified) {
            tips.push({
                type: 'credibility',
                message: 'Get verified to increase brand trust by 40%',
                impact: 'High',
                color: 'text-purple-600 bg-purple-50'
            });
        }

        if (formData.followers > 10000 && formData.engagementRate > 3) {
            tips.push({
                type: 'monetization',
                message: 'You\'re ready for premium brand partnerships — aim for ₹500+ per post',
                impact: 'High',
                color: 'text-yellow-600 bg-yellow-50'
            });
        }

        setAiTips(tips);
    };
    // Generate recommendations
    const generateRecommendations = (completionScore) => {
        const recommendations = [];

        if (completionScore < 80) {
            recommendations.push('Complete your profile information to increase credibility');
        }
        if (!formData.contactEmail) {
            recommendations.push('Add contact email for brand partnership inquiries');
        }
        if (formData.engagementRate < 3) {
            recommendations.push('Focus on creating more engaging content to improve engagement rate');
        }
        if (!formData.mediaKitUrl) {
            recommendations.push('Upload a professional media kit to showcase your work');
        }

        return recommendations;
    };

    // Generate AI pitch
    const generateAIPitch = async (auditReport) => {
        console.log('generateAIPitch called with:', auditReport);
        console.log('geminiService available:', geminiService && geminiService.isAvailable());

        if (!geminiService || !geminiService.isAvailable()) {
            console.log('Using fallback pitch generation');
            generateFallbackPitch();
            return;
        }

        setGenerating(true);
        try {
            const pitchPrompt = createPitchPrompt(auditReport);
            const result = await geminiService.generateText(pitchPrompt);
            const pitchContent = JSON.parse(result);
            setPitchData(pitchContent);
            toast.success('AI pitch generated successfully!');
        } catch (error) {
            console.error('AI pitch generation error:', error);
            generateFallbackPitch();
        } finally {
            setGenerating(false);
        }
    };

    // Create pitch prompt for AI
    const createPitchPrompt = (auditReport) => {
        const rateCard = rateCardData || dashboardData?.rateCard;
        const profileData = selectedProfile?.profileData || {};

        return `Create a professional brand pitch document for this creator. Return ONLY valid JSON in this exact format:
{
  "introduction": "Brief compelling introduction paragraph",
  "keySellingPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "targetBrandCategories": ["Category1", "Category2", "Category3"],
  "valueProposition": "Main value proposition paragraph",
  "campaignIdeas": [
    {"title": "Campaign 1", "description": "Description", "deliverables": ["Item 1", "Item 2"]},
    {"title": "Campaign 2", "description": "Description", "deliverables": ["Item 1", "Item 2"]}
  ],
  "callToAction": "Compelling call to action"
}

Creator Data:
- Handle: @${auditReport.profile.handle}
- Platform: ${auditReport.profile.platform}
- Followers: ${auditReport.profile.followers.toLocaleString()}
- Engagement Rate: ${auditReport.profile.engagementRate}%
- Category/Niche: ${auditReport.profile.category}
- Location: ${auditReport.profile.city}, ${auditReport.profile.country}
- Collaboration Type: ${auditData.profile.collaborationType}
- Average Views: ${auditReport.profile.avgViews.toLocaleString()}
- Suggested Pricing: Post ₹${auditReport.pitchInsights.suggestedPrice.post}, Reel ₹${auditReport.pitchInsights.suggestedPrice.reel}, Story ₹${auditReport.pitchInsights.suggestedPrice.story}
- Performance Scores: Engagement ${auditReport.performanceMetrics.engagementScore}/100, Authenticity ${auditReport.performanceMetrics.authenticityScore}/100
- Top Content Type: ${auditReport.pitchInsights.topPerformingPostType}
- Best Posting Time: ${auditReport.pitchInsights.bestPostingTime}
${profileData.biography ? `- Bio: ${profileData.biography}` : ''}
${rateCard ? `- Rate Card Available: Yes` : ''}

Make the pitch compelling, data-driven, and professional. Focus on ROI and authentic engagement.`;
    };

    // Generate fallback pitch
    const generateFallbackPitch = () => {
        console.log('Generating fallback pitch...');
        const profileData = selectedProfile?.profileData || {};
        const rateCard = rateCardData || dashboardData?.rateCard;

        const pitch = {
            introduction: `Meet @${formData.handle}, a ${formData.category.toLowerCase()} creator with ${formData.followers.toLocaleString()} engaged followers and a ${formData.engagementRate.toFixed(1)}% engagement rate. Based in ${formData.city}, ${formData.country}, I create authentic content that resonates with my audience and drives real results for brand partners.`,
            keySellingPoints: [
                `${formData.engagementRate.toFixed(1)}% engagement rate demonstrating authentic audience connection`,
                `${formData.followers.toLocaleString()} highly engaged followers in the ${formData.category.toLowerCase()} niche`,
                `Consistent content creation with average ${formData.avgViews.toLocaleString()} views per post`,
                `Strategic location in ${formData.city}, ${formData.country} for regional market reach`,
                `Professional approach with ${rateCard ? 'established rate card and' : ''} clear collaboration guidelines`
            ],
            targetBrandCategories: getStaticRecommendedBrands(formData.category),
            valueProposition: `Partner with @${formData.handle} to reach a highly engaged audience of ${formData.followers.toLocaleString()} followers who trust their recommendations and actively engage with their content. With a ${formData.engagementRate.toFixed(1)}% engagement rate and average ${formData.avgViews.toLocaleString()} views per post, your brand message will reach an authentic, responsive audience in the ${formData.category.toLowerCase()} space. Located in ${formData.city}, ${formData.country}, I offer strategic market access with proven results.`,
            campaignIdeas: [
                {
                    title: 'Product Showcase Campaign',
                    description: 'Multi-format content featuring your product across different touchpoints',
                    deliverables: ['1 Feed Post', '3 Stories', '1 Reel', 'Swipe-up links']
                },
                {
                    title: 'Brand Ambassador Program',
                    description: 'Long-term partnership with consistent brand mentions',
                    deliverables: ['Monthly content', 'Story highlights', 'Event coverage']
                }
            ],
            callToAction: `Ready to create authentic content that drives results? With ${formData.followers.toLocaleString()} engaged followers and a proven ${formData.engagementRate.toFixed(1)}% engagement rate, I'm excited to discuss how we can build a successful partnership that delivers real ROI for your brand. Let's connect and create something amazing together!`
        };

        console.log('Setting pitch data:', pitch);
        setPitchData(pitch);
        toast.success('Pitch generated successfully!');
    };
    // Utility functions
    const downloadPDF = async () => {
        try {
            const pdfContent = {
                title: `${formData.name || formData.handle} - Creator Audit Report`,
                profile: auditData.profile,
                metrics: auditData.performanceMetrics,
                insights: auditData.pitchInsights,
                demographics: auditData.audienceDemographics,
                recommendations: auditData.recommendations,
                pitch: pitchData
            };

            console.log('PDF Content:', pdfContent);
            toast.success('PDF generation initiated! Check console for content.');
        } catch (error) {
            toast.error('Failed to generate PDF');
        }
    };

    const generateShareableLink = async () => {
        try {
            const shareId = Math.random().toString(36).substring(2, 15);
            const link = `${window.location.origin}/pitch/${shareId}`;
            setShareableLink(link);
            await navigator.clipboard.writeText(link);
            toast.success('Shareable link generated and copied to clipboard!');
        } catch (error) {
            toast.error('Failed to generate shareable link');
        }
    };

    const shareReport = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${formData.handle} - Creator Pitch`,
                    text: 'Check out my creator pitch and audit report',
                    url: shareableLink || window.location.href
                });
            } else {
                const linkToShare = shareableLink || window.location.href;
                await navigator.clipboard.writeText(linkToShare);
                toast.success('Link copied to clipboard!');
            }
        } catch (error) {
            toast.error('Failed to share');
        }
    };

    const uploadMediaKit = async (file) => {
        try {
            // Simulate upload process
            setTimeout(() => {
                const url = `https://example.com/mediakits/${file.name}`;
                setFormData(prev => ({ ...prev, mediaKitUrl: url }));
                toast.success('Media kit uploaded successfully!');
            }, 1000);
        } catch (error) {
            toast.error('Failed to upload media kit');
        }
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            Instagram: Instagram,
            YouTube: Youtube,
            Twitter: Twitter,
            LinkedIn: Linkedin,
            TikTok: Video
        };
        return icons[platform] || Globe;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Needs Improvement';
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Recalculate metrics when key fields change
        if (['followers', 'engagementRate', 'category', 'country', 'city'].includes(field)) {
            setTimeout(() => {
                if (auditData) {
                    generateAuditReport();
                }
            }, 500);
        }
    };
    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Generating your audit report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        Pitch & Audit Report
                        {generating && (
                            <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                <Brain className="w-3 h-3 animate-pulse" />
                                AI Generating...
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-gray-600">
                        Comprehensive analysis and professional pitch deck for brand partnerships
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={downloadPDF}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                        disabled={!auditData}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button
                        onClick={generateShareableLink}
                        size="sm"
                        variant="outline"
                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        disabled={!auditData}
                    >
                        <Link className="w-4 h-4 mr-2" />
                        Generate Link
                    </Button>
                    <Button
                        onClick={shareReport}
                        size="sm"
                        variant="outline"
                        className="border-teal-200 text-teal-600 hover:bg-teal-50"
                        disabled={!auditData}
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button
                        onClick={() => generateAIPitch(auditData)}
                        disabled={generating || !auditData}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white"
                    >
                        {generating ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                            <><Brain className="w-4 h-4 mr-2" /> Generate Pitch</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            {auditData && (
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Audit Completion</span>
                            <span className="text-sm font-bold text-purple-600">{progressScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progressScore}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            {progressScore >= 80 ? 'Excellent profile completeness!' :
                                progressScore >= 60 ? 'Good profile, some improvements needed' :
                                    'Complete your profile for better brand appeal'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Shareable Link Display */}
            {shareableLink && (
                <Card className="border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50 to-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-500 rounded-lg">
                                <Link className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-teal-800 mb-1">Shareable Pitch Link Generated!</h3>
                                <div className="flex items-center gap-2">
                                    <code className="text-sm bg-white px-3 py-1 rounded border text-teal-700 flex-1 truncate">
                                        {shareableLink}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigator.clipboard.writeText(shareableLink)}
                                        className="border-teal-200 text-teal-600 hover:bg-teal-100"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Navigation Tabs */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex gap-1 overflow-x-auto">
                        {[
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'metrics', label: 'Metrics', icon: BarChart3 },
                            { id: 'insights', label: 'Insights', icon: Target },
                            { id: 'pitch', label: 'Pitch', icon: FileText }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${isActive
                                        ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </CardHeader>
            </Card>

            {/* AI Tips Banner */}
            {aiTips.length > 0 && (
                <Card className="border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Brain className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-800 mb-2">🚀 AI-Powered Growth Tips</h3>
                                <div className="space-y-2">
                                    {aiTips.slice(0, 2).map((tip, index) => (
                                        <div key={index} className={`p-3 rounded-lg ${tip.color} border`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{tip.message}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${tip.impact === 'High' ? 'bg-red-100 text-red-700' :
                                                    tip.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {tip.impact} Impact
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Generate Initial Report Button or Loading State */}
            {!auditData && !loading && (
                <Card className="p-8 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Create Your Pitch & Audit Report</h3>
                    <p className="text-gray-600 mb-6">
                        Generate a comprehensive analysis of your profile and create a professional pitch deck for brand partnerships.
                    </p>
                    <Button
                        onClick={() => generateAuditReport(true)}
                        className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white"
                        size="lg"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Report
                    </Button>
                </Card>
            )}

            {/* Auto-generation Loading State */}
            {!auditData && loading && (
                <Card className="p-8 text-center">
                    <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-spin" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Generating Your Pitch & Audit Report</h3>
                    <p className="text-gray-600">
                        Analyzing your profile data and creating comprehensive insights for brand partnerships...
                    </p>
                </Card>
            )}
            {/* Tab Content */}
            {auditData && (
                <>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Influencer Information Form */}
                            <Card className="overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-purple-500 to-teal-500 text-white">
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-6 h-6" />
                                        Influencer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Basic Information */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Name</label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => handleFormChange('name', e.target.value)}
                                                    placeholder="Your full name"
                                                    className="focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Handle / Username</label>
                                                <Input
                                                    value={formData.handle}
                                                    onChange={(e) => handleFormChange('handle', e.target.value)}
                                                    placeholder="@yourusername"
                                                    className="focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Platform</label>
                                                <select
                                                    value={formData.platform}
                                                    onChange={(e) => handleFormChange('platform', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                >
                                                    <option value="Instagram">Instagram</option>
                                                    <option value="YouTube">YouTube</option>
                                                    <option value="TikTok">TikTok</option>
                                                    <option value="Twitter">Twitter</option>
                                                    <option value="LinkedIn">LinkedIn</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Follower Count</label>
                                                <Input
                                                    type="number"
                                                    value={formData.followers}
                                                    onChange={(e) => handleFormChange('followers', parseInt(e.target.value) || 0)}
                                                    placeholder="10000"
                                                    className="focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Performance & Location */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Engagement Rate (%)</label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={formData.engagementRate}
                                                    onChange={(e) => handleFormChange('engagementRate', parseFloat(e.target.value) || 0)}
                                                    placeholder="3.5"
                                                    className="focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Category / Niche</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => handleFormChange('category', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                >
                                                    <option value="Fashion">Fashion</option>
                                                    <option value="Beauty">Beauty</option>
                                                    <option value="Tech">Tech</option>
                                                    <option value="Fitness">Fitness</option>
                                                    <option value="Food">Food</option>
                                                    <option value="Travel">Travel</option>
                                                    <option value="Lifestyle">Lifestyle</option>
                                                    <option value="Gaming">Gaming</option>
                                                    <option value="Education">Education</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Country</label>
                                                    <Input
                                                        value={formData.country}
                                                        onChange={(e) => handleFormChange('country', e.target.value)}
                                                        placeholder="India"
                                                        className="focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                                                    <Input
                                                        value={formData.city}
                                                        onChange={(e) => handleFormChange('city', e.target.value)}
                                                        placeholder="Mumbai"
                                                        className="focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-2 block">Average Views per Post</label>
                                                <Input
                                                    type="number"
                                                    value={formData.avgViews}
                                                    onChange={(e) => handleFormChange('avgViews', parseInt(e.target.value) || 0)}
                                                    placeholder="5000"
                                                    className="focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Details */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Collaboration Type</label>
                                                    <select
                                                        value={formData.collaborationType}
                                                        onChange={(e) => handleFormChange('collaborationType', e.target.value)}
                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                                    >
                                                        <option value="Paid Collaboration">Paid Collaboration</option>
                                                        <option value="Product Barter">Product Barter</option>
                                                        <option value="Shoutout">Shoutout</option>
                                                        <option value="Brand Ambassador">Brand Ambassador</option>
                                                        <option value="Affiliate Marketing">Affiliate Marketing</option>
                                                        <option value="Event Partnership">Event Partnership</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Contact Email</label>
                                                    <Input
                                                        type="email"
                                                        value={formData.contactEmail}
                                                        onChange={(e) => handleFormChange('contactEmail', e.target.value)}
                                                        placeholder="your@email.com"
                                                        className="focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                                                    <Input
                                                        type="tel"
                                                        value={formData.phoneNumber}
                                                        onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                                                        placeholder="+91 98765 43210"
                                                        className="focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Media Kit</label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="url"
                                                            value={formData.mediaKitUrl}
                                                            onChange={(e) => handleFormChange('mediaKitUrl', e.target.value)}
                                                            placeholder="https://your-mediakit.com"
                                                            className="focus:ring-2 focus:ring-purple-500 flex-1"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => document.getElementById('mediakit-upload').click()}
                                                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                                        >
                                                            <Upload className="w-4 h-4" />
                                                        </Button>
                                                        <input
                                                            id="mediakit-upload"
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            className="hidden"
                                                            onChange={(e) => e.target.files[0] && uploadMediaKit(e.target.files[0])}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Profile Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-blue-600" />
                                        Profile Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                            <div className="text-2xl font-bold text-blue-600">{formData.followers.toLocaleString()}</div>
                                            <div className="text-sm text-gray-600">Followers</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                            <Heart className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                            <div className="text-2xl font-bold text-green-600">{formData.engagementRate.toFixed(1)}%</div>
                                            <div className="text-sm text-gray-600">Engagement</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                            <Eye className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                                            <div className="text-2xl font-bold text-purple-600">{formData.avgViews.toLocaleString()}</div>
                                            <div className="text-sm text-gray-600">Avg Views</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                                            <DollarSign className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                                            <div className="text-2xl font-bold text-yellow-600">
                                                ₹{auditData.pitchInsights.suggestedPrice.post.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600">Suggested Price</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {/* Metrics Tab */}
                    {activeTab === 'metrics' && (
                        <div className="space-y-6">
                            {/* Performance Metrics Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    {
                                        label: 'Engagement Score',
                                        value: auditData.performanceMetrics.engagementScore,
                                        icon: Heart,
                                        color: 'text-red-600 bg-red-50',
                                        description: 'Weighted average of likes, comments, saves, shares'
                                    },
                                    {
                                        label: 'Authenticity Score',
                                        value: auditData.performanceMetrics.authenticityScore,
                                        icon: Shield,
                                        color: 'text-green-600 bg-green-50',
                                        description: 'Detects fake followers / engagement ratio'
                                    },
                                    {
                                        label: 'Audience Quality',
                                        value: auditData.performanceMetrics.audienceQualityScore,
                                        icon: Users,
                                        color: 'text-blue-600 bg-blue-50',
                                        description: 'Real vs suspicious followers'
                                    },
                                    {
                                        label: 'Content Consistency',
                                        value: auditData.performanceMetrics.contentConsistencyScore,
                                        icon: Calendar,
                                        color: 'text-purple-600 bg-purple-50',
                                        description: 'Posting frequency and style match'
                                    },
                                    {
                                        label: 'Brand Fit Index',
                                        value: auditData.performanceMetrics.brandFitScore,
                                        icon: Target,
                                        color: 'text-yellow-600 bg-yellow-50',
                                        description: 'AI-based match score between creator and brands'
                                    },
                                    {
                                        label: 'Growth Trend',
                                        value: auditData.performanceMetrics.growthTrendScore,
                                        icon: TrendingUp,
                                        color: 'text-teal-600 bg-teal-50',
                                        description: 'Weekly/monthly growth pattern'
                                    }
                                ].map((metric, index) => {
                                    const Icon = metric.icon;
                                    return (
                                        <Card key={index} className="hover:shadow-lg transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`p-3 rounded-lg ${metric.color}`}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-3xl font-bold text-gray-800">{metric.value}</div>
                                                        <div className="text-sm text-gray-500">/100</div>
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-gray-800 mb-2">{metric.label}</h3>
                                                <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-1000 ${metric.color.split(' ')[0].replace('text', 'bg')}`}
                                                        style={{ width: `${metric.value}%` }}
                                                    ></div>
                                                </div>
                                                <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${getScoreColor(metric.value)}`}>
                                                    {getScoreLabel(metric.value)}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Audience Demographics with Pie Charts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-blue-600" />
                                            Age Demographics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={auditData.audienceDemographics.ageGroups}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {auditData.audienceDemographics.ageGroups.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-pink-600" />
                                            Gender Distribution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={auditData.audienceDemographics.genderDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {auditData.audienceDemographics.genderDistribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Content Performance Pie Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="w-5 h-5 text-purple-600" />
                                        Content Type Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={auditData.contentAnalysis.topPerformingTypes}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {auditData.contentAnalysis.topPerformingTypes.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-4">
                                            {auditData.contentAnalysis.topPerformingTypes.map((type, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full"
                                                            style={{ backgroundColor: type.color }}
                                                        ></div>
                                                        <div>
                                                            <div className="font-medium">{type.name}</div>
                                                            <div className="text-sm text-gray-600">Engagement: {type.engagement}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-lg font-bold text-purple-600">{type.value}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Growth Trend Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        Growth Trend (6 Months)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={auditData.contentAnalysis.growthTrend}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Area
                                                    type="monotone"
                                                    dataKey="followers"
                                                    stroke="#8884d8"
                                                    fill="#8884d8"
                                                    fillOpacity={0.3}
                                                    name="Followers"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="engagement"
                                                    stroke="#82ca9d"
                                                    fill="#82ca9d"
                                                    fillOpacity={0.3}
                                                    name="Engagement Rate (%)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {/* Insights Tab */}
                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            {/* Pitch Insights Header */}
                            <Card className="border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50 to-purple-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-gradient-to-r from-teal-500 to-purple-500 rounded-lg">
                                            <Target className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">Pitch Insights</h2>
                                            <p className="text-gray-600">AI-powered recommendations for brand partnerships</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Suggested Collaboration Pricing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        Suggested Collaboration Price (₹)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                            <div className="w-12 h-12 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-3xl font-bold text-green-600 mb-1">
                                                ₹{auditData.pitchInsights.suggestedPrice.post.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">Feed Post</div>
                                            <div className="text-xs text-gray-500 mt-1">Based on engagement & followers</div>
                                        </div>
                                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                            <div className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Video className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                                ₹{auditData.pitchInsights.suggestedPrice.reel.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">Reel</div>
                                            <div className="text-xs text-gray-500 mt-1">Higher engagement format</div>
                                        </div>
                                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                            <div className="w-12 h-12 mx-auto mb-3 bg-purple-500 rounded-full flex items-center justify-center">
                                                <Clock className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-3xl font-bold text-purple-600 mb-1">
                                                ₹{auditData.pitchInsights.suggestedPrice.story.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">Story</div>
                                            <div className="text-xs text-gray-500 mt-1">24-hour visibility</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI-Powered Brand Recommendations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-5 h-5 text-purple-600" />
                                            AI-Powered Brand Recommendations
                                            {aiBrandRecommendations.length === 0 && (
                                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                                    <Brain className="w-3 h-3 animate-pulse" />
                                                    AI Analyzing...
                                                </span>
                                            )}
                                        </div>
                                        {aiBrandRecommendations.length > 0 && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={async () => {
                                                    setAiBrandRecommendations([]);
                                                    const profileData = selectedProfile?.profileData || {};
                                                    const brands = await generateAIBrandRecommendations(
                                                        profileData,
                                                        auditData.profile.category,
                                                        auditData.profile.followers,
                                                        auditData.profile.engagementRate
                                                    );
                                                    setAiBrandRecommendations(brands);
                                                }}
                                                className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-1" />
                                                Refresh
                                            </Button>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {aiBrandRecommendations.length === 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                                                <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 text-center animate-pulse">
                                                    <div className="w-10 h-10 mx-auto mb-3 bg-gray-300 rounded-full flex items-center justify-center">
                                                        <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                                                    </div>
                                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {auditData.pitchInsights.recommendedBrands.map((brand, index) => (
                                                <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-teal-50 rounded-lg border border-purple-200 text-center hover:shadow-md transition-shadow cursor-pointer group">
                                                    <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Briefcase className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="font-semibold text-gray-800">{brand}</div>
                                                    <div className="text-xs text-gray-600 mt-1">AI Recommended</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 text-sm text-blue-700">
                                            <Brain className="w-4 h-4" />
                                            <span className="font-medium">
                                                {aiBrandRecommendations.length > 0
                                                    ? 'These brands are AI-selected based on your profile, niche, and audience demographics.'
                                                    : 'AI is analyzing your profile to find the perfect brand matches...'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Performing Post Type & Best Posting Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            Top Performing Post Type
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                <Video className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800 mb-2">
                                                {auditData.pitchInsights.topPerformingPostType}
                                            </div>
                                            <div className="text-sm text-gray-600">Gets highest engagement</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-blue-500" />
                                            Best Posting Time
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-teal-500 rounded-full flex items-center justify-center">
                                                <Clock className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800 mb-2">
                                                {auditData.pitchInsights.bestPostingTime}
                                            </div>
                                            <div className="text-sm text-gray-600">Peak audience activity</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Estimated ROI for Brands */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        Estimated ROI for Brands
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                            <Eye className="w-8 h-8 mx-auto mb-3 text-green-600" />
                                            <div className="text-2xl font-bold text-green-600 mb-1">
                                                {auditData.pitchInsights.estimatedROI.estimatedReach.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">Estimated Reach</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                            <Heart className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                                {auditData.pitchInsights.estimatedROI.estimatedEngagement.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">Estimated Engagement</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                            <DollarSign className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                                            <div className="text-2xl font-bold text-purple-600 mb-1">
                                                ₹{auditData.pitchInsights.estimatedROI.estimatedValue.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">Estimated Value</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Audience Locations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-teal-600" />
                                        Audience Location Split
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {auditData.audienceDemographics.topLocations.map((location, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-bold text-white">{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800">{location.country}</div>
                                                        <div className="text-sm text-gray-600">Audience location</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-teal-600">{location.percentage}%</div>
                                                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full"
                                                            style={{ width: `${location.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recommendations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-500" />
                                        AI Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {auditData.recommendations.map((rec, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-yellow-800">{rec}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {/* Pitch Tab */}
                    {activeTab === 'pitch' && (
                        <div className="space-y-6">
                            {!pitchData && !generating ? (
                                <Card className="p-8 text-center">
                                    <Brain className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Generate Your AI Pitch Deck</h3>
                                    <p className="text-gray-600 mb-6">
                                        Create a professional pitch deck using AI based on your profile metrics and insights.
                                    </p>
                                    <Button
                                        onClick={() => generateAIPitch(auditData)}
                                        disabled={generating}
                                        className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white"
                                        size="lg"
                                    >
                                        {generating ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                                        ) : (
                                            <><Brain className="w-5 h-5 mr-2" /> Generate AI Pitch</>
                                        )}
                                    </Button>
                                </Card>
                            ) : !pitchData && generating ? (
                                <Card className="p-8 text-center">
                                    <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-spin" />
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Generating Your AI Pitch Deck</h3>
                                    <p className="text-gray-600">
                                        Creating a personalized pitch deck based on your profile data and insights...
                                    </p>
                                </Card>
                            ) : (
                                <>
                                    {/* Pitch Header */}
                                    <Card className="overflow-hidden">
                                        <CardHeader className="bg-gradient-to-r from-purple-600 to-teal-600 text-white">
                                            <div className="text-center">
                                                <CardTitle className="text-3xl mb-2">Brand Partnership Pitch</CardTitle>
                                                <p className="text-purple-100">@{formData.handle} • {formData.platform}</p>
                                            </div>
                                        </CardHeader>
                                    </Card>

                                    {/* Introduction */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-purple-600" />
                                                Introduction
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700 leading-relaxed">{pitchData.introduction}</p>
                                        </CardContent>
                                    </Card>

                                    {/* Key Selling Points */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Star className="w-5 h-5 text-yellow-500" />
                                                Key Selling Points
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {pitchData.keySellingPoints.map((point, index) => (
                                                    <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg border border-purple-200">
                                                        <CheckCircle className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-800">{point}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Target Brand Categories */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Target className="w-5 h-5 text-blue-600" />
                                                Target Brand Categories
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-3">
                                                {pitchData.targetBrandCategories.map((category, index) => (
                                                    <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 rounded-full font-medium border border-purple-200">
                                                        {category}
                                                    </span>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Value Proposition */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Award className="w-5 h-5 text-green-600" />
                                                Value Proposition
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-l-4 border-green-500">
                                                <p className="text-gray-800 leading-relaxed font-medium">{pitchData.valueProposition}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Campaign Ideas */}
                                    {pitchData.campaignIdeas && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                                    Campaign Ideas
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {pitchData.campaignIdeas.map((campaign, index) => (
                                                        <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                                                            <h4 className="font-semibold text-lg mb-2">{campaign.title}</h4>
                                                            <p className="text-gray-700 mb-3">{campaign.description}</p>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-600 mb-2">Deliverables:</div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {campaign.deliverables.map((deliverable, idx) => (
                                                                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                                            {deliverable}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Contact Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                                Contact Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {formData.contactEmail && (
                                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                        <Mail className="w-5 h-5 text-blue-600" />
                                                        <div>
                                                            <div className="text-sm text-gray-600">Email</div>
                                                            <div className="font-medium text-gray-800">{formData.contactEmail}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {formData.phoneNumber && (
                                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                        <Phone className="w-5 h-5 text-green-600" />
                                                        <div>
                                                            <div className="text-sm text-gray-600">Phone</div>
                                                            <div className="font-medium text-gray-800">{formData.phoneNumber}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {formData.mediaKitUrl && (
                                                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                        <FileText className="w-5 h-5 text-purple-600" />
                                                        <div>
                                                            <div className="text-sm text-gray-600">Media Kit</div>
                                                            <a href={formData.mediaKitUrl} target="_blank" rel="noopener noreferrer"
                                                                className="font-medium text-purple-600 hover:underline flex items-center gap-1">
                                                                View Media Kit <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                                                    <MapPin className="w-5 h-5 text-teal-600" />
                                                    <div>
                                                        <div className="text-sm text-gray-600">Location</div>
                                                        <div className="font-medium text-gray-800">{formData.city}, {formData.country}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Call to Action */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-yellow-500" />
                                                Ready to Collaborate?
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center p-6 bg-gradient-to-r from-purple-600 to-teal-600 rounded-lg text-white">
                                                <p className="text-lg mb-4">{pitchData.callToAction}</p>
                                                <div className="flex gap-4 justify-center flex-wrap">
                                                    {formData.contactEmail && (
                                                        <Button
                                                            className="bg-white text-purple-600 hover:bg-gray-100"
                                                            onClick={() => window.open(`mailto:${formData.contactEmail}?subject=Brand Partnership Inquiry`)}
                                                        >
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            Email Me
                                                        </Button>
                                                    )}
                                                    {formData.phoneNumber && (
                                                        <Button
                                                            variant="outline"
                                                            className="border-white text-white hover:bg-white hover:text-purple-600"
                                                            onClick={() => window.open(`tel:${formData.phoneNumber}`)}
                                                        >
                                                            <Phone className="w-4 h-4 mr-2" />
                                                            Call Me
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        className="border-white text-white hover:bg-white hover:text-purple-600"
                                                        onClick={downloadPDF}
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download Pitch
                                                    </Button>
                                                    {shareableLink && (
                                                        <Button
                                                            variant="outline"
                                                            className="border-white text-white hover:bg-white hover:text-purple-600"
                                                            onClick={() => navigator.clipboard.writeText(shareableLink)}
                                                        >
                                                            <Copy className="w-4 h-4 mr-2" />
                                                            Copy Link
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PitchAudit;