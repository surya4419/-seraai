import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import pitchAuditService from '../services/pitchAuditService';
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

const SharedPitch = () => {
    const { shareId } = useParams();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSharedReport();
    }, [shareId]);

    const loadSharedReport = async () => {
        try {
            const response = await pitchAuditService.getSharedReport(shareId);
            setReportData(response.data);
        } catch (error) {
            console.error('Failed to load shared report:', error);
            setError('Report not found or has expired');
        } finally {
            setLoading(false);
        }
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            instagram: Instagram,
            youtube: Youtube,
            twitter: Twitter,
            linkedin: Linkedin,
            tiktok: Video
        };
        return icons[platform] || Globe;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
                    <p className="text-gray-600">Loading pitch report...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Report Not Found</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => window.location.href = '/'}>
                            Go to Homepage
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h2>
                        <p className="text-gray-600">This report appears to be empty.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-teal-600 text-white py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-2">Creator Pitch Report</h1>
                        <p className="text-purple-100">Professional brand partnership proposal</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Profile Header */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-purple-500 to-teal-500 text-white pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 border-4 border-white/30">
                                    <div className="w-full h-full flex items-center justify-center text-white">
                                        <User className="w-12 h-12" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CardTitle className="text-3xl text-white">{reportData.profile?.name || 'Creator'}</CardTitle>
                                        {reportData.profile?.isVerified && (
                                            <CheckCircle className="w-7 h-7 text-white" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        {React.createElement(getPlatformIcon(reportData.profile?.platform), { className: "w-6 h-6 text-white" })}
                                        <span className="text-xl font-medium text-white">@{reportData.profile?.handle}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-white/90">
                                        <span className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {reportData.profile?.location || 'Global'}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            {reportData.profile?.category || 'Creator'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <Users className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                {(reportData.profile?.followers || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Followers</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                            <Heart className="w-10 h-10 mx-auto mb-3 text-green-600" />
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {(reportData.profile?.engagementRate || 0).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Engagement Rate</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                            <Eye className="w-10 h-10 mx-auto mb-3 text-purple-600" />
                            <div className="text-3xl font-bold text-purple-600 mb-1">
                                {(reportData.profile?.avgViews || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Avg Views</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                            <Star className="w-10 h-10 mx-auto mb-3 text-yellow-600" />
                            <div className="text-3xl font-bold text-yellow-600 mb-1">
                                {reportData.performanceMetrics?.overallRating || 0}/100
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Overall Score</div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center p-6 bg-gradient-to-r from-purple-600 to-teal-600 rounded-lg text-white">
                                <h3 className="text-2xl font-bold mb-4">Ready to Collaborate?</h3>
                                <p className="text-lg mb-6">Let's create amazing content together that drives real results for your brand.</p>
                                <div className="flex gap-4 justify-center flex-wrap">
                                    <Button className="bg-white text-purple-600 hover:bg-gray-100">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Contact Creator
                                    </Button>
                                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Report
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center py-8 text-gray-500">
                        <p>This report was generated by Creator Agent Platform</p>
                        <p className="text-sm mt-2">Professional creator-brand partnership solutions</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedPitch;