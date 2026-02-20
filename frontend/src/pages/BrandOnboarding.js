import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Upload, Building2, Globe, Phone, MapPin, DollarSign, User, Loader2, X } from 'lucide-react';

const BrandOnboarding = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingInfo, setIsExtractingInfo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    // Business Details (Image 2)
    contactName: '',
    website: '',
    monthlyBudget: '',
    country: '',
    phone: '',
    contactInfo: '',
    // Organization Details (Image 1)
    logo: null,
    name: ''
  });

  const budgetOptions = [
    { value: 'under_5k', label: 'Under $5,000' },
    { value: '5k_15k', label: '$5,000 - $15,000' },
    { value: '15k_50k', label: '$15,000 - $50,000' },
    { value: '50k_100k', label: '$50,000 - $100,000' },
    { value: 'over_100k', label: 'Over $100,000' }
  ];

  const countryOptions = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'India', 'Japan', 'Brazil', 'Mexico', 'Spain', 'Italy',
    'Netherlands', 'Singapore', 'United Arab Emirates', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-extract organization info when website URL is entered
    if (name === 'website' && value.trim() && value.includes('.')) {
      handleAutoExtractInfo(value);
    }
  };

  const handleAutoExtractInfo = async (websiteUrl) => {
    if (isExtractingInfo) return;
    
    // Add a small delay to avoid too many API calls while typing
    setTimeout(async () => {
      setIsExtractingInfo(true);
      try {
        const response = await axios.post('/api/brand/extract-org-info', {
          websiteUrl: websiteUrl
        });
        
        if (response.data.success && response.data.data) {
          const { name, industry } = response.data.data;
          
          // Auto-fill organization name if not already filled and name is available
          if (name && name !== 'null' && !formData.name.trim()) {
            setFormData(prev => ({ ...prev, name }));
            toast.success('Organization name auto-filled!');
          }
          
          // Logo will be uploaded manually by the user
        }
      } catch (error) {
        console.error('Auto-extract error:', error);
        // Only show error if it's a network error or server error
        if (error.response?.status >= 500) {
          toast.error('Failed to auto-fill organization details');
        }
      } finally {
        setIsExtractingInfo(false);
      }
    }, 1000); // 1 second delay
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Logo must be less than 10MB');
        return;
      }
      
      // Validate file type (allow HEIC files even if type is empty)
      const isImageFile = file.type.startsWith('image/') || 
                         file.name.toLowerCase().includes('.heic') ||
                         file.name.toLowerCase().includes('.heif') ||
                         file.name.toLowerCase().includes('.jpg') ||
                         file.name.toLowerCase().includes('.jpeg') ||
                         file.name.toLowerCase().includes('.png') ||
                         file.name.toLowerCase().includes('.gif') ||
                         file.name.toLowerCase().includes('.webp');
      
      if (!isImageFile) {
        toast.error('Please select an image file');
        return;
      }

      // Check for HEIC files and inform user about conversion
      if (file.name.toLowerCase().includes('.heic') || file.name.toLowerCase().includes('.heif')) {
        toast.info('HEIC image detected - converting to JPEG for web compatibility');
      }
      
      setFormData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.contactName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.website.trim()) {
      toast.error('Please enter your company website');
      return;
    }
    if (!formData.monthlyBudget) {
      toast.error('Please select your monthly budget');
      return;
    }
    if (!formData.country) {
      toast.error('Please select your country');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Please enter your organization name');
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('contactName', formData.contactName);
      submitData.append('website', formData.website);
      submitData.append('monthlyBudget', formData.monthlyBudget);
      submitData.append('country', formData.country);
      submitData.append('phone', formData.phone);
      submitData.append('contactInfo', formData.contactInfo);
      submitData.append('name', formData.name);
      
      // Handle logo - user uploaded file only
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      const response = await axios.post('/api/brand/complete-profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Profile completed successfully!');
        if (onComplete) {
          onComplete(response.data.brand);
        }
        navigate('/new-campaign');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post('/api/auth/logout');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12">
          <div className="w-full max-w-lg mx-auto">
            {/* Sign Out Link */}
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 mb-8"
            >
              Sign out
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Sera Ai</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Create your organization
              </h1>
              <p className="text-gray-600">
                Setting up an organization gives you a shared hub to manage campaigns, track performance, and align with your team.
              </p>
            </div>


            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Business Details Section */}
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Company Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company website (URL) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="e.g. www.yourcompany.com"
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {isExtractingInfo && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                  {isExtractingInfo && (
                    <p className="text-xs text-blue-600 mt-1">
                      Auto-filling organization details...
                    </p>
                  )}
                </div>

                {/* Organization Name and Logo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Organization Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your organization name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo (optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <div className="flex gap-2">
                          <label
                            htmlFor="logo-upload"
                            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </label>
                          {logoPreview && (
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="inline-flex items-center gap-1 px-2 py-2 text-sm text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What's your monthly influencer marketing budget? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="monthlyBudget"
                      value={formData.monthlyBudget}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="">Select a budget range</option>
                      {budgetOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Where is your organization located? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="">Select your country or region</option>
                      {countryOptions.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact information
                  </label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    placeholder="LinkedIn / WhatsApp / Line / Telegram / Slack"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>




              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating organization...
                  </>
                ) : (
                  'Create organization'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-800 items-center justify-center p-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              5M+ influencers.
            </h2>
            <h2 className="text-4xl font-bold text-white mb-8">
              One AI. All results.
            </h2>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl overflow-hidden"
                >
                  <div className="w-full h-full flex items-end p-3">
                    <div className="text-xs text-white/80">
                      {['3.6M+', '484K+', '1M+', '105.1K+', '3M+', '682K+'][i - 1]} Followers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandOnboarding;
