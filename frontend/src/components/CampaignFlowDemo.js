import React, { useState } from 'react';
import CampaignDetails from './CampaignDetails';
import CampaignRequirements from './CampaignRequirements';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CampaignFlowDemo = () => {
    const [currentStep, setCurrentStep] = useState('start');
    const [campaignData, setCampaignData] = useState({
        // Mock basic info data
        brandName: 'TechCorp',
        businessType: 'Technology',
        serviceType: 'Mobile App Development',
        businessIntroduction: 'We create innovative mobile applications that transform how people interact with technology.',
        // This will be populated as we go through the flow
        campaignDetails: null,
        requirements: null
    });

    const handleStartFlow = () => {
        toast.success('Starting campaign creation flow...');
        setCurrentStep('details');
    };

    const handleDetailsComplete = (detailsData) => {
        setCampaignData(prev => ({ ...prev, campaignDetails: detailsData }));
        toast.success('Campaign details saved! Moving to requirements...');
        setCurrentStep('requirements');
    };

    const handleRequirementsComplete = () => {
        toast.success('Campaign created successfully!');
        setCurrentStep('complete');
    };

    const handleBackToStart = () => {
        setCurrentStep('start');
        setCampaignData(prev => ({ 
            ...prev, 
            campaignDetails: null, 
            requirements: null 
        }));
    };

    const steps = [
        { id: 'start', label: 'Basic Info', completed: true },
        { id: 'details', label: 'Campaign Details', completed: currentStep === 'requirements' || currentStep === 'complete' },
        { id: 'requirements', label: 'Requirements', completed: currentStep === 'complete' }
    ];

    if (currentStep === 'details') {
        return (
            <CampaignDetails
                campaignData={campaignData}
                onBack={() => setCurrentStep('start')}
                onContinue={handleDetailsComplete}
            />
        );
    }

    if (currentStep === 'requirements') {
        return (
            <CampaignRequirements
                campaignData={{ ...campaignData, ...campaignData.campaignDetails }}
                onBack={() => setCurrentStep('details')}
                onComplete={handleRequirementsComplete}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Campaign Creation Flow Demo</h1>
                        <p className="text-gray-600 mt-1">Experience the complete campaign creation process</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Demo Mode
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = '/'}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </div>
                </div>

                {/* Progress Steps */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader>
                        <CardTitle>Campaign Setup Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                            step.completed 
                                                ? 'bg-green-600 text-white' 
                                                : currentStep === step.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {step.completed ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <span className={`mt-2 text-sm ${
                                            step.completed 
                                                ? 'text-green-600 font-medium' 
                                                : currentStep === step.id
                                                ? 'text-blue-600 font-medium'
                                                : 'text-gray-500'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <ChevronRight className="w-6 h-6 text-gray-400 mx-8" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {currentStep === 'start' && (
                    <Card className="shadow-sm border border-gray-100">
                        <CardHeader>
                            <CardTitle>Basic Information (Completed)</CardTitle>
                            <p className="text-sm text-gray-600">Your brand information has been collected</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Brand Name</label>
                                    <p className="text-lg font-semibold text-gray-900">{campaignData.brandName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Business Type</label>
                                    <p className="text-lg font-semibold text-gray-900">{campaignData.businessType}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Service Type</label>
                                    <p className="text-lg font-semibold text-gray-900">{campaignData.serviceType}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Business Introduction</label>
                                    <p className="text-gray-700">{campaignData.businessIntroduction}</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t">
                                <Button
                                    onClick={handleStartFlow}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Continue to Campaign Details
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {currentStep === 'complete' && (
                    <Card className="shadow-sm border border-gray-100">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Campaign Created Successfully!</h2>
                                <p className="text-gray-600">
                                    Your campaign has been created and will be reviewed before going live.
                                </p>
                                
                                {/* Summary */}
                                <div className="bg-gray-50 rounded-lg p-6 mt-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Campaign Summary</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Brand:</span>
                                            <span className="ml-2 font-medium">{campaignData.brandName}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Type:</span>
                                            <span className="ml-2 font-medium">{campaignData.businessType}</span>
                                        </div>
                                        {campaignData.campaignDetails && (
                                            <>
                                                <div>
                                                    <span className="text-gray-500">Placements:</span>
                                                    <span className="ml-2 font-medium">
                                                        {campaignData.campaignDetails.placements?.length || 0} selected
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Locations:</span>
                                                    <span className="ml-2 font-medium">
                                                        {campaignData.campaignDetails.locations?.length || 0} selected
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Languages:</span>
                                                    <span className="ml-2 font-medium">
                                                        {campaignData.campaignDetails.languages?.length || 0} selected
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Links:</span>
                                                    <span className="ml-2 font-medium">
                                                        {campaignData.campaignDetails.audienceLinks?.length || 0} added
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4 pt-6">
                                    <Button
                                        variant="outline"
                                        onClick={handleBackToStart}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Start New Campaign
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        View Campaign Dashboard
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CampaignFlowDemo;