import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { User, MapPin, Globe2, Languages, Briefcase, Loader2, ChevronRight, X } from 'lucide-react';

const CreatorOnboarding = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [customLanguage, setCustomLanguage] = useState('');
  const [customContentType, setCustomContentType] = useState('');
  const [contentTypeSearch, setContentTypeSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    state: '',
    contentTypes: [],
    gender: '',
    languages: []
  });

  const contentTypeOptions = [
    'Lifestyle', 'Fitness', 'Technology', 'Fashion', 'Beauty', 'Travel',
    'Food & Cooking', 'Gaming', 'Music', 'Art & Design', 'Photography',
    'Business & Finance', 'Education', 'Health & Wellness', 'Sports',
    'Entertainment', 'Comedy', 'DIY & Crafts', 'Parenting', 'Pets & Animals',
    'Automotive', 'Real Estate', 'Science', 'News & Politics', 'Sustainability'
  ];

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Hindi',
    'Russian', 'Turkish', 'Dutch', 'Swedish', 'Polish', 'Indonesian',
    'Thai', 'Vietnamese', 'Greek', 'Hebrew', 'Danish', 'Finnish', 'Norwegian'
  ];

  const countryOptions = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'India', 'Japan', 'Brazil', 'Mexico', 'Spain', 'Italy',
    'Netherlands', 'Singapore', 'United Arab Emirates', 'South Africa',
    'Argentina', 'Colombia', 'Chile', 'Peru', 'Other'
  ];

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  const handleAddContentType = (contentType) => {
    const trimmed = contentType.trim();
    if (!trimmed) return;
    
    const exists = formData.contentTypes.some(
      ct => ct.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (exists) {
      toast.error('This content type is already added');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      contentTypes: [...prev.contentTypes, trimmed]
    }));
    setContentTypeSearch('');
    setShowContentTypeDropdown(false);
  };

  const handleRemoveContentType = (contentType) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.filter(ct => ct !== contentType)
    }));
  };

  const handleAddLanguage = (language) => {
    const trimmed = language.trim();
    if (!trimmed) return;
    
    const exists = formData.languages.some(
      lang => lang.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (exists) {
      toast.error('This language is already added');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, trimmed]
    }));
    setLanguageSearch('');
    setShowLanguageDropdown(false);
  };

  const handleRemoveLanguage = (languageToRemove) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  // Filter options based on search
  const filteredContentTypes = contentTypeOptions.filter(type =>
    type.toLowerCase().includes(contentTypeSearch.toLowerCase()) &&
    !formData.contentTypes.includes(type)
  );

  const filteredLanguages = languageOptions.filter(lang =>
    lang.toLowerCase().includes(languageSearch.toLowerCase()) &&
    !formData.languages.includes(lang)
  );

  const handleNext = () => {
    // Validation for step 1
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        toast.error('Please enter your full name');
        return;
      }
      if (!formData.country) {
        toast.error('Please select your country');
        return;
      }
    }
    
    // Validation for step 2
    if (currentStep === 2) {
      if (formData.contentTypes.length === 0) {
        toast.error('Please select at least one content type');
        return;
      }
      if (!formData.gender) {
        toast.error('Please select your gender');
        return;
      }
      if (formData.languages.length === 0) {
        toast.error('Please select at least one language');
        return;
      }
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/creator/complete-onboarding', formData);

      if (response.data.success) {
        toast.success('Profile completed successfully!');
        if (onComplete) {
          onComplete(response.data.profile);
        }
        navigate('/creator');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
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
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Sera Ai</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Complete your creator profile
              </h1>
              <p className="text-gray-600">
                Tell us about yourself to get personalized brand recommendations
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              </div>
              <p className="text-sm text-gray-600">Step {currentStep} of 2</p>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="">Select your country</option>
                      {countryOptions.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* State (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State / Region (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter your state or region"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Content & Languages */}
            {currentStep === 2 && (
              <div className="space-y-5">
                {/* Content Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-500 mb-3">Type to search or add custom</p>
                  
                  {/* Selected Content Types Display */}
                  {formData.contentTypes.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {formData.contentTypes.map((type, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {type}
                          <button
                            type="button"
                            onClick={() => handleRemoveContentType(type)}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative">
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={contentTypeSearch}
                        onChange={(e) => {
                          setContentTypeSearch(e.target.value);
                          setShowContentTypeDropdown(true);
                        }}
                        onFocus={() => setShowContentTypeDropdown(true)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (contentTypeSearch.trim()) {
                              handleAddContentType(contentTypeSearch);
                            }
                          }
                        }}
                        placeholder="Type to search or add custom content type..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    {/* Dropdown */}
                    {showContentTypeDropdown && contentTypeSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredContentTypes.length > 0 ? (
                          filteredContentTypes.map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleAddContentType(type)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                              {type}
                            </button>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddContentType(contentTypeSearch)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-blue-600"
                          >
                            Add "{contentTypeSearch}" as custom content type
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {formData.contentTypes.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      {formData.contentTypes.length} selected
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {genderOptions.map(gender => (
                      <label
                        key={gender}
                        className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.gender === gender
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={formData.gender === gender}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium text-gray-700">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-500 mb-3">Type to search or add custom</p>
                  
                  {/* Selected Languages Display */}
                  {formData.languages.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {formData.languages.map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(language)}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative">
                    <div className="relative">
                      <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={languageSearch}
                        onChange={(e) => {
                          setLanguageSearch(e.target.value);
                          setShowLanguageDropdown(true);
                        }}
                        onFocus={() => setShowLanguageDropdown(true)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (languageSearch.trim()) {
                              handleAddLanguage(languageSearch);
                            }
                          }
                        }}
                        placeholder="Type to search or add custom language..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    {/* Dropdown */}
                    {showLanguageDropdown && languageSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredLanguages.length > 0 ? (
                          filteredLanguages.map(lang => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => handleAddLanguage(lang)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                              {lang}
                            </button>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddLanguage(languageSearch)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-blue-600"
                          >
                            Add "{languageSearch}" as custom language
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {formData.languages.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      {formData.languages.length} language{formData.languages.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Completing...
                  </>
                ) : currentStep === 2 ? (
                  'Complete Profile'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-800 items-center justify-center p-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Join thousands of creators
            </h2>
            <h2 className="text-4xl font-bold text-white mb-8">
              connecting with brands
            </h2>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl overflow-hidden"
                >
                  <div className="w-full h-full flex items-end p-3">
                    <div className="text-xs text-white/80">
                      {['Fashion', 'Tech', 'Lifestyle', 'Fitness', 'Travel', 'Food'][i - 1]}
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

export default CreatorOnboarding;
