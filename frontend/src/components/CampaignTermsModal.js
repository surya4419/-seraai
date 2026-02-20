import React, { useState } from 'react';
import { X, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const CampaignTermsModal = ({ isOpen, onClose, onAccept, campaignData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [selectedTerms, setSelectedTerms] = useState([]);

  if (!isOpen) return null;

  const termsSteps = [
    {
      id: 1,
      title: 'What AI agents will do next',
      icon: '🤖',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Send invites */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm">📧</span>
                </div>
                <h4 className="font-semibold">Send invites</h4>
              </div>
              <p className="text-sm text-gray-600 ml-10">
                Sera AI agents will start immediately inviting influencers, and creators will receive your job.
              </p>
            </div>

            {/* Produce content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm">🎬</span>
                </div>
                <h4 className="font-semibold">Produce content</h4>
              </div>
              <p className="text-sm text-gray-600 ml-10">
                Once invited, creators will make and submit content according to the specified requirements and timeline.
              </p>
            </div>

            {/* Review content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm">✅</span>
                </div>
                <h4 className="font-semibold">Review content</h4>
              </div>
              <p className="text-sm text-gray-600 ml-10">
                Review the content and add any comments beyond the platform requirements.
              </p>
            </div>

            {/* View report */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm">📊</span>
                </div>
                <h4 className="font-semibold">View report</h4>
              </div>
              <p className="text-sm text-gray-600 ml-10">
                Track campaign results, total reach, engagement, and other data to optimize your next campaign.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-700">
              <strong>Tips:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
              <li>Some influencers may contact you to confirm your partnership with Sera AI. Simply respond to them and verify it. Please try to avoid further offline contact, as the lack of platform oversight could harm your interests.</li>
              <li><strong>Promptly approving applications</strong> helps secure influencers' schedules and enhances collaboration success rates, while delayed feedback increases the risk of influencer ghosting.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Platform guarantee',
      icon: '🛡️',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 100% refund for no delivery */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">100% refund for no delivery</h4>
              <p className="text-sm text-gray-600">
                A full refund is available if influencers fail to deliver the content.
              </p>
            </div>

            {/* 100% refund for non-organic performance */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-2">100% refund for non-organic performance</h4>
              <p className="text-sm text-gray-600">
                A full refund is available if influencers boost performance with non-organic views and engagements.
              </p>
            </div>

            {/* 100% refund for late submission */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">100% refund for late submission</h4>
              <p className="text-sm text-gray-600">
                You can cancel the collaboration and get full refund in case influencers' submission is late.
              </p>
            </div>

            {/* 100% refund for low quality content */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2">100% refund for low quality content</h4>
              <p className="text-sm text-gray-600">
                A full refund is available if influencers' content does not deliver value to the audience or the content is fully AI-generated.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-700">
              <strong>Tips:</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Sera AI agents have enforced strict policies for influencers. Please report influencers using the report feature if you still encounter any who violate Sera AI platform standards.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'No results, No Payment',
      icon: '💰',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No results, No Payment</h3>
              <p className="text-gray-600">Your payment is protected until results are delivered</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Escrow-Protected Payments */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-500">🔒</span>
                  Escrow-Protected Payments
                </h4>
                <p className="text-sm text-gray-600">
                  Your payment is held by the platform and will only be released to the influencer once the collaboration is complete.
                </p>
              </div>

              {/* Deliver payment */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  Deliver payment
                </h4>
                <p className="text-sm text-gray-600">
                  After the collaboration, you may confirm and pay within five days. If it fails to deliver, you can dispute and refuse payment.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>How it works:</strong>
            </p>
            <ol className="text-sm text-gray-600 mt-2 space-y-2 ml-4 list-decimal">
              <li>Your budget is held securely in escrow when you publish the campaign</li>
              <li>Influencers create and submit content for your review</li>
              <li>You approve the content and influencers publish it</li>
              <li>Payment is released to influencers only after successful delivery</li>
              <li>If content doesn't meet standards, you can request revisions or get a full refund</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Delivery Timelines',
      icon: '📅',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Campaign Timeline</h3>
                <p className="text-sm text-gray-600">Clear expectations for every stage</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Phase 1 */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Invitation & Application (1-3 days)</h4>
                  <p className="text-sm text-gray-600">
                    Sera AI agents send invitations to matched creators. Creators review and apply to your campaign.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Content Creation (3-7 days)</h4>
                  <p className="text-sm text-gray-600">
                    Once approved, creators produce content according to your requirements and submit for review.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Review & Approval (1-2 days)</h4>
                  <p className="text-sm text-gray-600">
                    You review submitted content and request revisions if needed. Approve when satisfied.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Publishing & Tracking (1 day)</h4>
                  <p className="text-sm text-gray-600">
                    Creators publish approved content. Real-time tracking begins for engagement and reach metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Important Notes:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
              <li>Timelines may vary based on campaign complexity and creator availability</li>
              <li>Rush campaigns available with premium pricing for faster delivery</li>
              <li>Late submissions are eligible for full refund under platform guarantee</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Sera AI's Content Requirements",
      icon: '📝',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Quality Standards</h3>
                <p className="text-sm text-gray-600">What we expect from every creator</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Authenticity */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Authenticity</h4>
                  <p className="text-sm text-gray-600">
                    Content must be genuine and reflect the creator's authentic voice. No fully AI-generated content.
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Alignment */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Brand Alignment</h4>
                  <p className="text-sm text-gray-600">
                    Content must accurately represent your brand message and follow campaign guidelines.
                  </p>
                </div>
              </div>
            </div>

            {/* Production Quality */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎬</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Production Quality</h4>
                  <p className="text-sm text-gray-600">
                    Clear audio, good lighting, stable footage, and professional editing standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Engagement Value */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Engagement Value</h4>
                  <p className="text-sm text-gray-600">
                    Content must provide value to the audience and encourage genuine engagement.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Guidelines */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Platform Guidelines</h4>
                  <p className="text-sm text-gray-600">
                    Must comply with platform-specific rules and disclosure requirements (e.g., #ad, #sponsored).
                  </p>
                </div>
              </div>
            </div>

            {/* Organic Performance */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Organic Performance</h4>
                  <p className="text-sm text-gray-600">
                    No artificial boosting, fake engagement, or purchased views allowed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Quality Assurance:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
              <li>All content is reviewed by Sera AI agents before submission to you</li>
              <li>You have final approval and can request unlimited revisions</li>
              <li>Content not meeting standards is eligible for full refund</li>
              <li>Report any violations using the platform's report feature</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentTermStep = termsSteps.find(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStep < termsSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show authorization step
      setCurrentStep(6);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmAuthorization = () => {
    if (!fullName.trim()) {
      return;
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentStep === 6 ? 'Partnership Authorization' : 'Sera AI Instructions'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        {currentStep !== 6 && (
          <div className="flex border-b border-gray-200 flex-1 overflow-hidden">
            <div className="w-64 bg-gray-50 p-4 border-r border-gray-200 flex-shrink-0">
              <p className="text-xs text-gray-500 mb-4">Get an overview of essentials of Sera AI to help you maximize your success</p>
              <div className="space-y-2">
                {termsSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-default ${
                      currentStep === step.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {currentStep > step.id ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          currentStep === step.id ? 'border-blue-500' : 'border-gray-300'
                        }`} />
                      )}
                      <span>{step.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentTermStep?.title}</h3>
                </div>
                {currentTermStep?.content}
              </div>
            </div>
          </div>
        )}

        {/* Authorization Step */}
        {currentStep === 6 && (
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto pb-4">
              {/* Certificate Container */}
              <div className="bg-white rounded-lg shadow-2xl border-8 border-double border-blue-900 relative overflow-hidden">
                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-blue-300 opacity-50"></div>
                <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-blue-300 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-blue-300 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-blue-300 opacity-50"></div>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <div className="text-9xl font-bold text-blue-900 transform rotate-[-45deg]">SERA AI</div>
                </div>

                {/* Certificate Content */}
                <div className="relative p-8">
                  {/* Header */}
                  <div className="text-center mb-6 border-b-2 border-blue-900 pb-4">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">S</span>
                      </div>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-blue-900 mb-2">PARTNERSHIP AUTHORIZATION</h1>
                    <p className="text-base text-gray-600 font-serif italic">Official Campaign Management Agreement</p>
                  </div>

                  {/* Main Content */}
                  <div className="mb-6 space-y-5">
                    <div className="text-center mb-6">
                      <p className="text-lg text-gray-700 leading-relaxed font-serif">
                        This document certifies that <span className="font-bold text-blue-900">{campaignData?.businessName || 'Your Business'}</span> has officially authorized
                      </p>
                      <p className="text-2xl font-bold text-blue-900 my-3">Sera AI</p>
                      <p className="text-lg text-gray-700 leading-relaxed font-serif">
                        to conduct influencer marketing campaigns on behalf of the aforementioned entity.
                      </p>
                    </div>

                    {/* Campaign Details Box */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-5 shadow-inner">
                      <h3 className="text-lg font-bold text-blue-900 mb-3 text-center font-serif">Campaign Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Campaign Name</p>
                            <p className="text-sm font-bold text-gray-900">{campaignData?.campaignName || 'New Campaign'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Brand</p>
                            <p className="text-sm font-bold text-gray-900">{campaignData?.businessName || 'Your Business'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Valid From</p>
                            <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Campaign ID</p>
                            <p className="text-sm font-mono font-bold text-blue-900">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Official Email Verification</p>
                            <p className="text-sm font-semibold text-blue-600">support@sera.ai</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Contact</p>
                            <p className="text-sm font-semibold text-gray-900">support@sera.ai</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Authorization Statement */}
                    <div className="bg-white border-l-4 border-blue-900 pl-4 py-3 my-5">
                      <p className="text-sm text-gray-700 leading-relaxed font-serif italic">
                        "By affixing my signature below, I hereby confirm that I am an authorized representative of the aforementioned brand and grant Sera AI full authority to manage, execute, and oversee all aspects of this influencer marketing campaign in accordance with the terms and conditions agreed upon."
                      </p>
                    </div>

                    {/* Signature Section */}
                    <div className="mt-6 pt-4 border-t-2 border-gray-300">
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                          Authorized Signatory (Full Legal Name) <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full legal name"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-serif text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1 italic">This name will appear on the official authorization document</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mt-6">
                        <div>
                          <div className="border-t-2 border-gray-800 pt-2">
                            <p className="text-xs font-bold text-gray-700 uppercase">Signature</p>
                            <p className="text-base font-serif italic text-gray-900 mt-1">{fullName || '___________________'}</p>
                          </div>
                        </div>
                        <div>
                          <div className="border-t-2 border-gray-800 pt-2">
                            <p className="text-xs font-bold text-gray-700 uppercase">Date</p>
                            <p className="text-base font-serif text-gray-900 mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Official Seal */}
                    <div className="flex justify-center mt-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-blue-900 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg">
                          <div className="text-center">
                            <div className="text-xs font-bold text-blue-900 uppercase">Official</div>
                            <div className="text-lg font-bold text-blue-900 my-1">SERA AI</div>
                            <div className="text-xs text-blue-900">Authorized</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Notice */}
                  <div className="mt-6 pt-4 border-t-2 border-blue-900">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600 text-center leading-relaxed">
                        <span className="font-bold">Important Notice:</span> This authorization document will be visible to influencers when they receive campaign invitations, 
                        providing them with confidence that the partnership is legitimate and officially sanctioned. While most influencers won't need further confirmation, 
                        some may reach out to verify directly with you. Our support team handles all follow-ups to ensure smooth operations.
                      </p>
                    </div>
                  </div>

                  {/* Document Reference */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 font-mono">
                      Document ID: AUTH-{Math.random().toString(36).substr(2, 12).toUpperCase()} | Generated: {new Date().toISOString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </Button>
          
          {currentStep < 6 ? (
            <Button
              onClick={handleNext}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirmAuthorization}
              disabled={!fullName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-700 hover:border-blue-800 flex items-center gap-3"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
              Launch Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignTermsModal;
