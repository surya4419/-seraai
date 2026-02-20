import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    Download, Filter, ChevronDown, Activity, Users, DollarSign, Eye, MousePointer
} from 'lucide-react';

const BrandReport = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('campaign'); // 'campaign' or 'influencer'
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);

    // Mock Data for Initial UI Development
    const mockReport = {
        campaign: {
            title: "Product demo: A full campaign presentation",
            objective: "Website Traffic",
            period: "August 3, 2025 - September 3, 2025",
            updatedAt: "September 15, 2025",
            cost: "28.7K",
            metrics: {
                views: { forecast: "3.5M", actual: "3.4M" },
                clicks: { forecast: "27.2K", actual: "27.0K" },
                cpm: { forecast: "$4.51", actual: "$4.48" },
                cpc: { forecast: "$0.40", actual: "$0.40" }
            }
        },
        chartData: [
            { name: 'Marketplace Entrepreneurs', actual: 4000, forecast: 2400 },
            { name: 'AI Enthusiasts', actual: 3000, forecast: 1398 },
            { name: 'Content Creators', actual: 2000, forecast: 9800 },
            { name: 'Creative Tech', actual: 2780, forecast: 3908 },
            { name: 'Social Media', actual: 1890, forecast: 4800 },
        ],
        influencers: [
            {
                id: 1,
                name: "Iris Kye",
                handle: "@iris_kye_",
                platform: "instagram",
                avatar: "https://placehold.co/40x40",
                finalLink: "https://www.instagram.com/reel/C8...",
                status: "published",
                metrics: {
                    views: { forecast: "125K", actual: "125K" },
                    clicks: { forecast: "1.2K", actual: "1.1K" },
                    cpm: { forecast: "$4.20", actual: "$4.10" },
                    cpc: { forecast: "$0.35", actual: "$0.38" }
                }
            },
            {
                id: 2,
                name: "Jillian",
                handle: "@Jillian_",
                platform: "tiktok",
                avatar: "https://placehold.co/40x40",
                finalLink: "Content not published yet",
                status: "pending",
                metrics: {
                    views: { forecast: "N/A", actual: "N/A" },
                    clicks: { forecast: "N/A", actual: "N/A" },
                    cpm: { forecast: "N/A", actual: "N/A" },
                    cpc: { forecast: "N/A", actual: "N/A" }
                }
            }
        ]
    };

    useEffect(() => {
        // Simulate API Fetch
        setTimeout(() => {
            setReportData(mockReport);
            setLoading(false);
        }, 1000);
    }, [campaignId]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Report...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Report</h1>
                        <div className="text-sm text-gray-500 flex gap-4">
                            <span>Started upon {reportData.campaign.period.split('-')[0]}</span>
                            <span>Objective <span className='font-semibold text-gray-700'>{reportData.campaign.objective}</span></span>
                            <span>Report update date {reportData.campaign.updatedAt}</span>
                            <span>Cost <span className='font-semibold text-gray-700'>{reportData.campaign.cost}</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
                            <button
                                onClick={() => setActiveTab('campaign')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'campaign' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Campaign
                            </button>
                            <button
                                onClick={() => setActiveTab('influencer')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'influencer' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Influencer
                            </button>
                        </div>
                        <div className="relative">
                            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                                {reportData.campaign.period} <ChevronDown size={14} />
                            </button>
                        </div>
                        <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                            <Download size={14} /> Download
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'campaign' ? (
                <>
                    {/* Filters */}
                    <div className="flex gap-3 mb-8">
                        {['All audiences', 'All platforms', 'All creatives'].map(f => (
                            <button key={f} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600">
                                {f} <ChevronDown size={14} />
                            </button>
                        ))}
                    </div>

                    {/* KPI Grid */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                        <div className="grid grid-cols-4 gap-8 text-center text-sm">
                            {/* Header Row */}
                            <div className="col-span-1 text-gray-500 font-medium">Views</div>
                            <div className="col-span-1 text-gray-500 font-medium">Clicks</div>
                            <div className="col-span-1 text-gray-500 font-medium">CPM</div>
                            <div className="col-span-1 text-gray-500 font-medium">CPC</div>

                            {/* Forecast Row */}
                            <div className="flex items-center justify-between col-span-4 border-t border-gray-50 py-4">
                                <div className="w-1/4 text-center">
                                    <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">Forecast</span>
                                    <span className="text-lg font-bold text-gray-900">{reportData.campaign.metrics.views.forecast}</span>
                                </div>
                                <div className="w-1/4 text-center">
                                    <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">Forecast</span>
                                    <span className="text-lg font-bold text-gray-900">{reportData.campaign.metrics.clicks.forecast}</span>
                                </div>
                                <div className="w-1/4 text-center">
                                    <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">Forecast</span>
                                    <span className="text-lg font-bold text-gray-900">{reportData.campaign.metrics.cpm.forecast}</span>
                                </div>
                                <div className="w-1/4 text-center">
                                    <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">Forecast</span>
                                    <span className="text-lg font-bold text-gray-900">{reportData.campaign.metrics.cpc.forecast}</span>
                                </div>
                            </div>

                            {/* Actual Row */}
                            <div className="flex items-center justify-between col-span-4 border-t border-gray-50 pt-4">
                                <div className="w-1/4 text-center">
                                    <span className="text-xs text-blue-500 block mb-1 uppercase tracking-wider">Actual</span>
                                    <span className="text-lg font-bold text-gray-900">{reportData.campaign.metrics.views.actual}</span>
                                </div>
                                <div className="w-1/4 text-center">
                                    <span className="text-xs text-blue-500 block mb-1 uppercase tracking-wider">Actual</span>
                                    <span className="text-lg font-bold text-gray-900">{reportData.campaign.metrics.clicks.actual}</span>
                                </div>
                                <div className="w-1/4 text-center">
                                    <span className="text-xs text-blue-500 block mb-1 uppercase tracking-wider">Actual</span>
                                    <span className="text-lg font-bold text-gray-900">{reportData.campaign.metrics.cpm.actual}</span>
                                </div>
                                <div className="w-1/4 text-center">
                                    <span className="text-xs text-blue-500 block mb-1 uppercase tracking-wider">Actual</span>
                                    <span className="text-lg font-bold text-gray-900">{reportData.campaign.metrics.cpc.actual}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-2">
                                {['Views', 'Clicks', 'CPM', 'CPC'].map(m => (
                                    <button key={m} className={`px-4 py-1.5 rounded-full text-sm font-medium ${m === 'CPM' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <button className="flex items-center gap-2 text-sm text-gray-500">
                                    View by <span className="font-semibold text-gray-700">Audience</span> <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        tick={{ fontSize: 10, fill: '#6B7280' }}
                                        interval={0}
                                    />
                                    <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                                    <Tooltip />
                                    <Bar dataKey="forecast" fill="#FFCC99" radius={[4, 4, 0, 0]} name="Forecast" />
                                    <Bar dataKey="actual" fill="#99CCFF" radius={[4, 4, 0, 0]} name="Actual" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            ) : (
                /* Influencer Tab */
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Influencer</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Final link</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Views</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Clicks</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">CPM</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">CPC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reportData.influencers.map(inf => (
                                <tr key={inf.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={inf.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">{inf.name}</div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    {/* Icons for platform would go here */}
                                                    {inf.handle}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {inf.status === 'published' ? (
                                            <a href={inf.finalLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-[200px] block">
                                                {inf.finalLink}
                                            </a>
                                        ) : (
                                            <span className="text-gray-900 font-medium text-sm">Content not published yet</span>
                                        )}
                                    </td>
                                    {/* Forecast / Actual Rows for each metric */}
                                    <td className="px-6 py-4 text-right align-middle">
                                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-xs">
                                            <span className="text-gray-400">Forecast</span> <span className="font-medium">{inf.metrics.views.forecast}</span>
                                            <span className="text-gray-900">Actual</span> <span className="font-bold">{inf.metrics.views.actual}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right align-middle">
                                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-xs">
                                            <span className="text-gray-400">Forecast</span> <span className="font-medium">{inf.metrics.clicks.forecast}</span>
                                            <span className="text-gray-900">Actual</span> <span className="font-bold">{inf.metrics.clicks.actual}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right align-middle">
                                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-xs">
                                            <span className="text-gray-400">Forecast</span> <span className="font-medium">{inf.metrics.cpm.forecast}</span>
                                            <span className="text-gray-900">Actual</span> <span className="font-bold">{inf.metrics.cpm.actual}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right align-middle">
                                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-xs">
                                            <span className="text-gray-400">Forecast</span> <span className="font-medium">{inf.metrics.cpc.forecast}</span>
                                            <span className="text-gray-900">Actual</span> <span className="font-bold">{inf.metrics.cpc.actual}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BrandReport;
