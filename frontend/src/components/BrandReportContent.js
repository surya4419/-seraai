import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Download, ChevronDown, Calendar
} from 'lucide-react';
import axios from 'axios';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import API_CONFIG from '../config/api';

const BrandReportContent = ({ campaignId }) => {
    const [activeTab, setActiveTab] = useState('campaign'); // 'campaign' or 'influencer'
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState('Views'); // For Chart Interaction
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateRange, setDateRange] = useState({ from: null, to: null });

    // Update date range when report loads period if not set


    // Default Data Structure to ensure Layout loads
    const defaultReportData = {
        campaign: {
            title: "Campaign Report",
            objective: "N/A",
            period: "N/A",
            updatedAt: "N/A",
            cost: "0",
            metrics: {
                views: { forecast: "0", actual: "0" },
                clicks: { forecast: "0", actual: "0" },
                cpm: { forecast: "$0.00", actual: "$0.00" },
                cpc: { forecast: "$0.00", actual: "$0.00" }
            }
        },
        chartData: [],
        influencers: []
    };

    const [reportData, setReportData] = useState(defaultReportData);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                setErrorMsg(null);
                console.log(`Fetching from: ${API_CONFIG.BASE_URL}/api/brand-report/${campaignId}`);
                const response = await axios.get(`${API_CONFIG.BASE_URL}/api/brand-report/${campaignId}`);
                if (response.data.success) {
                    setReportData(response.data.data);
                } else {
                    setErrorMsg("API Success False: " + JSON.stringify(response.data));
                }
            } catch (error) {
                console.error("Error fetching report:", error);
                let detailedMsg = error.message;
                if (error.response && error.response.data) {
                    detailedMsg += " | SERVER ERROR: " + JSON.stringify(error.response.data);
                }
                setErrorMsg(detailedMsg);
            } finally {
                setLoading(false);
            }
        };

        if (campaignId) {
            fetchReport();
        }
    }, [campaignId]);

    if (errorMsg) return <div className="p-8 text-center text-red-500 font-bold border border-red-200 bg-red-50 rounded-lg m-4">Error: {errorMsg} <br /> URL: {API_CONFIG.BASE_URL}/api/brand-report/{campaignId}</div>;

    if (loading && !reportData.campaign.title) return <div className="p-8 text-center text-gray-500">Loading Report...</div>;

    // Chart Data Mapper based on Selected Metric
    const getChartMetricKeys = () => {
        const key = selectedMetric.toLowerCase();
        return {
            forecast: `${key}_forecast`,
            actual: `${key}_actual`
        };
    };
    const chartKeys = getChartMetricKeys();

    return (
        <div className="font-sans w-full mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Report</h1>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                        <span>Started on <span className="text-gray-900 font-medium">{reportData.campaign.period.split('-')[0]}</span></span>
                        <span>Objective <span className="text-gray-900 font-medium">{reportData.campaign.objective}</span></span>
                        <span>Report update date <span className="text-gray-900 font-medium">{reportData.campaign.updatedAt}</span></span>
                        <span>Cost <span className="text-gray-900 font-medium">{reportData.campaign.cost}</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Segmented Control */}
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setActiveTab('campaign')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'campaign' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Campaign
                        </button>
                        <button
                            onClick={() => setActiveTab('influencer')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'influencer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Influencer
                        </button>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Calendar size={14} />
                            <span className="truncate max-w-[150px]">
                                {dateRange.from ? (
                                    dateRange.to ?
                                        `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                                        : format(dateRange.from, 'MMM dd')
                                ) : (reportData.campaign.period === 'N/A' ? 'Select Dates' : reportData.campaign.period)}
                            </span>
                            <ChevronDown size={14} />
                        </button>
                        {showDatePicker && (
                            <div className="absolute top-12 right-0 z-50 bg-white border border-gray-200 shadow-xl rounded-lg p-2">
                                <DayPicker
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    disabled={{ after: new Date() }}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                setLoading(true); // Or distinct refreshing state
                                await axios.post(`${API_CONFIG.BASE_URL}/api/brand-report/refresh/${campaignId}`);
                                // Reload report
                                const response = await axios.get(`${API_CONFIG.BASE_URL}/api/brand-report/${campaignId}`);
                                if (response.data.success) setReportData(response.data.data);
                            } catch (err) {
                                console.error("Refresh failed", err);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        <span>Refresh Data</span>
                    </button>

                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Download size={16} />
                        <span>Download</span>
                    </button>
                </div>
            </div>

            {activeTab === 'campaign' ? (
                <div className="animate-in fade-in duration-300">
                    {/* Filters Row */}
                    <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
                        {['All audiences', 'All platforms', 'All creatives'].map(f => (
                            <button key={f} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:border-gray-300 transition-all">
                                {f} <span className="text-gray-400">×</span>
                            </button>
                        ))}
                    </div>

                    {/* KPI Grid - MATCHING SCREENSHOT */}
                    <div className="bg-white rounded-xl border border-gray-200 mb-8 shadow-sm">
                        <div className="grid grid-cols-5 py-6 border-b border-gray-100">
                            <div className="col-span-1"></div> {/* Empty corner */}
                            {['Views', 'Clicks', 'CPM', 'CPC'].map(metric => (
                                <div key={metric} className="col-span-1 text-center font-medium text-gray-500 text-sm uppercase tracking-wider">
                                    {metric}
                                </div>
                            ))}
                        </div>

                        {/* Forecast Row */}
                        <div className="grid grid-cols-5 py-8 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <div className="col-span-1 pl-8 flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Forecast</span>
                                <div className="text-gray-300 cursor-help" title="Predicted metrics">ⓘ</div>
                            </div>
                            <div className="col-span-1 text-center text-xl font-bold text-gray-900">{reportData.campaign.metrics.views.forecast}</div>
                            <div className="col-span-1 text-center text-xl font-bold text-gray-900">{reportData.campaign.metrics.clicks.forecast}</div>
                            <div className="col-span-1 text-center text-xl font-bold text-gray-900">{reportData.campaign.metrics.cpm.forecast}</div>
                            <div className="col-span-1 text-center text-xl font-bold text-gray-900">{reportData.campaign.metrics.cpc.forecast}</div>
                        </div>

                        {/* Actual Row */}
                        <div className="grid grid-cols-5 py-8 items-center hover:bg-gray-50/50 transition-colors">
                            <div className="col-span-1 pl-8 flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Actual</span>
                            </div>
                            <div className="col-span-1 text-center text-xl font-bold text-gray-900">{reportData.campaign.metrics.views.actual}</div>
                            <div className="col-span-1 text-center text-xl font-bold text-gray-900">{reportData.campaign.metrics.clicks.actual}</div>
                            <div className="col-span-1 text-center text-xl font-bold text-gray-900">{reportData.campaign.metrics.cpm.actual}</div>
                            <div className="col-span-1 text-center text-xl font-bold text-gray-900">{reportData.campaign.metrics.cpc.actual}</div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div className="flex gap-4">
                                {['Views', 'Clicks', 'CPM', 'CPC'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setSelectedMetric(m)}
                                        className={`pb-1 text-sm font-medium transition-all ${selectedMetric === m ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <button className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                                    View by <span className="text-gray-900">Audience</span> <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="h-80 w-full relative">
                            {reportData.chartData && reportData.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.chartData} barGap={4} barCategoryGap="20%">
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                            dy={10}
                                            interval={0}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)' }}
                                            cursor={{ fill: '#F9FAFB' }}
                                        />
                                        <Bar
                                            dataKey={chartKeys.forecast}
                                            fill="#BFDBFE" // Light Blue
                                            name="Forecast"
                                            background={{ fill: '#F9FAFB' }}
                                        />
                                        <Bar
                                            dataKey={chartKeys.actual}
                                            fill="#2563EB" // Brand Blue
                                            name="Actual"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-400">No data available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Influencer Tab - MATCHING SCREENSHOT */
                <div className="animate-in fade-in duration-300">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th rowSpan="2" className="px-6 py-4 bg-gray-50/50">Influencer</th>
                                        <th rowSpan="2" className="px-6 py-4 bg-gray-50/50">Final Link</th>
                                        <th colSpan="2" className="px-4 py-2 text-center border-l border-gray-100">Views</th>
                                        <th colSpan="2" className="px-4 py-2 text-center border-l border-gray-100">Clicks</th>
                                        <th colSpan="2" className="px-4 py-2 text-center border-l border-gray-100">CPM</th>
                                        <th colSpan="2" className="px-4 py-2 text-center border-l border-gray-100">CPC</th>
                                    </tr>
                                    <tr className="bg-gray-50/30 border-b border-gray-100 text-xs text-gray-500 font-medium">
                                        <th className="px-4 py-2 text-right border-l border-gray-100">Forecast</th>
                                        <th className="px-4 py-2 text-right">Actual</th>
                                        <th className="px-4 py-2 text-right border-l border-gray-100">Forecast</th>
                                        <th className="px-4 py-2 text-right">Actual</th>
                                        <th className="px-4 py-2 text-right border-l border-gray-100">Forecast</th>
                                        <th className="px-4 py-2 text-right">Actual</th>
                                        <th className="px-4 py-2 text-right border-l border-gray-100">Forecast</th>
                                        <th className="px-4 py-2 text-right">Actual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {reportData.influencers.length > 0 ? reportData.influencers.map(inf => (
                                        <tr key={inf.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={inf.avatar}
                                                        onError={(e) => { e.currentTarget.src = "https://placehold.co/40x40" }}
                                                        alt=""
                                                        className="w-8 h-8 rounded-full object-cover bg-gray-100"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{inf.name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            {/* Simple platform dot */}
                                                            <span className={`w-2 h-2 rounded-full ${inf.platform === 'instagram' ? 'bg-purple-500' : 'bg-red-500'}`}></span>
                                                            {inf.handle}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-[200px] truncate">
                                                {inf.finalLink ? (
                                                    <a href={inf.finalLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
                                                        {inf.finalLink}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic">Pending</span>
                                                )}
                                            </td>

                                            {/* Views */}
                                            <td className="px-4 py-4 text-right border-l border-gray-50 font-medium text-gray-500">{inf.metrics.views.forecast}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">{inf.metrics.views.actual}</td>

                                            {/* Clicks */}
                                            <td className="px-4 py-4 text-right border-l border-gray-50 font-medium text-gray-500">{inf.metrics.clicks.forecast}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">{inf.metrics.clicks.actual}</td>

                                            {/* CPM */}
                                            <td className="px-4 py-4 text-right border-l border-gray-50 font-medium text-gray-500">{inf.metrics.cpm.forecast}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">{inf.metrics.cpm.actual}</td>

                                            {/* CPC */}
                                            <td className="px-4 py-4 text-right border-l border-gray-50 font-medium text-gray-500">{inf.metrics.cpc.forecast}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">{inf.metrics.cpc.actual}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="10" className="text-center py-10 text-gray-400">No data available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandReportContent;
