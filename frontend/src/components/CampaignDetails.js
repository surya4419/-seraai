import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Plus, X, MapPin, Globe, Calendar, Link2,
    Sparkles, Save, ChevronDown, ChevronRight, Edit3,
    Instagram, Youtube, Music, Twitter, Linkedin,
    Target, Users, DollarSign, Clock, CheckCircle,
    AlertCircle, Loader2, Copy, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import axios from 'axios';

// Suppress ResizeObserver errors (common with Radix UI components)
const originalError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
        return;
    }
    originalError.call(console, ...args);
};

// Safe Select wrapper to handle ResizeObserver errors
const SafeSelect = ({ children, ...props }) => {
    try {
        return <Select {...props}>{children}</Select>;
    } catch (error) {
        if (error.message && error.message.includes('ResizeObserver')) {
            console.warn('ResizeObserver error suppressed in Select component');
            return <Select {...props}>{children}</Select>;
        }
        throw error;
    }
};

const CampaignDetails = ({ onBack, onContinue, campaignData = {} }) => {
    // Form states
    const [placements, setPlacements] = useState([]);
    const [locations, setLocations] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [postDate, setPostDate] = useState('');
    const [postDateType, setPostDateType] = useState('single'); // 'single' or 'period'
    const [postDatePeriod, setPostDatePeriod] = useState({ start: '', end: '' });
    const [audienceLinks, setAudienceLinks] = useState([]);
    const [campaignBrief, setCampaignBrief] = useState('');
    const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
    const [loading, setLoading] = useState(false);

    // Dialog states
    const [showLocationDialog, setShowLocationDialog] = useState(false);
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);

    // Temporary input states for dialogs
    const [newLocation, setNewLocation] = useState({ country: '', city: '' });
    const [newLanguage, setNewLanguage] = useState('');
    const [newLink, setNewLink] = useState({ url: '', description: '' });

    // Debounced handlers to prevent rapid state changes
    const debouncedSetNewLocation = React.useCallback(
        React.useMemo(() => {
            let timeoutId;
            return (value) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setNewLocation(prev => ({ ...prev, country: value }));
                }, 100);
            };
        }, []),
        []
    );

    // Available options
    const placementOptions = React.useMemo(() => [
        { id: 'insta_reel', name: 'Instagram Reel', icon: Instagram, color: 'bg-pink-500' },
        { id: 'insta_post', name: 'Instagram Post', icon: Instagram, color: 'bg-purple-500' },
        { id: 'insta_story', name: 'Instagram Story', icon: Instagram, color: 'bg-orange-500' },
        { id: 'tiktok_reel', name: 'TikTok Reel', icon: Music, color: 'bg-black' },
        { id: 'youtube_short', name: 'YouTube Short', icon: Youtube, color: 'bg-red-500' },
        { id: 'youtube_video', name: 'YouTube Video', icon: Youtube, color: 'bg-red-600' },
        { id: 'twitter_post', name: 'Twitter Post', icon: Twitter, color: 'bg-blue-500' },
        { id: 'linkedin_post', name: 'LinkedIn Post', icon: Linkedin, color: 'bg-blue-700' }
    ], []);

    const countries = React.useMemo(() => [
        'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
        'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway',
        'Denmark', 'India', 'Japan', 'South Korea', 'Brazil', 'Mexico'
    ], []);

    const commonLanguages = React.useMemo(() => [
        'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
        'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Japanese', 'Korean',
        'Mandarin', 'Hindi', 'Arabic', 'Russian'
    ], []);

    useEffect(() => {
        // Initialize with campaign data if available
        if (campaignData) {
            setPlacements(campaignData.placements || []);
            setLocations(campaignData.locations || []);
            setLanguages(campaignData.languages || []);
            setPostDate(campaignData.postDate || '');
            setAudienceLinks(campaignData.audienceLinks || []);
            setCampaignBrief(campaignData.campaignBrief || '');
        }

        // Handle ResizeObserver errors
        const handleResizeObserverError = (e) => {
            if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
                e.stopImmediatePropagation();
            }
        };

        window.addEventListener('error', handleResizeObserverError);

        return () => {
            window.removeEventListener('error', handleResizeObserverError);
        };
    }, [campaignData]);

    const handlePlacementToggle = (placement) => {
        setPlacements(prev => {
            const exists = prev.find(p => p.id === placement.id);
            if (exists) {
                return prev.filter(p => p.id !== placement.id);
            } else {
                return [...prev, placement];
            }
        });
    };

    const handleAddLocation = () => {
        if (!newLocation.country) {
            toast.error('Please select a country');
            return;
        }

        const locationExists = locations.some(loc =>
            loc.country === newLocation.country &&
            (!newLocation.city || loc.city === newLocation.city)
        );

        if (locationExists) {
            toast.error('Location already added');
            return;
        }

        setLocations(prev => [...prev, {
            id: Date.now(),
            country: newLocation.country,
            city: newLocation.city || 'All Cities'
        }]);
        setNewLocation({ country: '', city: '' });
        setShowLocationDialog(false);
        toast.success('Location added successfully');
    };

    const handleRemoveLocation = (locationId) => {
        setLocations(prev => prev.filter(loc => loc.id !== locationId));
        toast.success('Location removed');
    };

    const handleAddLanguage = () => {
        if (!newLanguage) {
            toast.error('Please enter a language');
            return;
        }

        if (languages.includes(newLanguage)) {
            toast.error('Language already added');
            return;
        }

        setLanguages(prev => [...prev, newLanguage]);
        setNewLanguage('');
        setShowLanguageDialog(false);
        toast.success('Language added successfully');
    };

    const handleRemoveLanguage = (language) => {
        setLanguages(prev => prev.filter(lang => lang !== language));
        toast.success('Language removed');
    };

    const handleAddLink = () => {
        if (!newLink.url) {
            toast.error('Please enter a URL');
            return;
        }

        // Basic URL validation
        try {
            new URL(newLink.url);
        } catch {
            toast.error('Please enter a valid URL');
            return;
        }

        setAudienceLinks(prev => [...prev, {
            id: Date.now(),
            url: newLink.url,
            description: newLink.description || 'Campaign Link'
        }]);
        setNewLink({ url: '', description: '' });
        setShowLinkDialog(false);
        toast.success('Link added successfully');
    };

    const handleRemoveLink = (linkId) => {
        setAudienceLinks(prev => prev.filter(link => link.id !== linkId));
        toast.success('Link removed');
    };

    const generateCampaignBrief = async () => {
        if (placements.length === 0 || locations.length === 0) {
            toast.error('Please add at least one placement and location before generating brief');
            return;
        }

        setIsGeneratingBrief(true);
        try {
            // Mock AI generation - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            const placementNames = placements.map(p => p.name).join(', ');
            const locationNames = locations.map(l => `${l.city}, ${l.country}`).join(', ');
            const languageList = languages.join(', ') || 'English';

            const generatedBrief = `
## Campaign Brief & Guidelines

### Campaign Overview
This influencer marketing campaign is designed to promote our brand through authentic, engaging content across ${placementNames}. The campaign targets audiences in ${locationNames} with content delivered in ${languageList}.

### Content Requirements
**Placements:** ${placementNames}
**Target Locations:** ${locationNames}
**Languages:** ${languageList}
**Post Date:** ${postDate || postDatePeriod.start && postDatePeriod.end ? `${postDatePeriod.start} to ${postDatePeriod.end}` : 'To be determined'}

### Content Guidelines
1. **Authenticity First:** Create content that feels natural and aligns with your usual posting style
2. **Brand Integration:** Seamlessly integrate our product/service into your content narrative
3. **Call-to-Action:** Include clear, compelling calls-to-action directing audience to our campaign links
4. **Hashtag Strategy:** Use a mix of branded hashtags and relevant trending hashtags
5. **Quality Standards:** Ensure high-quality visuals and audio in all content

### Engagement Requirements
- Respond to comments within 24 hours of posting
- Share content to your stories (where applicable)
- Monitor engagement metrics and provide performance reports

### Compliance & Disclosure
- Include proper FTC disclosure (#ad, #sponsored, #partnership)
- Follow platform-specific advertising guidelines
- Maintain brand safety standards in all content

### Deliverables Timeline
- Content draft submission: 3 days before post date
- Revisions (if needed): 1 day before post date
- Live posting: As scheduled
- Performance report: 7 days after posting

### Success Metrics
- Engagement rate (likes, comments, shares)
- Reach and impressions
- Click-through rate to campaign links
- Brand mention sentiment
- Audience growth during campaign period

This brief serves as a comprehensive guide for creating impactful content that resonates with your audience while achieving our campaign objectives.
            `.trim();

            setCampaignBrief(generatedBrief);
            toast.success('Campaign brief generated successfully!');
        } catch (error) {
            toast.error('Failed to generate campaign brief');
        } finally {
            setIsGeneratingBrief(false);
        }
    };

    const handleSaveAndContinue = async () => {
        // Validation
        if (placements.length === 0) {
            toast.error('Please select at least one placement');
            return;
        }

        if (locations.length === 0) {
            toast.error('Please add at least one location');
            return;
        }

        if (languages.length === 0) {
            toast.error('Please add at least one language');
            return;
        }

        if (!postDate && (!postDatePeriod.start || !postDatePeriod.end)) {
            toast.error('Please specify the post date');
            return;
        }

        if (!campaignBrief.trim()) {
            toast.error('Please generate or add a campaign brief');
            return;
        }

        setLoading(true);
        try {
            const campaignDetails = {
                placements,
                locations,
                languages,
                postDate: postDateType === 'single' ? postDate : postDatePeriod,
                postDateType,
                audienceLinks,
                campaignBrief
            };

            // Mock API call - replace with actual endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Campaign details saved successfully!');

            // Navigate to requirements page
            if (onContinue) {
                onContinue(campaignDetails);
            }
        } catch (error) {
            toast.error('Failed to save campaign details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Campaign Details</h1>
                            <p className="text-gray-600 mt-1">Configure your campaign specifications and requirements</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Step 2 of 3
                        </Badge>
                    </div>
                </div>

                {/* Placements Section */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Content Placements
                        </CardTitle>
                        <p className="text-sm text-gray-600">Select the platforms and content types for your campaign</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {placementOptions.map(placement => {
                                const Icon = placement.icon;
                                const isSelected = placements.some(p => p.id === placement.id);

                                return (
                                    <button
                                        key={placement.id}
                                        onClick={() => handlePlacementToggle(placement)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-10 h-10 rounded-lg ${placement.color} flex items-center justify-center`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{placement.name}</span>
                                            {isSelected && (
                                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {placements.length > 0 && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm font-medium text-blue-900 mb-2">Selected Placements:</p>
                                <div className="flex flex-wrap gap-2">
                                    {placements.map(placement => (
                                        <Badge key={placement.id} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                            {placement.name}
                                            <button
                                                onClick={() => handlePlacementToggle(placement)}
                                                className="ml-2 hover:bg-blue-300 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Locations Section */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            Target Locations
                        </CardTitle>
                        <p className="text-sm text-gray-600">Specify countries and cities for your campaign</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-dashed">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Location
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Target Location</DialogTitle>
                                        <p className="text-sm text-gray-600">Select a country and optionally specify a city for targeting</p>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Country *</label>
                                            <SafeSelect
                                                value={newLocation.country}
                                                onValueChange={(value) => setNewLocation(prev => ({ ...prev, country: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a country" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 overflow-y-auto">
                                                    {countries.map(country => (
                                                        <SelectItem key={country} value={country}>{country}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </SafeSelect>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">City (Optional)</label>
                                            <Input
                                                placeholder="Enter city name or leave blank for all cities"
                                                value={newLocation.city}
                                                onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleAddLocation} className="flex-1">
                                                Add Location
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowLocationDialog(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {locations.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Added Locations:</p>
                                <div className="flex flex-wrap gap-2">
                                    {locations.map(location => (
                                        <Badge key={location.id} className="bg-green-100 text-green-800 hover:bg-green-200">
                                            <Globe className="w-3 h-3 mr-1" />
                                            {location.city}, {location.country}
                                            <button
                                                onClick={() => handleRemoveLocation(location.id)}
                                                className="ml-2 hover:bg-green-300 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Languages Section */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-purple-600" />
                            Content Languages
                        </CardTitle>
                        <p className="text-sm text-gray-600">Specify the languages for your campaign content</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-dashed">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Language
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Content Language</DialogTitle>
                                        <p className="text-sm text-gray-600">Choose a language for your campaign content</p>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Select Language</label>
                                            <SafeSelect value={newLanguage} onValueChange={setNewLanguage}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a language" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 overflow-y-auto">
                                                    {commonLanguages.map(language => (
                                                        <SelectItem key={language} value={language}>{language}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </SafeSelect>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Or Enter Custom Language</label>
                                            <Input
                                                placeholder="Enter language name"
                                                value={newLanguage}
                                                onChange={(e) => setNewLanguage(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleAddLanguage} className="flex-1">
                                                Add Language
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowLanguageDialog(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {languages.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Content Languages:</p>
                                <div className="flex flex-wrap gap-2">
                                    {languages.map(language => (
                                        <Badge key={language} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                                            {language}
                                            <button
                                                onClick={() => handleRemoveLanguage(language)}
                                                className="ml-2 hover:bg-purple-300 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Post Date Section */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-600" />
                            Post Date & Schedule
                        </CardTitle>
                        <p className="text-sm text-gray-600">When should the content be published?</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="dateType"
                                    value="single"
                                    checked={postDateType === 'single'}
                                    onChange={(e) => setPostDateType(e.target.value)}
                                    className="text-blue-600"
                                />
                                <span className="text-sm font-medium">Single Date</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="dateType"
                                    value="period"
                                    checked={postDateType === 'period'}
                                    onChange={(e) => setPostDateType(e.target.value)}
                                    className="text-blue-600"
                                />
                                <span className="text-sm font-medium">Date Range</span>
                            </label>
                        </div>

                        {postDateType === 'single' ? (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Post Date</label>
                                <Input
                                    type="date"
                                    value={postDate}
                                    onChange={(e) => setPostDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                                    <Input
                                        type="date"
                                        value={postDatePeriod.start}
                                        onChange={(e) => setPostDatePeriod(prev => ({ ...prev, start: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">End Date</label>
                                    <Input
                                        type="date"
                                        value={postDatePeriod.end}
                                        onChange={(e) => setPostDatePeriod(prev => ({ ...prev, end: e.target.value }))}
                                        min={postDatePeriod.start || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Audience Links Section */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-indigo-600" />
                            Audience Links
                        </CardTitle>
                        <p className="text-sm text-gray-600">Where should your audience be directed when they click?</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-dashed">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Link
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Audience Link</DialogTitle>
                                        <p className="text-sm text-gray-600">Add a link where your audience should be directed</p>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">URL *</label>
                                            <Input
                                                placeholder="https://example.com"
                                                value={newLink.url}
                                                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Description</label>
                                            <Input
                                                placeholder="e.g., Product page, Landing page, etc."
                                                value={newLink.description}
                                                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleAddLink} className="flex-1">
                                                Add Link
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {audienceLinks.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700">Campaign Links:</p>
                                {audienceLinks.map(link => (
                                    <div key={link.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-indigo-900">{link.description}</p>
                                            <p className="text-xs text-indigo-700 truncate">{link.url}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(link.url, '_blank')}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveLink(link.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Campaign Brief Section */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-600" />
                            Campaign Brief & Guidelines
                        </CardTitle>
                        <p className="text-sm text-gray-600">AI-generated brief based on your campaign details</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={generateCampaignBrief}
                                disabled={isGeneratingBrief || placements.length === 0 || locations.length === 0}
                                className="bg-yellow-600 hover:bg-yellow-700"
                            >
                                {isGeneratingBrief ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                )}
                                {isGeneratingBrief ? 'Generating...' : 'Generate AI Brief'}
                            </Button>
                            {campaignBrief && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(campaignBrief);
                                        toast.success('Brief copied to clipboard');
                                    }}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </Button>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Campaign Brief</label>
                            <Textarea
                                placeholder="Generate an AI brief or write your own campaign guidelines..."
                                value={campaignBrief}
                                onChange={(e) => setCampaignBrief(e.target.value)}
                                className="min-h-[300px] font-mono text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save and Continue */}
                <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-600">
                        Make sure all details are correct before proceeding to requirements
                    </div>
                    <Button
                        onClick={handleSaveAndContinue}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 px-8"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {loading ? 'Saving...' : 'Save & Continue'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetails;