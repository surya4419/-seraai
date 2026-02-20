import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

import {
  Instagram, Youtube, Linkedin, Twitter, Facebook,
  Plus, X, Settings, LogOut, Loader2, Bell,
  Home, Mail, CreditCard, ChevronDown, User,
  MessageCircle, Send, AlignLeft, Globe, Eye, TrendingUp,
  DollarSign, CheckCircle, XCircle, Hash, Calendar,
  BarChart3, FileText, Sparkles, Globe2, Link2,
  Edit2, Save, MapPin, Lock, Shield, Upload, Star, Info, ArrowLeft,
  IndianRupee, Languages, Briefcase, Package, Video, Download, AlertCircle, Clock,
  Link as LinkIcon, Check, RefreshCw, Users, Heart, MessageSquare
} from 'lucide-react';
import { getProxiedImageUrl } from '../utils/imageProxy';

// Connect Socials Modal Component
const ConnectSocialsModal = ({ isOpen, onClose, onAnalyze, analyzing, connectedPlatforms = [] }) => {
  const [handles, setHandles] = useState([{ platform: 'instagram', handle: '' }]);

  const addHandle = () => {
    setHandles([...handles, { platform: 'instagram', handle: '' }]);
  };

  const removeHandle = (index) => {
    if (handles.length > 1) {
      setHandles(handles.filter((_, i) => i !== index));
    }
  };

  const updateHandle = (index, field, value) => {
    // Show "Coming Soon" for LinkedIn
    if (field === 'platform' && value === 'linkedin') {
      toast.info('LinkedIn integration coming soon!');
      return;
    }
    // Show "Coming Soon" for Facebook
    if (field === 'platform' && value === 'facebook') {
      toast.info('Facebook integration coming soon!');
      return;
    }
    const newHandles = [...handles];
    newHandles[index][field] = value;
    setHandles(newHandles);
  };

  const handleSubmit = () => {
    const validHandles = handles.filter(h => h.handle.trim());
    if (validHandles.length === 0) {
      toast.error('Please enter at least one social handle');
      return;
    }

    // Check if any platform is already connected
    const alreadyConnected = validHandles.filter(h =>
      connectedPlatforms.includes(h.platform.toLowerCase())
    );

    if (alreadyConnected.length > 0) {
      const platformNames = alreadyConnected.map(h =>
        h.platform.charAt(0).toUpperCase() + h.platform.slice(1)
      ).join(', ');
      toast.error(`You already have ${platformNames} account(s) connected. Please remove the existing account(s) before adding new ones.`);
      return;
    }

    onAnalyze(validHandles);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Connect Social Accounts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Add your social media handles to analyze your creator metrics
        </p>

        <div className="space-y-3 mb-6">
          {handles.map((handle, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={handle.platform}
                onChange={(e) => updateHandle(index, 'platform', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="facebook">Facebook (Coming Soon)</option>
                <option value="linkedin">LinkedIn (Coming Soon)</option>
              </select>
              <Input
                placeholder="@username or profile URL"
                value={handle.handle}
                onChange={(e) => updateHandle(index, 'handle', e.target.value)}
                className="flex-1"
              />
              {handles.length > 1 && (
                <button
                  onClick={() => removeHandle(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addHandle}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <Plus className="w-4 h-4" />
          Add Another Platform
        </button>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={analyzing}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Profiles'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Creator Settings Page Component (Full Page View)
const CreatorSettingsPage = ({ activeTab, setActiveTab, user, creatorProfile, onUpdate, connectedProfiles, onDisconnect }) => {
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [disconnecting, setDisconnecting] = useState(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(null);
  const [contentTypeSearch, setContentTypeSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    country: '',
    state: '',
    gender: '',
    contentTypes: [],
    languages: [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update form data when creatorProfile changes
  useEffect(() => {
    if (creatorProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: creatorProfile.fullName || user?.name || '',
        country: creatorProfile.country || '',
        state: creatorProfile.state || '',
        gender: creatorProfile.gender || '',
        contentTypes: creatorProfile.contentTypes || [],
        languages: creatorProfile.languages || []
      }));
    }
  }, [creatorProfile, user]);

  const contentTypeOptions = [
    'Lifestyle', 'Fitness', 'Technology', 'Fashion', 'Beauty', 'Travel',
    'Food & Cooking', 'Gaming', 'Music', 'Art & Design', 'Photography',
    'Business & Finance', 'Education', 'Health & Wellness', 'Sports',
    'Entertainment', 'Comedy', 'DIY & Crafts', 'Parenting', 'Pets & Animals'
  ];

  const countryOptions = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'India', 'Japan', 'Brazil', 'Mexico', 'Spain', 'Italy',
    'Netherlands', 'Singapore', 'United Arab Emirates', 'South Africa', 'Other'
  ];

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

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

  const filteredLanguages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Italian', 'Russian', 'Turkish', 'Dutch', 'Swedish', 'Polish', 'Indonesian', 'Thai', 'Vietnamese', 'Greek', 'Hebrew', 'Danish', 'Finnish', 'Norwegian'].filter(lang =>
    lang.toLowerCase().includes(languageSearch.toLowerCase()) &&
    !formData.languages.includes(lang)
  );

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await axios.put('/api/creator/update-profile', {
        fullName: formData.fullName,
        country: formData.country,
        state: formData.state,
        gender: formData.gender,
        contentTypes: formData.contentTypes,
        languages: formData.languages
      });
      toast.success('Profile updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/auth/update-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success('Password updated successfully');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const settingsTabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'profile', label: 'Creator Profile', icon: Sparkles },
    { id: 'ratings', label: 'Ratings', icon: Star },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => setActiveTab(null)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1 sticky top-4">
            {settingsTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-3xl">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Account</h3>
                <p className="text-gray-600">Manage your account information</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select country</option>
                        {countryOptions.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State / Region</label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Your state or region"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Type:</span>
                      <span className="font-medium">Creator</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Created:</span>
                      <span className="font-medium">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleUpdateProfile} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {/* Creator Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Creator Profile</h3>
                <p className="text-gray-600">Manage your creator details and preferences</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Gender
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {genderOptions.map(gender => (
                      <label
                        key={gender}
                        className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.gender === gender
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={formData.gender === gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium text-gray-700">{gender}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Content Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                    <p className="text-sm text-blue-600 mt-2">{formData.contentTypes.length} selected</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe2 className="w-5 h-5" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Connected Accounts - Subtle section at bottom of Creator Profile */}
              {connectedProfiles && connectedProfiles.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-3">Connected Social Accounts</p>
                  <div className="space-y-2">
                    {connectedProfiles.map((profile, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {profile.platform === 'instagram' && <Instagram className="w-4 h-4 text-gray-400" />}
                          {profile.platform === 'youtube' && <Youtube className="w-4 h-4 text-gray-400" />}
                          <span className="text-sm text-gray-600">{profile.handle}</span>
                        </div>
                        <button
                          onClick={() => setShowDisconnectConfirm(profile)}
                          disabled={disconnecting === profile.handle}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          {disconnecting === profile.handle ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleUpdateProfile} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {/* Ratings Tab */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ratings & Reviews</h3>
                <p className="text-gray-600">See how brands have rated your collaborations</p>
              </div>

              <div className="grid lg:grid-cols-5 gap-6">
                {/* Reviews Section - Takes 3 columns */}
                <div className="lg:col-span-3">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="min-h-[200px] flex flex-col items-center justify-center text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                        <MessageCircle className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="font-medium text-gray-700">No reviews</p>
                        <p className="text-sm text-gray-500 mt-1">There are no reviews to show yet.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Rating Score Section - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        Rating
                        <button className="text-gray-400 hover:text-gray-600">
                          <Info className="w-4 h-4" />
                        </button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-6">
                        A higher score means more consistent and trustworthy performance. It serves as both your trust badge for brands and an important factor in platform recommendations.
                      </p>

                      {/* Rating Display with Laurel Wreath */}
                      <div className="flex items-center justify-center py-4">
                        <div className="relative flex items-center justify-center">
                          {/* Left Laurel */}
                          <svg className="w-16 h-20 text-amber-500" viewBox="0 0 50 80" fill="currentColor">
                            <path d="M45 40c0-5-3-9-7-11 2-3 3-7 2-11-2-5-7-8-12-7 0-5-4-9-9-9-4 0-8 3-9 7l1 1c1-3 4-6 8-6 4 0 8 4 8 8 0 1 0 2-1 3l1 1c1-1 2-3 2-4 0-1 0-2-1-3 4 0 8 3 9 7 1 4-1 8-4 10l1 1c3-2 5-5 5-9 0-1 0-3-1-4 3 2 5 5 5 9s-2 7-5 9l1 1c3-2 5-6 5-10zm-26 30c-4-1-7-5-7-9 0-3 2-6 4-8l-1-1c-3 2-5 6-5 9 0 5 4 10 9 11v-2zm8-2v2c5-1 9-6 9-11 0-3-2-7-5-9l-1 1c2 2 4 5 4 8 0 4-3 8-7 9zm-8-8c-2-2-3-5-3-8 0-4 3-8 7-9v-2c-5 1-9 6-9 11 0 4 2 7 5 9l1-1zm8 0l1 1c3-2 5-5 5-9 0-5-4-10-9-11v2c4 1 7 5 7 9 0 3-1 6-3 8z" transform="scale(-1,1) translate(-50,0)" />
                          </svg>

                          {/* Score */}
                          <div className="mx-2">
                            <span className="text-5xl font-bold text-gray-900">5</span>
                          </div>

                          {/* Right Laurel */}
                          <svg className="w-16 h-20 text-amber-500" viewBox="0 0 50 80" fill="currentColor">
                            <path d="M45 40c0-5-3-9-7-11 2-3 3-7 2-11-2-5-7-8-12-7 0-5-4-9-9-9-4 0-8 3-9 7l1 1c1-3 4-6 8-6 4 0 8 4 8 8 0 1 0 2-1 3l1 1c1-1 2-3 2-4 0-1 0-2-1-3 4 0 8 3 9 7 1 4-1 8-4 10l1 1c3-2 5-5 5-9 0-1 0-3-1-4 3 2 5 5 5 9s-2 7-5 9l1 1c3-2 5-6 5-10zm-26 30c-4-1-7-5-7-9 0-3 2-6 4-8l-1-1c-3 2-5 6-5 9 0 5 4 10 9 11v-2zm8-2v2c5-1 9-6 9-11 0-3-2-7-5-9l-1 1c2 2 4 5 4 8 0 4-3 8-7 9zm-8-8c-2-2-3-5-3-8 0-4 3-8 7-9v-2c-5 1-9 6-9 11 0 4 2 7 5 9l1-1zm8 0l1 1c3-2 5-5 5-9 0-5-4-10-9-11v2c4 1 7 5 7 9 0 3-1 6-3 8z" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-600">Manage your password and security settings</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showPasswordForm ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Keep your account secure with a strong password</p>
                      <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <Input
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <Input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          minLength={6}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <Input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          minLength={6}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                          {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setShowPasswordForm(false);
                          setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </div>

      {/* Custom Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {showDisconnectConfirm.platform === 'instagram' && <Instagram className="w-6 h-6 text-red-600" />}
                {showDisconnectConfirm.platform === 'youtube' && <Youtube className="w-6 h-6 text-red-600" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Account?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to remove <span className="font-medium">{showDisconnectConfirm.handle}</span> from your connected accounts? This will delete all associated analytics data.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDisconnectConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    const profile = showDisconnectConfirm;
                    setShowDisconnectConfirm(null);
                    setDisconnecting(profile.handle);
                    try {
                      await onDisconnect(profile.platform, profile.handle);
                      toast.success('Account disconnected');
                    } catch (err) {
                      toast.error('Failed to disconnect');
                    } finally {
                      setDisconnecting(null);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Platform Tab Component
const PlatformTab = ({ platform, icon: Icon, isActive, onClick, hasData }) => {
  const isComingSoon = platform.toLowerCase() === 'linkedin' || platform.toLowerCase() === 'facebook';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
        ? 'bg-blue-600 text-white'
        : hasData
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
      disabled={!hasData}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{platform}</span>
      {!hasData && <span className="text-xs">{isComingSoon ? '(Coming Soon)' : '(Not connected)'}</span>}
    </button>
  );
};

// Combined Creator Profile Card - Display profile, onboarding info, metrics, and content insights
const CombinedCreatorProfileCard = ({ profile, creatorProfile }) => {
  const data = profile?.profileData || {};
  const platform = profile?.platform || 'instagram';
  const [imageError, setImageError] = useState(false);

  // Reset image error when profile changes
  useEffect(() => {
    setImageError(false);
  }, [profile?.handle, data.profilePictureUrl, data.profile_picture_url]);

  // Platform-specific stats
  const stats = platform === 'youtube' ? [
    { label: 'Subscribers', value: data.subscribersCount?.toLocaleString() || '0', icon: Users, color: 'blue' },
    { label: 'Total Views', value: data.totalViews?.toLocaleString() || '0', icon: Eye, color: 'blue' },
    { label: 'Videos', value: data.videoCount?.toLocaleString() || '0', icon: BarChart3, color: 'blue' },
    { label: 'Engagement Rate', value: `${data.engagementRate?.toFixed(2) || '0'}%`, icon: TrendingUp, color: 'blue' },
    { label: 'Avg Views/Video', value: data.avgViewsPerVideo?.toLocaleString() || '0', icon: Eye, color: 'blue' },
    { label: 'Avg Likes/Video', value: data.avgLikesPerVideo?.toLocaleString() || '0', icon: Heart, color: 'blue' },
  ] : [
    { label: 'Followers', value: data.followersCount?.toLocaleString() || '0', icon: Users, color: 'blue' },
    { label: 'Following', value: data.followingCount?.toLocaleString() || '0', icon: Heart, color: 'blue' },
    { label: 'Posts', value: data.mediaCount?.toLocaleString() || '0', icon: BarChart3, color: 'blue' },
    { label: 'Engagement Rate', value: `${data.engagementRate?.toFixed(2) || '0'}%`, icon: TrendingUp, color: 'blue' },
    { label: 'Avg Likes', value: data.avgLikesPerPost?.toLocaleString() || '0', icon: Heart, color: 'blue' },
    { label: 'Avg Comments', value: data.avgCommentsPerPost?.toLocaleString() || '0', icon: MessageCircle, color: 'blue' },
  ];

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm">
      <CardContent className="p-0">
        {/* Header Section with Platform-specific Background */}
        <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 border-blue-100 p-8 border-b">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white flex-shrink-0 flex items-center justify-center shadow-lg ring-4 ring-blue-200/50">
              {(() => {
                const rawProfilePic = data.profilePictureUrl || data.profile_picture_url;
                // Use proxy for Instagram profile pictures, direct URL for YouTube
                const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                let profilePicUrl = rawProfilePic;

                if (rawProfilePic && rawProfilePic !== 'N/A') {
                  // Instagram images need proxy due to CORS
                  const needsProxy = rawProfilePic.includes('cdninstagram.com') ||
                    rawProfilePic.includes('instagram.') ||
                    rawProfilePic.includes('fbcdn.net') ||
                    rawProfilePic.includes('scontent');
                  if (needsProxy) {
                    profilePicUrl = `${API_BASE}/api/image/proxy?url=${encodeURIComponent(rawProfilePic)}`;
                  }
                  // YouTube images work directly (yt3.ggpht.com, i.ytimg.com, googleusercontent.com)
                }

                return profilePicUrl && profilePicUrl !== 'N/A' && !imageError ? (
                  <img
                    src={profilePicUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="text-blue-600 text-5xl font-bold">
                    {(platform === 'youtube'
                      ? (data.channelName || data.fullName || 'U')
                      : (data.fullName || data.username || 'U')
                    ).charAt(0).toUpperCase()}
                  </div>
                );
              })()}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {/* Display name from platform - YouTube channel name or Instagram full name */}
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-3xl font-bold text-gray-900">
                  {platform === 'youtube'
                    ? (data.channelName || data.fullName || profile?.handle || 'Unknown')
                    : (data.fullName || data.username || profile?.handle || 'Unknown')
                  }
                </h3>
                {data.isVerified && <CheckCircle className="w-7 h-7 text-blue-500" />}
              </div>

              {/* Handle/Username below the name */}
              <p className="text-lg text-gray-600 mb-3">
                @{profile?.handle || data.username || data.channelHandle || 'unknown'}
              </p>

              {/* Location, Gender, and Channel Age */}
              <div className="flex items-center gap-4 text-sm text-gray-700 mb-3 flex-wrap">
                {(creatorProfile?.country || data.country) && data.country !== 'N/A' && (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-blue-200">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      {creatorProfile?.state ? `${creatorProfile.state}, ${creatorProfile.country}` : (creatorProfile?.country || data.country)}
                    </span>
                  </div>
                )}
                {creatorProfile?.gender && (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-blue-200">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{creatorProfile.gender}</span>
                  </div>
                )}
                {platform === 'youtube' && data.joinedDateFormatted && (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-blue-200">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Joined {data.joinedDateFormatted}</span>
                  </div>
                )}
              </div>

              {/* Bio - handle both Instagram and YouTube */}
              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                {data.biography || data.description || 'No bio available'}
              </p>

              {/* Website or Custom URL */}
              {(data.website && data.website !== 'N/A') || (data.customUrl && data.customUrl !== 'N/A') && (
                <a href={data.website || `https://youtube.com/${data.customUrl}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  <Link2 className="w-4 h-4" />
                  {data.website || data.customUrl}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="p-8 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                    <stat.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs font-medium text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Details Section */}
        <div className="p-8 space-y-6">
          {/* Content Types and Languages in Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Content Types */}
            {creatorProfile?.contentTypes && creatorProfile.contentTypes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Content Types</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {creatorProfile.contentTypes.map((type, index) => (
                    <Badge key={index} className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 border text-sm px-3 py-1.5 font-medium transition-colors">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {creatorProfile?.languages && creatorProfile.languages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Globe2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Languages</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {creatorProfile.languages.map((language, index) => (
                    <Badge key={index} className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 border text-sm px-3 py-1.5 font-medium transition-colors">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* YouTube-Specific Advanced Analytics */}
          {platform === 'youtube' && data.analytics && (
            <div className="space-y-6">
              {/* Performance Insights */}
              {data.analytics.performanceInsights && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Top Performing Content</h4>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Top Performing Video */}
                    {(data.analytics.performanceInsights.topPerformingVideo || data.analytics.performanceInsights.top_performing_video) && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Most Viewed</p>
                        <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {(data.analytics.performanceInsights.topPerformingVideo || data.analytics.performanceInsights.top_performing_video)?.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Eye className="w-3 h-3" />
                          <span className="font-bold">{(data.analytics.performanceInsights.topPerformingVideo || data.analytics.performanceInsights.top_performing_video)?.views?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Most Engaging Video */}
                    {(data.analytics.performanceInsights.mostEngagingVideo || data.analytics.performanceInsights.most_engaging_video) && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Most Engaging</p>
                        <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {(data.analytics.performanceInsights.mostEngagingVideo || data.analytics.performanceInsights.most_engaging_video)?.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-bold">{(data.analytics.performanceInsights.mostEngagingVideo || data.analytics.performanceInsights.most_engaging_video)?.engagement_rate || (data.analytics.performanceInsights.mostEngagingVideo || data.analytics.performanceInsights.most_engaging_video)?.engagementRate}%</span>
                        </div>
                      </div>
                    )}

                    {/* Most Liked Video */}
                    {(data.analytics.performanceInsights.mostLikedVideo || data.analytics.performanceInsights.most_liked_video) && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Most Liked</p>
                        <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {(data.analytics.performanceInsights.mostLikedVideo || data.analytics.performanceInsights.most_liked_video)?.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Heart className="w-3 h-3" />
                          <span className="font-bold">{(data.analytics.performanceInsights.mostLikedVideo || data.analytics.performanceInsights.most_liked_video)?.likes?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Growth Metrics */}
              {data.analytics.growthMetrics && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Recent Performance</h4>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Last 30 Days</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Videos</span>
                        <span className="text-sm font-bold text-gray-900">{data.analytics.growthMetrics.recentVideosCount || data.analytics.growthMetrics.recent_videos_count}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg Views</span>
                        <span className="text-sm font-bold text-gray-900">{(data.analytics.growthMetrics.recentAvgViews || data.analytics.growthMetrics.recent_avg_views)?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg Engagement</span>
                        <span className="text-sm font-bold text-blue-600">{data.analytics.growthMetrics.recentAvgEngagement || data.analytics.growthMetrics.recent_avg_engagement}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Analysis */}
              {data.analytics.contentAnalysis && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Content Strategy</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Publishing Frequency */}
                    {(data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency) && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Publishing Frequency</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Videos/Week</span>
                            <span className="text-sm font-bold text-gray-900">{(data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency)?.videosPerWeek || (data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency)?.videos_per_week}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Videos/Month</span>
                            <span className="text-sm font-bold text-gray-900">{(data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency)?.videosPerMonth || (data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency)?.videos_per_month}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Tags */}
                    {(data.analytics.contentAnalysis.topTags || data.analytics.contentAnalysis.top_tags) && (data.analytics.contentAnalysis.topTags || data.analytics.contentAnalysis.top_tags).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          Top Tags ({data.analytics.contentAnalysis.totalUniqueTags || data.analytics.contentAnalysis.total_unique_tags || 0} total)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(data.analytics.contentAnalysis.topTags || data.analytics.contentAnalysis.top_tags).slice(0, 8).map((item, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-medium">
                              {item.tag} ({item.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instagram Advanced Analytics */}
          {platform !== 'youtube' && data.analytics && (data.analytics.performanceInsights || data.analytics.growthMetrics || data.analytics.contentAnalysis) && (
            <div className="space-y-6">
              {/* Performance Insights */}
              {data.analytics.performanceInsights && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Top Performing Content</h4>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Most Liked Post */}
                    {(data.analytics.performanceInsights.mostLikedPost || data.analytics.performanceInsights.most_liked_post) && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Most Liked</p>
                        <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {(data.analytics.performanceInsights.mostLikedPost || data.analytics.performanceInsights.most_liked_post)?.caption || 'No caption'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Heart className="w-3 h-3" />
                          <span className="font-bold">{(data.analytics.performanceInsights.mostLikedPost || data.analytics.performanceInsights.most_liked_post)?.likes?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Most Engaging Post */}
                    {(data.analytics.performanceInsights.mostEngagingPost || data.analytics.performanceInsights.most_engaging_post) && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Most Engaging</p>
                        <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {(data.analytics.performanceInsights.mostEngagingPost || data.analytics.performanceInsights.most_engaging_post)?.caption || 'No caption'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-bold">{(data.analytics.performanceInsights.mostEngagingPost || data.analytics.performanceInsights.most_engaging_post)?.engagement_rate || (data.analytics.performanceInsights.mostEngagingPost || data.analytics.performanceInsights.most_engaging_post)?.engagementRate}%</span>
                        </div>
                      </div>
                    )}

                    {/* Most Commented Post */}
                    {(data.analytics.performanceInsights.mostCommentedPost || data.analytics.performanceInsights.most_commented_post) && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Most Commented</p>
                        <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                          {(data.analytics.performanceInsights.mostCommentedPost || data.analytics.performanceInsights.most_commented_post)?.caption || 'No caption'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MessageCircle className="w-3 h-3" />
                          <span className="font-bold">{(data.analytics.performanceInsights.mostCommentedPost || data.analytics.performanceInsights.most_commented_post)?.comments?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Growth Metrics & Content Distribution - Side by Side */}
              {(data.analytics.growthMetrics || data.analytics.contentAnalysis) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Performance & Content Insights</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Recent Performance */}
                    {data.analytics.growthMetrics && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Recent Performance (Last 30 Days)</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Posts</span>
                            <span className="text-sm font-bold text-gray-900">{data.analytics.growthMetrics.recentPostsCount || data.analytics.growthMetrics.recent_posts_count}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg Likes</span>
                            <span className="text-sm font-bold text-gray-900">{(data.analytics.growthMetrics.recentAvgLikes || data.analytics.growthMetrics.recent_avg_likes)?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg Engagement</span>
                            <span className="text-sm font-bold text-blue-600">{data.analytics.growthMetrics.recentAvgEngagement || data.analytics.growthMetrics.recent_avg_engagement}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content Distribution */}
                    {(data.analytics.contentAnalysis?.contentDistribution || data.analytics.contentAnalysis?.content_distribution) && (data.analytics.contentAnalysis.contentDistribution || data.analytics.contentAnalysis.content_distribution).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Content Distribution</p>
                        <div className="space-y-3">
                          {(data.analytics.contentAnalysis.contentDistribution || data.analytics.contentAnalysis.content_distribution).slice(0, 3).map((type, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="capitalize font-medium text-gray-700">{type.type}</span>
                                <span className="font-bold text-blue-600">{type.percentage}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full transition-all"
                                  style={{ width: `${type.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content Strategy */}
              {data.analytics.contentAnalysis && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Content Strategy</h4>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Publishing Frequency */}
                    {(data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency) && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Publishing Frequency</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Posts/Week</span>
                            <span className="text-sm font-bold text-gray-900">{(data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency)?.postsPerWeek || (data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency)?.posts_per_week}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Posts/Month</span>
                            <span className="text-sm font-bold text-gray-900">{(data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency)?.postsPerMonth || (data.analytics.contentAnalysis.publishingFrequency || data.analytics.contentAnalysis.publishing_frequency)?.posts_per_month}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Hashtags */}
                    {(data.analytics.contentAnalysis.topHashtags || data.analytics.contentAnalysis.top_hashtags) && (data.analytics.contentAnalysis.topHashtags || data.analytics.contentAnalysis.top_hashtags).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          Top Hashtags ({data.analytics.contentAnalysis.totalUniqueHashtags || data.analytics.contentAnalysis.total_unique_hashtags || 0} total)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(data.analytics.contentAnalysis.topHashtags || data.analytics.contentAnalysis.top_hashtags).slice(0, 8).map((item, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-medium">
                              {item.tag} ({item.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Stats Grid Component
const StatsGrid = ({ profile }) => {
  const data = profile?.profileData || {};

  const stats = [
    { label: 'Followers', value: data.followersCount?.toLocaleString() || '0', icon: Users, color: 'blue' },
    { label: 'Following', value: data.followingCount?.toLocaleString() || '0', icon: Heart, color: 'pink' },
    { label: 'Posts', value: data.mediaCount?.toLocaleString() || '0', icon: BarChart3, color: 'purple' },
    { label: 'Engagement Rate', value: `${data.engagementRate?.toFixed(2) || '0'}%`, icon: TrendingUp, color: 'green' },
    { label: 'Avg Likes', value: data.avgLikesPerPost?.toLocaleString() || '0', icon: Heart, color: 'red' },
    { label: 'Avg Comments', value: data.avgCommentsPerPost?.toLocaleString() || '0', icon: MessageCircle, color: 'orange' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden border-2 border-gray-100 hover:border-blue-200 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


// Relevant Hashtags Component
const RelevantHashtags = ({ profile, creatorProfile }) => {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateHashtags();
  }, [profile, creatorProfile]);

  const generateHashtags = () => {
    setLoading(true);
    const generated = [];
    const data = profile?.profileData || {};
    const platform = profile?.platform;

    // For YouTube: Use actual video tags and content analysis
    if (platform === 'youtube') {
      // Add top tags from actual videos (most important)
      const topTags = data.analytics?.contentAnalysis?.topTags || data.analytics?.contentAnalysis?.top_tags;
      if (topTags && topTags.length > 0) {
        topTags.slice(0, 15).forEach(item => {
          const tag = item.tag.toLowerCase().replace(/\s+/g, '');
          if (tag.length > 2 && tag.length <= 30) {
            generated.push(tag);
          }
        });
      }

      // Extract niche from channel description
      if (data.description && data.description !== 'N/A') {
        const description = data.description.toLowerCase();
        const niches = ['tech', 'gaming', 'vlog', 'tutorial', 'review', 'unboxing',
          'lifestyle', 'fitness', 'cooking', 'travel', 'music', 'comedy', 'education',
          'science', 'business', 'finance', 'crypto', 'fashion', 'beauty', 'sports'];

        niches.forEach(niche => {
          if (description.includes(niche)) {
            generated.push(niche);
            generated.push(`${niche}youtube`);
            generated.push(`${niche}creator`);
          }
        });
      }

      // Add generic YouTube creator hashtags
      generated.push('youtube', 'youtuber', 'youtubecreator', 'contentcreator', 'videocreator');
    }
    // For Instagram: Use comprehensive content analysis
    else if (platform === 'instagram') {
      // 1. Add top hashtags from actual posts (most important - these are what the user actually uses)
      const topHashtags = data.analytics?.contentAnalysis?.topHashtags ||
        data.analytics?.contentAnalysis?.top_hashtags ||
        data.topHashtags || [];
      if (topHashtags.length > 0) {
        topHashtags.slice(0, 15).forEach(item => {
          const tag = (item.tag || item).toLowerCase().replace(/[^a-z0-9]/g, '');
          if (tag.length > 2 && tag.length <= 30) {
            generated.push(tag);
          }
        });
      }

      // 2. Extract niche from bio/description
      const bio = data.biography || data.description || '';
      if (bio && bio !== 'N/A') {
        const bioLower = bio.toLowerCase();
        const niches = [
          'fashion', 'style', 'ootd', 'streetwear', 'luxury',
          'fitness', 'gym', 'workout', 'health', 'wellness',
          'beauty', 'makeup', 'skincare', 'cosmetics',
          'travel', 'wanderlust', 'adventure', 'explore',
          'food', 'foodie', 'cooking', 'recipe', 'chef',
          'lifestyle', 'life', 'daily', 'motivation',
          'photography', 'photo', 'photographer', 'portrait',
          'tech', 'technology', 'gadgets', 'review',
          'gaming', 'gamer', 'esports', 'streamer',
          'music', 'musician', 'singer', 'artist',
          'comedy', 'funny', 'humor', 'memes',
          'business', 'entrepreneur', 'startup', 'marketing',
          'education', 'learning', 'tips', 'howto',
          'art', 'artist', 'creative', 'design',
          'sports', 'athlete', 'training', 'football', 'cricket'
        ];

        niches.forEach(niche => {
          if (bioLower.includes(niche)) {
            generated.push(niche);
            generated.push(`${niche}gram`);
            generated.push(`${niche}ofinstagram`);
          }
        });
      }

      // 3. Add content type based hashtags
      const contentDist = data.analytics?.contentAnalysis?.contentDistribution ||
        data.analytics?.contentAnalysis?.content_distribution ||
        data.contentTypes || [];
      if (contentDist.length > 0) {
        contentDist.forEach(item => {
          const type = (item.type || item).toLowerCase();
          if (type === 'video' || type === 'reel') {
            generated.push('reels', 'reelsinstagram', 'instareels', 'reelsvideo', 'reelsviral');
          } else if (type === 'carousel' || type === 'sidecar') {
            generated.push('carousel', 'carouselpost', 'swipe', 'swipepost');
          } else if (type === 'image') {
            generated.push('photooftheday', 'picoftheday', 'instaphoto');
          }
        });
      }

      // 4. Add engagement-based hashtags
      if (data.engagementRate > 5) {
        generated.push('viral', 'trending', 'explore', 'explorepage', 'fyp');
      }

      // 5. Add follower tier hashtags
      const followers = data.followersCount || 0;
      if (followers > 1000000) {
        generated.push('celebrity', 'famous', 'verified');
      } else if (followers > 100000) {
        generated.push('influencer', 'macroinfluencer', 'creator');
      } else if (followers > 10000) {
        generated.push('microinfluencer', 'smallcreator', 'growingcreator');
      } else if (followers > 1000) {
        generated.push('nanoinfluencer', 'upandcoming', 'newcreator');
      }

      // 6. Add generic Instagram creator hashtags
      generated.push('instagram', 'instagood', 'instadaily', 'contentcreator', 'influencer', 'creator');
    }

    // Generate hashtags from content types
    if (creatorProfile?.contentTypes) {
      creatorProfile.contentTypes.forEach(type => {
        const tag = type.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and');
        generated.push(tag);
        generated.push(`${tag}creator`);
      });
    }

    // Add location-based hashtags
    if (creatorProfile?.country && creatorProfile.country !== 'N/A') {
      const country = creatorProfile.country.toLowerCase().replace(/\s+/g, '');
      generated.push(country);
      if (creatorProfile.state) {
        const state = creatorProfile.state.toLowerCase().replace(/\s+/g, '');
        generated.push(state);
      }
    }

    // Remove duplicates, filter invalid, and limit to 30
    const uniqueHashtags = [...new Set(generated)]
      .filter(tag => tag && tag.length > 2 && tag.length <= 30)
      .slice(0, 30);
    setHashtags(uniqueHashtags);
    setLoading(false);
  };

  const platform = profile?.platform || 'instagram';

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Hash className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Relevant Hashtags</CardTitle>
            <p className="text-xs text-gray-600 mt-0.5">
              Generated based on your profile and content
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <button
                key={index}
                onClick={() => {
                  navigator.clipboard.writeText(`#${tag}`);
                  toast.success(`Copied #${tag}`);
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 border rounded-full text-sm font-medium transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4">
          💡 Click any hashtag to copy it to clipboard
        </p>
      </CardContent>
    </Card>
  );
};

// Content Insights Component
const ContentInsights = ({ profile }) => {
  const data = profile?.profileData || {};

  return (
    <Card className="border-2 border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg">Content Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Types - Only show if data exists */}
        {(data.contentTypes || []).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Content Distribution</h4>
            <div className="space-y-2">
              {data.contentTypes.map((type, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{type.type}</span>
                      <span className="font-medium">{type.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Hashtags from Posts */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Top Hashtags from Posts
          </h4>
          <div className="flex flex-wrap gap-2">
            {(data.topHashtags || []).length > 0 ? (
              data.topHashtags.slice(0, 8).map((item, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  #{item.tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">No hashtags found</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Editable Rate Card Component - Now uses INR pricing from CreatorPricingService
const EditableRateCard = ({ profile, creatorProfile, onSave }) => {
  const data = profile?.profileData || {};
  const platform = profile?.platform || 'instagram';
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get pricing from the new comprehensive pricing data
  const pricing = data.costEstimation?.pricing || {};
  const priceRanges = data.costEstimation?.priceRanges || {};

  // Initialize rates from the new pricing service (INR)
  const getInitialRates = () => {
    if (platform === 'youtube') {
      return {
        dedicatedVideo: pricing.dedicatedVideo?.price || data.costEstimation?.postCost || 0,
        integratedVideo: pricing.integratedVideo?.price || data.costEstimation?.reelCost || 0,
        shorts: pricing.shorts?.price || data.costEstimation?.storyCost || 0,
        communityPost: pricing.communityPost?.price || 0,
        liveStream: pricing.liveStream?.price || 0,
      };
    }
    return {
      reel: pricing.reel?.price || data.costEstimation?.reelCost || 0,
      staticPost: pricing.staticPost?.price || data.costEstimation?.postCost || 0,
      carousel: pricing.carousel?.price || data.costEstimation?.carouselCost || 0,
      story: pricing.story?.price || data.costEstimation?.storyCost || 0,
      storyWithLink: pricing.storyWithLink?.price || 0,
      live: pricing.live?.price || 0,
    };
  };

  const [rates, setRates] = useState(getInitialRates());
  const prevPricingRef = useRef(pricing);

  useEffect(() => {
    if (!isEditing && !isSaving) {
      const currentPricing = data.costEstimation?.pricing;
      if (JSON.stringify(currentPricing) !== JSON.stringify(prevPricingRef.current)) {
        setRates(getInitialRates());
        prevPricingRef.current = currentPricing;
      }
    }
  }, [data.costEstimation?.pricing, isEditing, isSaving]);

  const handleSave = async () => {
    setIsSaving(true);
    const savedRates = { ...rates };

    try {
      if (!creatorProfile?.id) {
        toast.error('Creator profile not found');
        setIsSaving(false);
        return;
      }

      // Convert new rate keys to backend format
      const backendRates = platform === 'youtube' ? {
        postCost: savedRates.dedicatedVideo,
        reelCost: savedRates.integratedVideo,
        storyCost: savedRates.shorts,
        carouselCost: savedRates.dedicatedVideo, // Same as dedicated for YouTube
      } : {
        postCost: savedRates.staticPost,
        reelCost: savedRates.reel,
        storyCost: savedRates.story,
        carouselCost: savedRates.carousel,
      };

      await axios.post('/api/creator/update-rate-card', {
        profileId: creatorProfile.id,
        platform: profile.platform,
        handle: profile.handle,
        rates: backendRates
      });

      prevPricingRef.current = data.costEstimation?.pricing;
      setIsEditing(false);

      await new Promise(resolve => setTimeout(resolve, 300));
      if (onSave) await onSave();

      toast.success('Rate card updated successfully!');
    } catch (error) {
      console.error('Rate card update error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update rate card');
    } finally {
      setIsSaving(false);
    }
  };

  // Format currency in INR
  const formatINR = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Platform-specific rate card items with new pricing keys
  const rateItems = platform === 'youtube' ? [
    { key: 'dedicatedVideo', label: 'Dedicated Video', icon: BarChart3, desc: 'Full brand video' },
    { key: 'integratedVideo', label: 'Integrated Mention', icon: TrendingUp, desc: '60-90s integration' },
    { key: 'shorts', label: 'YouTube Shorts', icon: Eye, desc: 'Short-form vertical' },
    { key: 'communityPost', label: 'Community Post', icon: MessageCircle, desc: 'Community tab' },
    { key: 'liveStream', label: 'Live Stream', icon: Users, desc: 'Live with brand' },
  ] : [
    { key: 'reel', label: 'Reel', icon: TrendingUp, desc: 'Short-form video' },
    { key: 'staticPost', label: 'Feed Post', icon: BarChart3, desc: 'Single image' },
    { key: 'carousel', label: 'Carousel', icon: BarChart3, desc: 'Multi-image' },
    { key: 'story', label: 'Story', icon: Eye, desc: '24hr content' },
    { key: 'storyWithLink', label: 'Story + Link', icon: Link2, desc: 'With swipe-up' },
    { key: 'live', label: 'Instagram Live', icon: Users, desc: 'Live session' },
  ];

  // Get price range for an item
  const getPriceRange = (key) => priceRanges[key] || null;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Rate Card</CardTitle>
              <p className="text-xs text-gray-500">Indian Market Pricing (INR)</p>
            </div>
          </div>
          {!isEditing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setRates(getInitialRates());
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rateItems.map((item) => {
            const range = getPriceRange(item.key);
            return (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-100 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium text-sm">{item.label}</span>
                    {item.desc && <p className="text-xs text-gray-400">{item.desc}</p>}
                  </div>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 font-medium">₹</span>
                    <Input
                      type="number"
                      value={rates[item.key] || 0}
                      onChange={(e) => setRates({ ...rates, [item.key]: parseInt(e.target.value) || 0 })}
                      className="w-24 text-right font-bold border-green-300 focus:border-green-500"
                    />
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600">
                      {formatINR(rates[item.key])}
                    </span>
                    {range && (
                      <p className="text-xs text-gray-400">
                        {formatINR(range.minimum)} - {formatINR(range.maximum)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3 bg-green-50 border-green-100 p-2 rounded-lg border text-center">
          {isEditing
            ? '💡 Update your rates and click Save'
            : '💡 AI-calculated rates based on Indian market benchmarks'}
        </p>
      </CardContent>
    </Card>
  );
};

// Pricing Metrics Component - Shows CPM, CPC, CTR, Predicted Views, Clicks
const PricingMetricsCard = ({ profile }) => {
  const data = profile?.profileData || {};
  const costEstimation = data.costEstimation || {};
  const platform = profile?.platform || 'instagram';

  const hasPredictedViews = costEstimation.predictedViews && Object.keys(costEstimation.predictedViews).length > 0;
  const hasCpm = costEstimation.cpm && Object.keys(costEstimation.cpm).length > 0;

  if (!hasPredictedViews && !hasCpm) {
    return null;
  }

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('en-IN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const contentTypes = platform === 'youtube'
    ? [
      { key: 'dedicatedVideo', label: 'Dedicated Video', icon: BarChart3, desc: 'Full brand video' },
      { key: 'integratedVideo', label: 'Integrated Mention', icon: TrendingUp, desc: '60-90s integration' },
      { key: 'shorts', label: 'YouTube Shorts', icon: Eye, desc: 'Short-form vertical' },
      { key: 'communityPost', label: 'Community Post', icon: MessageCircle, desc: 'Community tab' },
      { key: 'liveStream', label: 'Live Stream', icon: Users, desc: 'Live with brand' },
    ]
    : [
      { key: 'reel', label: 'Reel', icon: TrendingUp, desc: 'Short-form video' },
      { key: 'staticPost', label: 'Feed Post', icon: BarChart3, desc: 'Single image' },
      { key: 'carousel', label: 'Carousel', icon: BarChart3, desc: 'Multi-image' },
      { key: 'story', label: 'Story', icon: Eye, desc: '24hr content' },
      { key: 'storyWithLink', label: 'Story + Link', icon: Link2, desc: 'With swipe-up' },
      { key: 'live', label: 'Instagram Live', icon: Users, desc: 'Live session' },
    ];

  const creatorProfile = costEstimation.creatorProfile || {};
  const multipliers = costEstimation.multipliers || {};

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">Performance Predictions</CardTitle>
            <p className="text-xs text-gray-600 mt-0.5">Industry-level metrics (Indian Market)</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Creator Profile Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="text-center">
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 mb-1">
              {creatorProfile.tierLabel || 'N/A'}
            </Badge>
            <div className="text-xs text-gray-500">Tier</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{creatorProfile.engagementRate?.toFixed(2) || 0}%</div>
            <div className="text-xs text-gray-500">Engagement</div>
          </div>
          <div className="text-center">
            <Badge variant="outline" className={`mb-1 ${['Exceptional', 'Excellent'].includes(creatorProfile.engagementQuality) ? 'bg-green-50 text-green-700' :
              ['Very Good', 'Good'].includes(creatorProfile.engagementQuality) ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
              {creatorProfile.engagementQuality || 'N/A'}
            </Badge>
            <div className="text-xs text-gray-500">Quality</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-600">{multipliers.combined?.toFixed(2) || 1}x</div>
            <div className="text-xs text-gray-500">Multiplier</div>
          </div>
        </div>

        {/* Content Type Metrics */}
        <div className="space-y-3">
          {contentTypes.map((content) => {
            const views = costEstimation.predictedViews?.[content.key];
            const clicks = costEstimation.predictedClicks?.[content.key];
            const ctrData = costEstimation.ctr?.[content.key];
            const cpmData = costEstimation.cpm?.[content.key];
            const cpcData = costEstimation.cpc?.[content.key];
            const priceRange = costEstimation.priceRanges?.[content.key];
            const roiData = costEstimation.roiMetrics?.[content.key];

            if (!views && !cpmData) return null;

            return (
              <div key={content.key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <content.icon className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">{content.label}</span>
                  </div>
                  {priceRange && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">{formatCurrency(priceRange.recommended)}</div>
                      <div className="text-xs text-gray-400">{formatCurrency(priceRange.minimum)} - {formatCurrency(priceRange.maximum)}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {views && (
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-sm font-bold text-blue-600">{formatNumber(views.predicted)}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                  )}
                  {ctrData && (
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-sm font-bold text-indigo-600">{ctrData.predicted}%</div>
                      <div className="text-xs text-gray-500">CTR</div>
                    </div>
                  )}
                  {clicks && (
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-sm font-bold text-blue-600">{formatNumber(clicks.predicted)}</div>
                      <div className="text-xs text-gray-500">Clicks</div>
                    </div>
                  )}
                  {cpmData && (
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-sm font-bold text-indigo-600">{formatCurrency(cpmData.value)}</div>
                      <div className="text-xs text-gray-500">CPM</div>
                    </div>
                  )}
                  {cpcData && (
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-sm font-bold text-orange-600">{formatCurrency(cpcData.value)}</div>
                      <div className="text-xs text-gray-500">CPC</div>
                    </div>
                  )}
                  {roiData && (
                    <div className="text-center p-2 bg-white rounded border">
                      <div className="text-sm font-bold text-teal-600">{roiData.valueScore}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        {costEstimation.recommendations?.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm font-medium text-yellow-800 mb-1">💡 Recommendations</div>
            {costEstimation.recommendations.slice(0, 2).map((rec, idx) => (
              <div key={idx} className="text-xs text-yellow-700">
                <span className="font-medium">{rec.title}:</span> {rec.message}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3 text-center">
          Based on INCA & Indian influencer marketing benchmarks • INR
        </p>
      </CardContent>
    </Card>
  );
};

// Recent Posts/Videos Component
const RecentPosts = ({ profile }) => {
  const platform = profile?.platform || 'instagram';
  const posts = platform === 'youtube'
    ? (profile?.profileData?.recentVideos || [])
    : (profile?.profileData?.recentPosts || []);

  if (posts.length === 0) return null;

  const title = platform === 'youtube' ? 'Recent Videos' : 'Recent Posts';
  const subtitle = platform === 'youtube'
    ? 'Your latest video performance'
    : 'Your latest content performance';

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
            <p className="text-xs text-gray-600 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.slice(0, 6).map((post, index) => {
            // Handle both YouTube and Instagram data structures
            const rawThumbnail = platform === 'youtube'
              ? (post.thumbnail || post.thumbnailUrl || post.thumbnail_url)
              : (post.media_url || post.mediaUrl || post.thumbnail_url || post.thumbnailUrl);

            // Use image proxy for Instagram images to bypass CORS
            // Use image proxy utility
            const thumbnail = getProxiedImageUrl(rawThumbnail);

            const link = platform === 'youtube'
              ? (post.url || post.videoUrl || `https://youtube.com/watch?v=${post.videoId || post.video_id}`)
              : post.permalink;

            const mediaType = platform === 'youtube' ? 'VIDEO' : (post.media_type || 'IMAGE');

            return (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200"
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt=""
                      className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <BarChart3 className="w-8 h-8 text-blue-300" />
                </div>
                {/* Always visible stats overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-3">
                  <div className="text-white text-center">
                    {platform === 'youtube' ? (
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(post.views || post.viewCount || post.view_count || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {(post.likes || post.likeCount || post.like_count || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {(post.comments || post.commentCount || post.comment_count || 0).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {(post.like_count || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {(post.comments_count || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge className="absolute top-2 left-2 text-xs bg-white/95 text-gray-800 hover:bg-white shadow-sm">
                  {mediaType}
                </Badge>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};


// Main CreatorDashboard Component
const CreatorDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeNav, setActiveNav] = useState(searchParams.get('view') || 'home');
  const [activePlatform, setActivePlatform] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState(null); // null means settings page is not shown

  // Onboarding Modal State
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false); // NEW: Submission Modal State
  const [submissionType, setSubmissionType] = useState('script'); // script, video, link
  const [showCertModal, setShowCertModal] = useState(false);

  // Real-time Countdown State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Approval Workflow State
  const [approvalStatus, setApprovalStatus] = useState(null); // 'pending', 'approved', 'rejected'

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Invitations state
  const [invitations, setInvitations] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [expandedInviteId, setExpandedInviteId] = useState(searchParams.get('collab') || null);
  const [activeDetailTab, setActiveDetailTab] = useState(searchParams.get('section') || 'deal-info');

  // Deliverables Workflow State
  const [deliveryStage, setDeliveryStage] = useState('script'); // script, video, publish, payment
  const [generatedScripts, setGeneratedScripts] = useState([]);
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const [scriptText, setScriptText] = useState(''); // NEW: Script Text
  const [scriptLink, setScriptLink] = useState(''); // NEW: Script Link/File
  const [videoLink, setVideoLink] = useState('');
  const [finalLink, setFinalLink] = useState('');
  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Negotiation state (YOUR FEATURE)
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [negotiationInviteId, setNegotiationInviteId] = useState(null);
  const [negotiationRate, setNegotiationRate] = useState('');
  const [negotiationJustification, setNegotiationJustification] = useState('');
  const [submittingNegotiation, setSubmittingNegotiation] = useState(false);

  // Platform icons mapping (removed Twitter)
  const platformIcons = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    linkedin: Linkedin,
  };

  // Tab state for Invites page
  const [activeInvitesTab, setActiveInvitesTab] = useState(searchParams.get('tab') || 'invites');
  const [activeCollaborations, setActiveCollaborations] = useState([]);
  const [completedCollaborations, setCompletedCollaborations] = useState([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const lastExpandedIdRef = useRef(null);

  useEffect(() => {
    fetchProfiles();
    fetchCreatorProfile();
  }, []);

  useEffect(() => {
    if (activeNav === 'invites') {
      // Fetch all data in parallel when entering the page to allow instant tab switching
      const loadData = async () => {
        setLoadingInvites(true);
        setLoadingActive(true);
        try {
          await Promise.all([
            fetchInvitations(),
            fetchActiveCollaborations()
          ]);
        } finally {
          setLoadingInvites(false);
          setLoadingActive(false);
        }
      };
      loadData();
    }
  }, [activeNav]);

  // Lock body scroll when detailed modal is open
  useEffect(() => {
    if (expandedInviteId) {
      document.body.style.overflow = 'hidden';

      // Initialize Delivery Stage
      const invite = invitations.find(i => i._id === expandedInviteId) ||
        activeCollaborations.find(i => i._id === expandedInviteId) ||
        completedCollaborations.find(i => i._id === expandedInviteId);
      if (invite) {
        // Set Default Tab based on Status (Only if newly opened)
        if (expandedInviteId !== lastExpandedIdRef.current) {
          lastExpandedIdRef.current = expandedInviteId;
          if (invite.status === 'pending' || invite.status === 'creator_accepted') {
            setActiveDetailTab('deal-info');
          } else {
            setActiveDetailTab('delivery');
          }
        }

        const content = invite.content || {};

        // Initialize Delivery Stage
        if (content.finalLink?.status === 'submitted' || invite.status === 'final_link_submitted' || invite.status === 'published' || invite.status === 'paid' || invite.status === 'completed') {
          setDeliveryStage('payment');
        } else if (content.video?.status === 'approved') {
          setDeliveryStage('publish');
        } else if (content.video?.status === 'draft_submitted' || content.video?.drafts?.length > 0 || content.script?.status === 'approved' || content.script?.status === 'skipped') {
          setDeliveryStage('video');
        } else {
          setDeliveryStage('script');
        }

        // Set Approval Status based on current deliverables
        if (invite.status === 'completed' || invite.status === 'published' || invite.status === 'paid') {
          setApprovalStatus(null);
        } else if (content.script?.status === 'submitted') {
          setApprovalStatus('pending');
        } else if (content.video?.status === 'draft_submitted') {
          setApprovalStatus('pending'); // Or handle versioning
        } else if (content.finalLink?.status === 'submitted') {
          setApprovalStatus('pending');
        } else {
          setApprovalStatus(null);
        }

        // Set Generated Scripts Key from AI Assist if available
        if (invite.aiAssist?.scripts?.length) {
          setGeneratedScripts(invite.aiAssist.scripts);
        } else if (content.script?.options?.length) {
          setGeneratedScripts(content.script.options);
        }
      }
    } else {
      lastExpandedIdRef.current = null;
      document.body.style.overflow = 'unset';
      setGeneratedScripts([]);
      setVideoLink('');
      setFinalLink('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [expandedInviteId, invitations, activeCollaborations]);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get('/api/profile/profiles');
      const fetchedProfiles = response.data.profiles || [];
      // Filter out Twitter profiles
      const filteredProfiles = fetchedProfiles.filter(p => p.platform !== 'twitter');
      setProfiles(filteredProfiles);

      // Auto-select first platform with data
      if (filteredProfiles.length > 0) {
        setActivePlatform(filteredProfiles[0].platform);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      setLoadingInvites(true);
      // FIXED: Fetch both pending and creator_accepted to show "Brand Approval Pending" invites
      const response = await axios.get('/api/creator/applications?limit=100');
      
      // Filter only auto-invitations (sent by brands) - includes all auto invitation types AND manual invites
      const autoInvitationTypes = ['auto', 'auto_reinvite', 'auto_additional', 'auto_conservative', 'manual'];
      
      // Include pending AND creator_accepted invites (awaiting brand approval)
      const autoInvites = response.data.applications?.filter(app =>
        autoInvitationTypes.includes(app.invitation_type) &&
        (app.status === 'pending' || app.status === 'creator_accepted') &&
        app.campaignId // Ensure campaign exists
      ) || [];

      // Map the data to ensure we have campaign and brand info
      const mappedInvites = autoInvites.map(app => ({
        ...app,
        campaign: app.campaignId || app.campaign,
        brand: app.campaignId?.brandId || app.brand
      }));

      setInvitations(mappedInvites);
    } catch (error) {
      console.error('Fetch invites error:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoadingInvites(false);
    }
  };

  // Wrapper to fetch all dashboard data (for Refresh buttons)
  const fetchDashboardData = async () => {
    await Promise.all([
      fetchInvitations(),
      fetchActiveCollaborations(),
      fetchProfiles()
    ]);
  };

  const fetchActiveCollaborations = async () => {
    setLoadingActive(true);
    try {
      // Re-use invitations endpoint but filter for active deals
      const response = await axios.get('/api/creator/applications?limit=300');
      if (response.data.applications) {
        // Filter for active status and map structure
        // Active: Ongoing status (NOT including completed/published/paid)
        const active = response.data.applications
          .filter(invite =>
            ['creator_accepted', 'brand_confirmed', 'content_submitted', 'content_approved', 'accepted'].includes(invite.status) &&
            invite.campaignId // Ensure campaign exists
          )
          .map(app => ({
            ...app,
            campaign: app.campaignId,
            brand: app.campaignId?.brandId
          }));

        // Completed: Completed, Paid, Published, or Rejected
        const completed = response.data.applications
          .filter(invite =>
            (['completed', 'paid', 'published', 'final_link_submitted', 'rejected', 'brand_rejected', 'withdrawn'].includes(invite.status)) &&
            invite.campaignId // Ensure campaign exists
          )
          .map(app => ({
            ...app,
            campaign: app.campaignId,
            brand: app.campaignId?.brandId
          }));

        setActiveCollaborations(active);
        setCompletedCollaborations(completed);
      }
    } catch (error) {
      console.error('Fetch active collabs error:', error);
      toast.error('Failed to load active collaborations');
    } finally {
      setLoadingActive(false);
    }
  };

  // Negotiation handlers (YOUR FEATURE)
  const handleOpenNegotiation = (inviteId, currentRate) => {
    setNegotiationInviteId(inviteId);
    setNegotiationRate(currentRate?.toString() || '');
    setNegotiationJustification('');
    setShowNegotiationModal(true);
  };
  
  const handleCloseNegotiation = () => {
    setShowNegotiationModal(false);
    setNegotiationInviteId(null);
    setNegotiationRate('');
    setNegotiationJustification('');
  };
  
  const handleSubmitNegotiation = async () => {
    if (!negotiationRate || parseFloat(negotiationRate) <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }
    
    try {
      setSubmittingNegotiation(true);
      
      const response = await axios.post(
        `/api/creator/applications/${negotiationInviteId}/negotiate`, 
        {
          proposedRate: parseFloat(negotiationRate),
          justification: negotiationJustification || undefined
        }
      );
      
      const { message, negotiation, application } = response.data;
      const aiDecision = negotiation.aiDecision.decision;
      
      // Update local state based on AI decision
      if (aiDecision === 'accept') {
        // AI accepted - move to pending confirmation (Brand Approval Pending)
        toast.success(message);
        
        // Update invitation status locally
        setInvitations(prev => prev.map(inv =>
          inv._id === negotiationInviteId
            ? { ...inv, status: 'creator_accepted', negotiation: negotiation }
            : inv
        ));
        
        // Refresh to show in correct tab
        fetchInvitations();
        
      } else if (aiDecision === 'counter') {
        // AI sent counter-offer - show counter-offer UI
        toast.info(message);
        
        // Update invitation with counter-offer data
        setInvitations(prev => prev.map(inv =>
          inv._id === negotiationInviteId
            ? { 
                ...inv, 
                negotiation: {
                  ...negotiation,
                  status: 'counter_offered',
                  counterOffer: negotiation.counterOffer
                }
              }
            : inv
        ));
        
        // Refresh to show counter-offer UI
        fetchInvitations();
        
      } else {
        // AI rejected - move to completed/rejected
        toast.error(message);
        
        // Update invitation status to rejected
        setInvitations(prev => prev.map(inv =>
          inv._id === negotiationInviteId
            ? { ...inv, status: 'rejected', negotiation: negotiation }
            : inv
        ));
        
        // Refresh to move to completed tab
        fetchInvitations();
      }
      
      handleCloseNegotiation();
      
    } catch (error) {
      console.error('Failed to submit negotiation:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to submit negotiation';
      toast.error(errorMessage);
    } finally {
      setSubmittingNegotiation(false);
    }
  };
  
  const handleAcceptCounterOffer = async (applicationId, counterOfferAmount) => {
    try {
      const invitation = invitations.find(inv => inv._id === applicationId);
      if (!invitation?.negotiation?._id) {
        toast.error('Counter-offer not found');
        return;
      }

      const negotiationId = invitation.negotiation._id;

      // Call the negotiation response endpoint
      const response = await axios.post(`/api/creator/negotiations/${negotiationId}/respond`, {
        decision: 'accept'
      });
      
      toast.success(response.data.message || 'Counter-offer accepted!');
      
      // Update local state to show Brand Approval Pending
      setInvitations(prev => prev.map(inv =>
        inv._id === applicationId
          ? { 
              ...inv, 
              status: 'creator_accepted',
              proposedRate: counterOfferAmount,
              negotiation: {
                ...inv.negotiation,
                status: 'creator_accepted_counter'
              }
            }
          : inv
      ));
      
      // Refresh in background
      setTimeout(() => {
        fetchInvitations();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to accept counter-offer:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to accept counter-offer';
      toast.error(errorMessage);
    }
  };

  const handleRejectCounterOffer = async (applicationId) => {
    try {
      const invitation = invitations.find(inv => inv._id === applicationId);
      if (!invitation?.negotiation?._id) {
        toast.error('Counter-offer not found');
        return;
      }

      const negotiationId = invitation.negotiation._id;

      // Call the negotiation response endpoint
      const response = await axios.post(`/api/creator/negotiations/${negotiationId}/respond`, {
        decision: 'reject'
      });
      
      toast.success(response.data.message || 'Counter-offer rejected. Auto-reinvite triggered.');
      
      // Remove from invitations list immediately
      setInvitations(prev => prev.filter(inv => inv._id !== applicationId));
      
      // Refresh in background
      setTimeout(() => {
        fetchInvitations();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to reject counter-offer:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to reject counter-offer';
      toast.error(errorMessage);
    }
  };

  const handleAcceptInvite = async (applicationId) => {
    try {
      await axios.post(`/api/creator/applications/${applicationId}/accept`);
      toast.success('Invitation accepted!');

      // Update the invitation status locally to show accepted state
      setInvitations(prev => prev.map(inv =>
        inv._id === applicationId
          ? { ...inv, status: 'creator_accepted' }
          : inv
      ));

      // Add to active collaborations immediately
      const acceptedInvite = invitations.find(i => i._id === applicationId);
      if (acceptedInvite) {
        setActiveCollaborations(prev => {
          if (prev.find(p => p._id === applicationId)) return prev;
          return [...prev, { ...acceptedInvite, status: 'creator_accepted' }];
        });
      }

      // Optionally refetch in background
      setTimeout(() => {
        // fetchInvitations(); 
        // fetchActiveCollaborations();
      }, 2000);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const handleRejectInvite = async (applicationId) => {
    try {
      await axios.post(`/api/creator/applications/${applicationId}/reject`);
      toast.success('Invitation rejected');

      // Remove from list immediately
      setInvitations(prev => prev.filter(inv => inv._id !== applicationId));
      setActiveCollaborations(prev => prev.filter(inv => inv._id !== applicationId));
    } catch (error) {
      console.error('Failed to reject invitation:', error);
      toast.error('Failed to reject invitation');
    }
  };

  // Sync State <-> URL
  useEffect(() => {
    const view = searchParams.get('view');
    const tab = searchParams.get('tab');
    const collabId = searchParams.get('collab');
    const section = searchParams.get('section');

    if (view && view !== activeNav) setActiveNav(view);
    if (tab && tab !== activeInvitesTab) setActiveInvitesTab(tab);
    if (collabId && collabId !== expandedInviteId) setExpandedInviteId(collabId);
    if (section && section !== activeDetailTab) setActiveDetailTab(section);
  }, [searchParams]);

  // Update URL when State changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (activeNav && activeNav !== 'home') params.set('view', activeNav);
    else params.delete('view');

    if (activeInvitesTab && activeNav === 'invites') params.set('tab', activeInvitesTab);
    else params.delete('tab');

    if (expandedInviteId) params.set('collab', expandedInviteId);
    else params.delete('collab');

    if (activeDetailTab) params.set('section', activeDetailTab);
    else params.delete('section');

    setSearchParams(params, { replace: true });
  }, [activeNav, activeInvitesTab, expandedInviteId, activeDetailTab]);

  const fetchCreatorProfile = async () => {
    try {
      const response = await axios.get('/api/creator/profile');
      setCreatorProfile(response.data.profile);
    } catch (error) {
      console.error('Failed to fetch creator profile:', error);
    }
  };

  const handleAnalyze = async (handles) => {
    setAnalyzing(true);
    try {
      console.log('Analyzing handles:', handles);
      const response = await axios.post('/api/profile/analyze', { handles });
      console.log('Analysis response:', response.data);

      if (response.data.success) {
        const successfulAnalyses = response.data.results.filter(r => r.success);
        const failedAnalyses = response.data.results.filter(r => !r.success);

        if (successfulAnalyses.length > 0) {
          toast.success(`Successfully analyzed ${successfulAnalyses.length} profile(s)!`);
          await fetchProfiles();
          setShowConnectModal(false);
        } else if (failedAnalyses.length > 0) {
          const errorMsg = failedAnalyses[0].error || 'Failed to analyze profiles';
          toast.error(`Analysis failed: ${errorMsg}`);
          console.error('Failed analyses:', failedAnalyses);
        } else {
          toast.error('Failed to analyze profiles. Please check the handles and try again.');
        }
      } else {
        toast.error('Failed to analyze profiles. Please check the handles and try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Analysis failed';
      toast.error(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const getActiveProfile = () => {
    return profiles.find(p => p.platform === activePlatform) || null;
  };

  const getConnectedPlatforms = () => {
    return [...new Set(profiles.map(p => p.platform))];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleDisconnectProfile = async (platform, handle) => {
    try {
      await axios.delete(`/api/profile/disconnect`, {
        data: { platform, handle }
      });
      await fetchProfiles();
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  };

  // Render Home Page
  const renderHomePage = () => {
    const activeProfile = getActiveProfile();
    const connectedPlatforms = getConnectedPlatforms();

    return (
      <div className="space-y-6">
        {/* Greeting Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {creatorProfile?.fullName || user?.name || 'Creator'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {profiles.length > 0
                ? `You have ${profiles.length} connected social account${profiles.length > 1 ? 's' : ''}`
                : 'Connect your social accounts to get started'}
            </p>
          </div>
          <Button
            onClick={() => setShowConnectModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Socials
          </Button>
        </div>

        {/* Platform Tabs */}
        {profiles.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {['instagram', 'youtube', 'facebook', 'linkedin'].map((platform) => {
              const Icon = platformIcons[platform];
              const hasData = connectedPlatforms.includes(platform);
              return (
                <PlatformTab
                  key={platform}
                  platform={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  icon={Icon}
                  isActive={activePlatform === platform}
                  onClick={() => hasData && setActivePlatform(platform)}
                  hasData={hasData}
                />
              );
            })}
          </div>
        )}

        {/* Profile Content */}
        {activeProfile ? (
          <div className="space-y-6">
            {/* Combined Creator Profile Card - Includes profile, metrics, and content insights */}
            <CombinedCreatorProfileCard profile={activeProfile} creatorProfile={creatorProfile} />

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Editable Rate Card */}
              <EditableRateCard profile={activeProfile} creatorProfile={creatorProfile} onSave={fetchProfiles} />

              {/* Relevant Hashtags */}
              <RelevantHashtags profile={activeProfile} creatorProfile={creatorProfile} />
            </div>

            {/* Performance Predictions - CPM, CPC, CTR, Views, Clicks */}
            <PricingMetricsCard profile={activeProfile} />

            {/* Recent Posts */}
            <RecentPosts profile={activeProfile} />
          </div>
        ) : (
          /* Empty State */
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Your Social Accounts
              </h3>
              <p className="text-gray-600 mb-6">
                Link your Instagram, YouTube, or LinkedIn accounts to analyze your creator metrics and unlock insights.
              </p>
              <Button
                onClick={() => setShowConnectModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect Socials
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  };

  // Render Video Player Helper
  const renderVideoPlayer = (url) => {
    if (!url) return null;

    // Check if YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);

    if (youtubeMatch && youtubeMatch[1]) {
      return (
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm max-w-[50%] mx-auto">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
            title="Campaign Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      );
    }

    // Check if Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);

    if (vimeoMatch && vimeoMatch[1]) {
      return (
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-sm max-w-[50%] mx-auto">
          <iframe
            width="100%"
            height="100%"
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
            title="Campaign Video"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      );
    }

    // Default to direct video file
    return (
      <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group max-w-[50%] mx-auto">
        <video controls className="w-full h-full object-cover">
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  // --- Handlers for Delivery Workflow ---



  const handleSubmitScript = async () => {
    if (!expandedInviteId) return;
    if (!scriptText.trim()) {
      toast.error('Please enter your script first');
      return;
    }

    try {
      const invite = invitations.find(i => i._id === expandedInviteId) || activeCollaborations.find(i => i._id === expandedInviteId);
      const campaignId = typeof invite.campaignId === 'object' ? invite.campaignId._id : invite.campaignId;

      await axios.post(`/api/campaign-collaboration/${campaignId}/collaboration/${expandedInviteId}/script/submit`, {
        text: scriptText
      });

      toast.success('Script submitted! Waiting for brand approval.');
      toast.success('Script submitted! Waiting for brand approval.');
      // Update local state to reflect submission
      const updateState = (prev) => prev.map(app => {
        if (app._id === expandedInviteId) {
          return {
            ...app,
            content: {
              ...app.content,
              script: {
                ...app.content?.script,
                status: 'submitted',
                submittedAt: new Date(),
                text: scriptText // ensure text is updated too if needed
              }
            }
          };
        }
        return app;
      });

      setInvitations(updateState);
      setActiveCollaborations(updateState);
    } catch (error) {
      console.error('Script submission error:', error);
      toast.error('Failed to submit script');
    }
  };

  const handleSubmitVideoDraft = async () => {
    if (!expandedInviteId) return;

    const trimmedLink = videoLink.trim();
    if (!trimmedLink || !trimmedLink.startsWith('http')) {
      toast.error('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    try {
      const invite = invitations.find(i => i._id === expandedInviteId) || activeCollaborations.find(i => i._id === expandedInviteId);
      const campaignId = typeof invite.campaignId === 'object' ? invite.campaignId._id : invite.campaignId;

      const response = await axios.post(`/api/campaign-collaboration/${campaignId}/collaboration/${expandedInviteId}/video/submit`, {
        videoUrl: videoLink
      });

      toast.success(`Draft ${response.data.draftNumber} submitted!`);

      // Update local state immediately
      const updateState = (prev) => prev.map(app => {
        if (app._id === expandedInviteId) {
          const currentDrafts = app.content?.video?.drafts || [];
          const newDraft = {
            version: currentDrafts.length + 1,
            url: videoLink,
            status: 'submitted',
            submittedAt: new Date()
          };
          return {
            ...app,
            status: 'content_submitted',
            content: {
              ...app.content,
              video: {
                ...app.content?.video,
                status: 'draft_submitted',
                drafts: [...currentDrafts, newDraft]
              }
            }
          };
        }
        return app;
      });

      setInvitations(updateState);
      setActiveCollaborations(updateState);

      setVideoLink('');
    } catch (error) {
      console.error('Video submission error:', error);
      toast.error('Failed to submit video draft');
    }
  };

  const handleSubmitFinalLink = async () => {
    if (!finalLink.trim() || !expandedInviteId) return;
    try {
      const invite = invitations.find(i => i._id === expandedInviteId) || activeCollaborations.find(i => i._id === expandedInviteId);
      const campaignId = typeof invite.campaignId === 'object' ? invite.campaignId._id : invite.campaignId;

      await axios.post(`/api/campaign-collaboration/${campaignId}/collaboration/${expandedInviteId}/final/submit`, {
        finalLink: finalLink
      });

      setShowSuccessModal(true);
      // toast.success('Final link submitted! Deal completed.');

      const updateState = (prev) => prev.map(app => {
        if (app._id === expandedInviteId) {
          return {
            ...app,
            status: 'completed',
            content: {
              ...app.content,
              finalLink: {
                url: finalLink,
                status: 'submitted',
                submittedAt: new Date()
              }
            }
          };
        }
        return app;
      });

      setInvitations(updateState);
      setActiveCollaborations(updateState);

      setDeliveryStage('payment');
    } catch (error) {
      console.error('Final submission error:', error);
      toast.error('Failed to submit final link');
    }
  };

  const handleGenerateAssets = async () => {
    if (!expandedInviteId) return;
    setIsGeneratingScripts(true);
    try {
      const invite = invitations.find(i => i._id === expandedInviteId) || activeCollaborations.find(i => i._id === expandedInviteId);

      // toast.info('Generating AI Scripts...');
      const response = await axios.post(`/api/creator/applications/${expandedInviteId}/generate-ai-assets`);

      if (response.data.success) {
        toast.success('Scripts Generated Successfully!');
        setSelectedScriptIndex(0);
        // Update local state
        const updateState = (prev) => prev.map(app => {
          if (app._id === expandedInviteId) {
            return {
              ...app,
              aiAssist: response.data.aiAssist
            };
          }
          return app;
        });
        setInvitations(updateState);
        setActiveCollaborations(updateState);
      }
    } catch (error) {
      console.error('Asset generation error:', error);
      toast.error('Failed to generate scripts. Please try again.');
    } finally {
      setIsGeneratingScripts(false);
    }
  };

  // Ref to track if we tried generating for this session/mount
  const generationAttemptedRef = useRef(false);

  // Auto-Generate Scripts if missing
  useEffect(() => {
    if (activeDetailTab === 'sera-studio' && expandedInviteId) {
      const invite = invitations.find(i => i._id === expandedInviteId) || activeCollaborations.find(i => i._id === expandedInviteId);
      if (!invite) return;

      const isActive = ['brand_confirmed', 'content_submitted', 'content_approved', 'accepted'].includes(invite.status);
      const hasScripts = invite.aiAssist?.scripts && invite.aiAssist.scripts.length > 0;

      // Only generate if active, no scripts, not currently generating, AND NOT ATTEMPTED yet
      if (isActive && !hasScripts && !isGeneratingScripts && !generationAttemptedRef.current) {
        generationAttemptedRef.current = true; // Mark as attempted
        handleGenerateAssets();
      }
    }
  }, [activeDetailTab, expandedInviteId, isGeneratingScripts]); // Check dependencies carefully


  // Render Detailed Modal
  const renderDetailedModal = (invite) => {
    if (!invite) return <div>Collaboration not found</div>;
    const creatorHandle = profiles.find(p => p.platform === invite.target_platform)?.handle || 'your_handle';
    const placementType = invite.selected_placement?.type || invite.campaign?.contentType || 'Post';
    const isPendingApproval = invite.status === 'creator_accepted';
    const isCompleted = ['completed', 'paid', 'published', 'final_link_submitted'].includes(invite.status);
    const isActive = ['brand_confirmed', 'content_submitted', 'content_approved', 'accepted'].includes(invite.status);

    // Define generatedScripts from invite data or fallback
    const generatedScripts = invite.aiAssist?.scripts || [];
    const isRejected = ['rejected', 'brand_rejected'].includes(invite.status);

    const hasContent = (invite.content?.video?.drafts?.length > 0) || (invite.content?.finalLink && invite.content.finalLink.length > 5);
    // Dynamic Header Status
    const hasFinalLink = (invite.content?.finalLink && typeof invite.content.finalLink === 'string' && invite.content.finalLink.length > 10) || invite.status === 'final_link_submitted';
    const isSuccessful = isCompleted || hasFinalLink;

    const formatPlacementName = (type) => {
      const names = {
        reel: 'Reels',
        staticPost: 'Post',
        carousel: 'Carousel',
        story: 'Story',
        dedicatedVideo: 'Dedicated Video',
        integratedVideo: 'Integrated Video',
        shorts: 'Shorts',
        communityPost: 'Community Post'
      };
      return names[type] || type;
    };

    return (
      <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
        <div className="min-h-screen">
          {/* Top Bar - Application Status */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-bold text-gray-900">Sera AI</span>
                <span className="w-px h-3 bg-gray-300"></span>
                <span>AI creator talent manager</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isSuccessful ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Collaboration Completed
                </div>
              ) : isActive ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  Active Collaboration
                </div>
              ) : isPendingApproval ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
                  <Clock className="w-3.5 h-3.5" />
                  Brand Approval Pending
                </div>
              ) : isRejected ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                  <X className="w-3.5 h-3.5" />
                  Collaboration Rejected
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                  <Mail className="w-3.5 h-3.5" />
                  Pending Invitation
                </div>
              )}
              <button
                onClick={() => setExpandedInviteId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Status Banner */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {isSuccessful ? 'Collaboration Completed' : isActive ? 'Active Collaboration' : 'Collaboration Status'}
                  </h3>
                  <p className="text-sm text-gray-600 max-w-2xl">
                    {isSuccessful ? 'Great job! You have completed this collaboration.' :
                      isActive ? 'Please ensure you follow the delivery timeline.' :
                        isRejected ? 'This collaboration has been closed or rejected.' :
                          'Status update for your collaboration.'}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedInviteId(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-gray-50"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header Card with Brand Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start gap-4">
                    {/* Brand Logo */}
                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm p-2">
                      {invite.campaign?.extendedDetails?.businessLogo || invite.brand?.logo ? (
                        <img src={invite.campaign?.extendedDetails?.businessLogo || invite.brand?.logo} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl font-bold text-blue-600">{(invite.campaign?.extendedDetails?.businessName || invite.brand?.name || 'B').charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                        {invite.campaign?.extendedDetails?.businessName || invite.brand?.name} x {creatorHandle}
                      </h1>

                      <div className="flex flex-wrap gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                          <Briefcase className="w-3.5 h-3.5" />
                          {invite.campaign?.extendedDetails?.businessName || invite.brand?.name || 'Brand Name'}
                        </div>
                        {(invite.campaign?.extendedDetails?.website || invite.brand?.website) && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 max-w-full">
                            <Globe2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <a href={invite.campaign?.extendedDetails?.website || invite.brand?.website} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline truncate max-w-[150px] md:max-w-[200px] block">{(invite.campaign?.extendedDetails?.website || invite.brand?.website).replace(/^https?:\/\//, '')}</a>
                          </div>
                        )}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                          {placementType.toLowerCase().includes('video') || placementType.toLowerCase().includes('reel') ? <TrendingUp className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
                          {formatPlacementName(placementType)}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                          {invite.target_platform === 'instagram' && <Instagram className="w-3.5 h-3.5 text-pink-600" />}
                          {invite.target_platform === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-600" />}
                          @{creatorHandle}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs within Detailed View */}
                <div className="border-b border-gray-200 mb-6">
                  <div className="flex gap-8">
                    {/* Delivery Tab */}
                    {(isActive || isCompleted || hasContent) && (
                      <button
                        onClick={() => setActiveDetailTab('delivery')}
                        className={`pb-3 font-medium text-sm transition-colors relative ${activeDetailTab === 'delivery'
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          Delivery
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        </div>
                        {activeDetailTab === 'delivery' && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setActiveDetailTab('deal-info')}
                      className={`pb-3 font-medium text-sm transition-colors relative ${activeDetailTab === 'deal-info'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Deal Info
                      {activeDetailTab === 'deal-info' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveDetailTab('requirement')}
                      className={`pb-3 font-medium text-sm transition-colors relative ${activeDetailTab === 'requirement'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Requirement
                      {activeDetailTab === 'requirement' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveDetailTab('sera-studio')}
                      className={`pb-3 font-medium text-sm transition-colors relative ${activeDetailTab === 'sera-studio'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      ✨ Sera studio
                      {activeDetailTab === 'sera-studio' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  {activeDetailTab === 'delivery' && (
                    <div className="space-y-8">
                      {/* Timeline / Progress Stepper would go here but it's confusing with Sidebar. 
                           User image shows a clean vertical timeline on LEFT for "Delivery" tab specifically?
                           Image 1: "Delivery" tab selected. 
                           Left side: Vertical dots line. "Video draft 1", "Script".
                           Wait, the image shows a vertical timeline INSIDE the Delivery Tab content area.
                       */}

                      <div className="relative pl-8 space-y-12">
                        {/* Vertical Line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                        {/* Final Link Stage */}
                        <div className="relative">
                          <div className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 ${deliveryStage === 'payment' || deliveryStage === 'publish' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                            }`}></div>
                          <h3 className="text-sm font-bold text-gray-900 mb-4">
                            {invite.content?.finalLink?.status === 'submitted' || invite.status === 'final_link_submitted' || isCompleted ? 'Final Link Submitted' : 'Final Link'}
                          </h3>
                          {deliveryStage === 'publish' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                              <h4 className="font-bold text-blue-900 mb-2">Submit Final Link</h4>
                              <p className="text-xs text-blue-700 mb-4">Post your approved content at a peak time and submit the final link.</p>
                              <div className="flex gap-4">
                                <input
                                  type="text"
                                  placeholder="Paste your video link here..."
                                  className="flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={finalLink}
                                  onChange={(e) => setFinalLink(e.target.value)}
                                />
                                <Button className="bg-blue-600 text-white" onClick={() => handleSubmitFinalLink()}>Submit</Button>
                              </div>
                            </div>
                          )}

                          {/* Show Submitted Link if available */}
                          {(invite.content?.finalLink?.status === 'submitted' || isCompleted) && invite.content?.finalLink?.url && (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mt-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-bold text-green-900 text-sm">Submitted Link</h5>
                                  <a href={invite.content.finalLink.url} target="_blank" rel="noreferrer" className="text-sm text-green-700 underline truncate block max-w-xs">{invite.content.finalLink.url}</a>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Video Draft Stage */}
                        <div className="relative">
                          <div className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 ${deliveryStage === 'video' || deliveryStage === 'publish' || deliveryStage === 'payment' ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                            }`}></div>
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-sm font-bold text-gray-900">Video Drafts</h3>
                            {deliveryStage === 'video' && <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">In Progress</span>}
                          </div>

                          {/* Draft History Timeline - Latest First (Explicit Sort) */}
                          {invite.content?.video?.drafts?.length > 0 && (
                            <div className="mb-8 space-y-6">
                              {[...invite.content.video.drafts].sort((a, b) => b.version - a.version).map((draft, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                  {/* Timeline Line */}
                                  <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm border-2 ${draft.status === 'approved' ? 'bg-green-50 border-green-500 text-green-700' :
                                      'bg-blue-100 border-blue-200 text-blue-700'
                                      }`}>
                                      V{draft.version}
                                    </div>
                                    {idx < invite.content.video.drafts.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                                  </div>

                                  <div className="flex-1 pb-4">
                                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                        <h4 className="font-bold text-sm text-gray-900">Video Draft {draft.version}</h4>
                                        <span className="text-xs text-gray-500">{new Date(draft.submittedAt).toLocaleDateString()}</span>
                                      </div>

                                      <div className="aspect-video bg-black max-w-[50%] relative group">
                                        {/* Use renderVideoPlayer or simpler logic here. Reuse render logic. */}
                                        {(() => {
                                          const url = draft.url;
                                          if (!url) return <div className="text-xs text-gray-500 p-4">No Video URL</div>;

                                          // Handle YouTube
                                          if (url.includes('youtube') || url.includes('youtu.be')) {
                                            const videoId = url.includes('shorts/')
                                              ? url.split('shorts/')[1]?.split('?')[0]
                                              : url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/|v\/)([^&?]+)/)?.[1];

                                            // Fallback for just ID if no match
                                            const finalId = videoId || (url.length === 11 ? url : null);

                                            return finalId ? <iframe src={`https://www.youtube.com/embed/${finalId}`} className="w-full h-full" allowFullScreen /> : <div className="p-4 text-xs text-red-500">Invalid YouTube URL. Supported: watch?v=, youtu.be/, shorts/</div>;
                                          }
                                          // Handle Direct Files (mp4, mov)
                                          if (url.match(/\.(mp4|mov)$/i)) {
                                            return <video src={url} controls className="w-full h-full object-cover" />;
                                          }
                                          // Fallback
                                          return <div className="p-4 text-white text-xs break-all flex items-center justify-center h-full bg-gray-800">
                                            <a href={url} target="_blank" rel="noreferrer" className="underline hover:text-blue-300">Open Link</a>
                                          </div>;
                                        })()}
                                      </div>

                                      <div className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${draft.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            draft.status === 'changes_requested' ? 'bg-orange-100 text-orange-800' :
                                              'bg-blue-100 text-blue-800'
                                            }`}>
                                            {draft.status === 'pending_review' ? 'Under Review' : draft.status.replace('_', ' ')}
                                          </span>
                                        </div>
                                        {draft.feedback && (
                                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm">
                                            <strong className="text-orange-900 block mb-1">Feedback:</strong>
                                            <p className="text-gray-700">{draft.feedback}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {deliveryStage === 'video' && (
                            <div className="space-y-4">
                              {['draft_submitted', 'pending_review'].includes(invite.content?.video?.status) ? (
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-8 text-center">
                                  <Clock className="w-10 h-10 text-yellow-600 mx-auto mb-4" />
                                  <h4 className="font-bold text-lg text-gray-900 mb-2">Video Under Review</h4>
                                  <p className="text-gray-600 mb-4">Your video draft has been submitted and is pending brand approval.</p>

                                  {/* Preview removed (shown in history above) */}

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchDashboardData}
                                    className="bg-white hover:bg-gray-50 text-gray-700"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Check Status
                                  </Button>
                                </div>
                              ) : (
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                                  {invite.content?.video?.status === 'changes_requested' && (
                                    <div className="mb-4 bg-orange-50 p-4 rounded-lg border border-orange-100">
                                      <h4 className="font-bold text-sm text-orange-900 mb-1">Feedback from Brand:</h4>
                                      <p className="text-sm text-orange-800">
                                        {invite.content?.video?.drafts?.length > 0
                                          ? (invite.content.video.drafts.slice().reverse().find(d => d.feedback)?.feedback || 'Please review requested changes.')
                                          : 'Please review requested changes.'}
                                      </p>
                                    </div>
                                  )}
                                  <h4 className="font-bold text-gray-900 mb-2">
                                    {invite.content?.video?.status === 'changes_requested' ? 'Submit New Draft' : 'Submit Video Draft'}
                                  </h4>
                                  <p className="text-xs text-gray-500 mb-4">Upload your draft or paste a link (YouTube Unlisted / Google Drive).</p>
                                  <div className="space-y-4">
                                    <input
                                      type="text"
                                      placeholder="Paste video draft link..."
                                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      value={videoLink}
                                      onChange={(e) => setVideoLink(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                      <Button className="bg-black text-white" onClick={() => handleSubmitVideoDraft()}>Submit Draft</Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Script Stage */}
                        <div className="relative">
                          <div className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 ${deliveryStage !== 'script' ? 'bg-green-500 border-green-500' : 'bg-blue-600 border-blue-600'
                            }`}></div>
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-sm font-bold text-gray-900">Script</h3>
                            {deliveryStage === 'script' ? (
                              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Action Required</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Approved</span>
                            )}
                          </div>

                          {/* Show Script Content if Approved/Moved Past */}
                          {(deliveryStage !== 'script' || invite.content?.script?.status === 'approved') && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
                              <h4 className="font-bold text-sm text-gray-900 mb-2">Submitted Script / Concept</h4>
                              {invite.content?.script?.text && <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{invite.content.script.text}</p>}
                              {invite.content?.script?.fileUrl && (
                                <a href={invite.content.script.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:align-top flex items-center gap-1">
                                  <LinkIcon className="w-3 h-3" /> View Attached File
                                </a>
                              )}
                            </div>
                          )}

                          {deliveryStage === 'script' && (
                            <div className="space-y-4">
                              {invite.content?.script?.status === 'submitted' ? (
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-8 text-center">
                                  <Clock className="w-10 h-10 text-yellow-600 mx-auto mb-4" />
                                  <h4 className="font-bold text-lg text-gray-900 mb-2">Script Under Review</h4>
                                  <p className="text-gray-600 mb-4">Your script has been submitted and is pending brand approval.</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchDashboardData}
                                    className="bg-white hover:bg-gray-50 text-gray-700"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Check Status
                                  </Button>
                                </div>
                              ) : (
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  {invite.content?.script?.status === 'changes_requested' && (
                                    <div className="mb-4 bg-orange-50 p-4 rounded-lg border border-orange-100">
                                      <h4 className="font-bold text-sm text-orange-900 mb-1">Feedback from Brand:</h4>
                                      <p className="text-sm text-orange-800">{invite.content?.script?.feedback}</p>
                                    </div>
                                  )}
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {invite.content?.script?.status === 'changes_requested' ? 'Resubmit Script / Concept' : 'Script / Concept Proposal'}
                                  </label>
                                  <textarea
                                    className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm transition-shadow"
                                    placeholder="Write your script or concept here for brand approval..."
                                    value={scriptText}
                                    onChange={(e) => setScriptText(e.target.value)}
                                  />
                                  <div className="flex justify-end mt-3">
                                    <Button
                                      className="bg-blue-600 text-white shadow-sm hover:shadow-md transition-all"
                                      onClick={handleSubmitScript}
                                      disabled={!scriptText.trim()}
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Submit Script
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDetailTab === 'deal-info' && (
                    <div className="space-y-8">
                      {/* Campaign Name */}
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Campaign Name</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">{invite.campaign?.title || 'Campaign Title'}</p>
                      </div>

                      {/* Product Intro */}
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Product intro</h2>
                        {invite.campaign?.description ? (
                          <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-light">
                            {invite.campaign.description}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500 italic text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <AlertCircle className="w-4 h-4" />
                            <span>Not provided by brand</span>
                          </div>
                        )}
                      </div>

                      {/* Product/Campaign Video */}
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Product/campaign video</h2>
                        {invite.campaign?.settings?.productExplainerVideo ? (
                          renderVideoPlayer(invite.campaign.settings.productExplainerVideo)
                        ) : (
                          <div className="aspect-video bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400">
                            <Video className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-sm italic">No video provided</span>
                          </div>
                        )}
                      </div>

                      {/* Core Selling Points */}
                      {invite.campaign?.extendedDetails?.coreSellingPoints?.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">Core selling points</h2>
                          <ol className="list-decimal list-outside ml-5 space-y-2 text-sm text-gray-600 font-light">
                            {invite.campaign.extendedDetails.coreSellingPoints.map((point, idx) => (
                              <li key={idx} className="leading-relaxed pl-2">{point}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Promotional Link - Always visible but Locked if not accepted */}
                      <div className={`p-5 rounded-lg border ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-sm font-bold text-gray-900">Promotional link</h2>
                          {!isActive && <Lock className="w-4 h-4 text-gray-400" />}
                        </div>
                        {isActive ? (
                          <div className="flex items-center gap-2 mt-2">
                            <code className="px-3 py-1.5 bg-white rounded border border-blue-200 text-blue-600 text-sm flex-1">
                              https://sera.ai/click/{invite._id}
                            </code>
                            <Button size="sm" variant="outline" className="h-[34px]" onClick={() => { navigator.clipboard.writeText(`https://sera.ai/click/${invite._id}`); toast.success('Link copied!') }}>
                              Copy
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            Unique promotional link will be generated after application approval.
                          </p>
                        )}
                      </div>

                      {/* Brand Resources - Always visible but Locked if not accepted */}
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          Brand resources
                          {!isActive && <Badge variant="secondary" className="text-xs font-normal">Locked</Badge>}
                        </h2>
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isActive ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-gray-50'
                          }`}>
                          {isActive ? (
                            <div className="flex flex-col items-center">
                              <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                <Download className="w-6 h-6 text-blue-600" />
                              </div>
                              <h3 className="text-sm font-medium text-gray-900 mb-1">Download Brand Assets</h3>
                              <p className="text-xs text-gray-500 mb-4">Logos, product images, and content guidelines</p>
                              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                                Download ZIP
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center opacity-70">
                              <Lock className="w-8 h-8 text-gray-400 mb-3" />
                              <p className="text-sm text-gray-500 max-w-sm">
                                Brand assets (promotional kits, files, guidelines) become available once you accept the invitation and are approved.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment info</h2>
                        <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Total payment</span>
                            <span className="text-xl font-bold text-gray-900">₹{invite.proposedRate?.toLocaleString('en-IN') || '0'}</span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">Payment Time</p>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                100% secured on confirmed interest. Withdrawal available 10 days after final submission.
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">Payment method</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-white">Bank Transfer</Badge>
                                <Badge variant="outline" className="bg-white">PayPal</Badge>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Taxes not applied - Seller liable</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDetailTab === 'requirement' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Package className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Deliverables & Requirements</h2>
                      </div>

                      {/* Deliverables List */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2 capitalize">
                            {invite.target_platform} {formatPlacementName(placementType)}
                          </h3>
                          <ul className="space-y-2 ml-5 list-disc text-sm text-gray-600">
                            <li>Create and post high-quality content</li>
                            <li>Tag @{invite.brand?.name?.replace(/\s+/g, '')}</li>
                            <li>Use hashtags as specified</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDetailTab === 'sera-studio' && (
                    <div className="space-y-8">
                      {/* Locked State if not approved */}
                      {!isActive ? (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Sera Studio is Locked</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            This workspace will be unlocked once the brand approves your application.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Scripts Section */}
                          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-4 mb-6 bg-blue-50 p-4 rounded-lg">
                              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-800">
                                These three ideas are generated based on your past content, combined with the products promoted by advertisers and trending videos. Please choose one as your creative material.
                              </p>
                            </div>

                            {/* Script Tabs */}
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                              {[0, 1, 2].map((idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedScriptIndex(idx)}
                                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${selectedScriptIndex === idx
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                  Script {idx + 1}
                                </button>
                              ))}
                            </div>

                            {/* Script Content */}
                            {generatedScripts.length === 0 ? (
                              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                                {isGeneratingScripts ? (
                                  <>
                                    <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Generating Your Personal Scripts...</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                      Our AI is analyzing the brand and your content style to create high-converting scripts.
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Waiting for content...</h3>
                                    <p className="text-gray-500">If scripts don't appear, try refreshing.</p>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-6">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommended Title</p>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {generatedScripts[selectedScriptIndex]?.title || "Unlock Your Creative Potential with Sera Creator"}
                                  </h3>
                                </div>

                                <div className="space-y-4">
                                  {(generatedScripts[selectedScriptIndex]?.sections || [
                                    { heading: "Introduction to Sera Creator", body: "Introduce the concept of Sera Creator and its purpose in the content creation landscape." },
                                    { heading: "Core Features Overview", body: "Highlight the key features of Sera Creator that make it an essential tool for creators." },
                                    { heading: "Personal Testimonial", body: "Share a personal experience or hypothetical scenario of using Sera Creator." },
                                    { heading: "Call to Action", body: "Encourage viewers to take action and explore Sera Creator for themselves." }
                                  ]).map((section, idx) => (
                                    <div key={idx}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        <h4 className="font-bold text-gray-900">{section.heading}</h4>
                                      </div>
                                      <p className="text-gray-600 text-sm pl-3.5 border-l-2 border-gray-100 ml-0.5">
                                        {section.body}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Viral Video Picks */}
                          < div >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Viral video picks</h3>
                            <p className="text-sm text-gray-500 mb-4">
                              These outlier videos are carefully selected for your channel and this collaboration. Feel free to take their thumbnails, titles, storytelling technique etc. as a reference.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {(invite.aiAssist?.viralVideos || []).map((video, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                  <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-2 relative">
                                    {video.embedUrl ? (
                                      <iframe
                                        src={video.embedUrl}
                                        title={video.title}
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                      ></iframe>
                                    ) : (
                                      <>
                                        <img src={video.thumbnailUrl} alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                            <Video className="w-5 h-5 text-gray-900 ml-0.5" />
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {video.title}
                                  </h4>
                                  {video.reason && (
                                    <p className="text-xs text-blue-600 mt-1.5 italic line-clamp-3">
                                      💡 {video.reason}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">{video.views} views</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Keywords to Select */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">Keywords to select</h3>
                              <Info className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                              Keywords tailored for your channel and this collaboration.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(invite.aiAssist?.keywords || ['Advertising technology', 'AI technology', 'AI recommendations', 'Sera Creator', 'Influencer relationships']).map((keyword, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 cursor-pointer transition-colors border border-gray-200">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6 sticky top-24">

                  {/* Onboarding Training Banner - Only show if NOT active/approved */}
                  {!isActive && (
                    <div
                      onClick={() => { setOnboardingStep(1); setShowOnboardingModal(true); }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-3 flex justify-between items-center text-white cursor-pointer shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-space tracking-wide">Onboarding Training</span>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-medium">Paid sponsorship</span>
                      </div>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </div>
                  )}

                  {/* Deal Status vs Deal Price Switcher */}
                  {isActive ? (
                    <div className="space-y-6">
                      {/* NEW: Deal Status Widget */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-gray-900">Deal status</h3>
                          {/* Progress Dots */}
                          <div className="flex items-center gap-1">
                            {['script', 'video', 'publish', 'payment'].map((s) => (
                              <div key={s} className={`w-2 h-2 rounded-full ${deliveryStage === s ||
                                (s === 'video' && deliveryStage === 'publish') ||
                                ((s === 'video' || s === 'publish') && deliveryStage === 'payment')
                                ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                            ))}
                          </div>
                        </div>

                        {/* Status Steps */}
                        <div className="flex justify-between items-center px-0 mb-8 relative">
                          {/* Connecting Line */}
                          <div className="absolute left-4 right-4 top-3 h-0.5 bg-gray-100 -z-0"></div>

                          {['Script', 'Video', 'Publish', 'Payment'].map((step, idx) => {
                            const steps = ['script', 'video', 'publish', 'payment'];
                            const currentIdx = steps.indexOf(deliveryStage);
                            const isCompleted = idx < currentIdx;
                            const isCurrent = idx === currentIdx;

                            return (
                              <div key={step} className="flex flex-col items-center relative z-10 w-1/4">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all bg-white ${isCompleted || isCurrent
                                  ? 'border-blue-600 text-blue-600'
                                  : 'border-gray-300 text-gray-400'
                                  }`}>
                                  {isCompleted ? <Check className="w-3 h-3" /> : (idx + 1)}
                                </div>
                                <span className={`text-[10px] mt-1 font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-400'
                                  }`}>{step}</span>
                              </div>
                            );
                          })}
                        </div>

                        <Button
                          className={`w-full mb-6 transition-all ${approvalStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-wait'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          disabled={approvalStatus === 'pending'} // Disable if pending
                          onClick={() => {
                            setSubmissionType(deliveryStage);
                            setShowSubmissionModal(true);
                          }}
                        >
                          {approvalStatus === 'pending' ? (
                            <span className="flex items-center justify-center gap-2">
                              <Clock className="w-4 h-4 animate-pulse" />
                              Waiting for Approval...
                            </span>
                          ) : (
                            <>
                              {deliveryStage === 'script' && 'Submit script'}
                              {deliveryStage === 'video' && 'Submit video'}
                              {deliveryStage === 'publish' && 'Submit link'}
                              {deliveryStage === 'payment' && 'View invoice'}
                            </>
                          )}
                        </Button>

                        {approvalStatus !== 'pending' && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-2">Postpone timeline</p>
                            {/* Dynamic Countdown */}
                            <div className="flex items-center justify-center gap-2 text-blue-600 font-mono text-sm font-bold bg-blue-50 py-2 rounded-lg">
                              {(() => {
                                // Calculate deadline based on stage
                                const acceptedDate = new Date(invite.brandResponse?.respondedAt || invite.createdAt);
                                let daysToAdd = 3;

                                if (deliveryStage === 'script') daysToAdd = 3;
                                else if (deliveryStage === 'video') daysToAdd = 6;
                                else if (deliveryStage === 'publish') daysToAdd = 10; // 4th draft/final

                                const deadline = new Date(acceptedDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
                                const now = new Date();
                                const diff = deadline - now;

                                if (diff <= 0) return <span>Due Today</span>;

                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                                return (
                                  <>
                                    <span>{days}d</span> : <span>{hours.toString().padStart(2, '0')}h</span> : <span>{minutes.toString().padStart(2, '0')}m</span> : <span>{seconds.toString().padStart(2, '0')}s</span>
                                    <span className="text-[10px] text-gray-500 font-sans font-normal ml-1">left to submit</span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info Summary Card */}
                      <div className="mb-8">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Price Details</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sera AI guideline rate</span>
                            <span className="font-medium text-gray-900">{invite.proposedRate?.toLocaleString('en-IN') || '0'} INR</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">AI talent manager costs</span>
                            <span className="font-medium text-gray-900">
                              <span className="font-bold">2.12 INR</span>
                              <span className="text-gray-400 line-through ml-1 text-xs">3.53 INR</span>
                            </span>
                          </div>
                          <div className="flex justify-between pt-3 text-base">
                            <span className="text-gray-600 font-medium">Your earnings</span>
                            <span className="font-bold text-gray-900">{((invite.proposedRate || 0) * 0.95).toLocaleString('en-IN')} INR</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Original Deal Price Card for Negotiation Phase */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Deal price</h3>
                        <Info className="w-5 h-5 text-blue-300" />
                      </div>

                      {/* Check if there's a counter-offer */}
                      {invite.negotiation?.status === 'counter_offered' && invite.negotiation?.counterOffer ? (
                        /* Counter-Offer Display */
                        <>
                          <div className="mb-8 border border-purple-200 bg-purple-50/30 rounded-lg p-4">
                            <span className="text-xs font-medium text-purple-600 mb-1 block">Counter-Offer from AI</span>
                            <div className="text-2xl font-bold text-purple-900 mb-2">
                              {invite.negotiation.counterOffer.rate?.toLocaleString('en-IN') || '0'} INR
                            </div>
                            <p className="text-xs text-purple-700 leading-tight">
                              {invite.negotiation.counterOffer.message || 'This is our final offer for this collaboration.'}
                            </p>
                          </div>

                          {/* Price Details with Counter-Offer */}
                          <div className="mb-8">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Price Details</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Original rate</span>
                                <span className="font-medium text-gray-400 line-through">{invite.proposedRate?.toLocaleString('en-IN') || '0'} INR</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Your demand</span>
                                <span className="font-medium text-gray-900">{invite.negotiation.creatorProposedRate?.toLocaleString('en-IN') || '0'} INR</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-700 font-semibold">AI Counter-Offer</span>
                                <span className="font-bold text-purple-900">{invite.negotiation.counterOffer.rate?.toLocaleString('en-IN') || '0'} INR</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">AI talent manager costs</span>
                                <span className="font-medium text-gray-900">
                                  <span className="font-bold">2.12 INR</span>
                                  <span className="text-gray-400 line-through ml-1 text-xs">3.53 INR</span>
                                </span>
                              </div>
                              <div className="flex justify-between p-3 mt-3 bg-purple-50 border border-purple-100 rounded-lg text-base">
                                <span className="text-gray-900 font-bold">Your earnings</span>
                                <span className="font-bold text-purple-700">{((invite.negotiation.counterOffer.rate || 0) * 0.95).toLocaleString('en-IN')} INR</span>
                              </div>
                            </div>
                          </div>

                          {/* NEGOTIATION STATUS */}
                          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                            <h4 className="font-bold text-purple-900 mb-2">Negotiation Status</h4>
                            <div className="text-sm space-y-1">
                              <p className="text-purple-800">
                                <span className="font-semibold">Your demand:</span> ₹{invite.negotiation.creatorProposedRate?.toLocaleString('en-IN')}
                              </p>
                              <p className="text-purple-700">
                                <span className="font-semibold">AI Response:</span> 💬 Counter-Offer: ₹{invite.negotiation.counterOffer.rate?.toLocaleString('en-IN')}
                              </p>
                              {invite.negotiation.aiAnalysis?.reasoning && (
                                <p className="text-purple-600 text-xs italic mt-2">
                                  {Array.isArray(invite.negotiation.aiAnalysis.reasoning) 
                                    ? invite.negotiation.aiAnalysis.reasoning.join('. ') 
                                    : invite.negotiation.aiAnalysis.reasoning}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ACTION BUTTONS - Only Accept/Reject for Counter-Offer */}
                          <div className="space-y-3 mb-8">
                            <button
                              onClick={() => handleAcceptCounterOffer(invite._id, invite.negotiation.counterOffer.rate)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-5 h-5" />
                              I'm interested - Accept ₹{invite.negotiation.counterOffer.rate?.toLocaleString('en-IN')}
                            </button>

                            <button
                              onClick={() => handleRejectInvite(invite._id)}
                              className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 font-medium py-2 text-sm rounded-lg transition-colors"
                            >
                              I'm not interested
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Original Invitation Display (No Counter-Offer) */
                        <>
                          <div className="mb-8 border border-blue-200 bg-blue-50/30 rounded-lg p-4">
                            <span className="text-xs font-medium text-gray-500 mb-1 block">{formatPlacementName(placementType)}</span>
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                              {invite.proposedRate?.toLocaleString('en-IN') || '0'} INR
                            </div>
                            <p className="text-xs text-gray-500 leading-tight">
                              A short {invite.target_platform} content created to exclusively promote a brand
                            </p>
                          </div>

                          {/* Price Details */}
                          <div className="mb-8">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Price Details</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Sera AI guideline rate</span>
                                <span className="font-medium text-gray-900">{invite.proposedRate?.toLocaleString('en-IN') || '0'} INR</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">AI talent manager costs</span>
                                <span className="font-medium text-gray-900">
                                  <span className="font-bold">2.12 INR</span>
                                  <span className="text-gray-400 line-through ml-1 text-xs">3.53 INR</span>
                                </span>
                              </div>
                              <div className="flex justify-between p-3 mt-3 bg-blue-50 border border-blue-100 rounded-lg text-base">
                                <span className="text-gray-900 font-bold">Your earnings</span>
                                <span className="font-bold text-blue-700">{((invite.proposedRate || 0) * 0.95).toLocaleString('en-IN')} INR</span>
                              </div>
                            </div>
                          </div>

                          {/* NEGOTIATION STATUS (if exists but not counter-offered) */}
                          {invite.negotiation && invite.negotiation.rounds && invite.negotiation.rounds.length > 0 && (
                            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                              <h4 className="font-bold text-purple-900 mb-2">Negotiation Status</h4>
                              {invite.negotiation.rounds.map((round, idx) => (
                                <div key={idx} className="text-sm space-y-1">
                                  <p className="text-purple-800">
                                    <span className="font-semibold">Your demand:</span> ₹{round.creator_demand?.amount}
                                  </p>
                                  {round.ai_response && (
                                    <p className="text-purple-700">
                                      <span className="font-semibold">AI Response:</span> {round.ai_response.decision === 'accept' ? '✅ Accepted' : round.ai_response.decision === 'counter' ? `💬 Counter: ₹${round.ai_response.counter_offer}` : '❌ Rejected'}
                                    </p>
                                  )}
                                  {round.ai_response?.reasoning && (
                                    <p className="text-purple-600 text-xs italic">{round.ai_response.reasoning}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* ACTION BUTTONS */}
                          {!isPendingApproval && !isRejected && !isActive && !isCompleted ? (
                            <div className="space-y-3 mb-8">
                              <button
                                onClick={() => handleAcceptInvite(invite._id)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                              >
                                I'm interested
                              </button>

                              <button
                                onClick={() => handleOpenNegotiation(invite._id, invite.proposedRate)}
                                className="w-full bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                              >
                                Set my own rate
                                <DollarSign className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleRejectInvite(invite._id)}
                                className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 font-medium py-2 text-sm rounded-lg transition-colors"
                              >
                                Not interested
                              </button>
                            </div>
                          ) : isPendingApproval ? (
                            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Clock className="w-6 h-6 text-yellow-600" />
                              </div>
                              <h4 className="font-bold text-yellow-800">Brand Approval Pending</h4>
                              <p className="text-xs text-yellow-700 mt-1">Waiting for brand to confirm</p>
                            </div>
                          ) : isRejected ? (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <X className="w-6 h-6 text-red-600" />
                              </div>
                              <h4 className="font-bold text-red-800">Application Rejected</h4>
                              <p className="text-xs text-red-700 mt-1">The brand has declined this application.</p>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  )}



                  {/* Timeline Container - Extracted to Sidebar */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                      TIMELINE
                    </h4>
                    <div className="space-y-0 relative">
                      {/* Vertical Line */}
                      <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                      <div className="flex items-start gap-4 relative">
                        <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5 flex-shrink-0 ring-4 ring-white relative z-10"></div>
                        <div className="pb-6">
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Script Draft Due</p>
                          <p className="text-sm font-bold text-gray-900">3 days after deal established</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative">
                        <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5 flex-shrink-0 ring-4 ring-white relative z-10"></div>
                        <div className="pb-6">
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Video Draft Due</p>
                          <p className="text-sm font-bold text-gray-900">6 days after deal established</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative">
                        <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5 flex-shrink-0 ring-4 ring-white relative z-10"></div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Final Link Due</p>
                          <p className="text-sm font-bold text-gray-900">10 days after deal established</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Partnership Authorization - Moved Inside Sidebar */}
                  <div
                    onClick={() => setShowCertModal(true)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Shield className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Partnership Authorization</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-[10px] text-gray-500 font-medium">Verified & Sealed</span>
                        </div>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  };

  // Render Invites Page
  const renderInvitesPage = () => {
    if (loadingInvites) {
      return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Brand Invites</h1>
          <Card className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </Card>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaborations 🤝</h1>
            <p className="text-gray-600">Your active brand collaborations and new invitations appear here.</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveInvitesTab('invites')}
              className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${activeInvitesTab === 'invites'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Invites
            </button>
            <button
              onClick={() => setActiveInvitesTab('active')}
              className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${activeInvitesTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Active Collabs
            </button>
            <button
              onClick={() => setActiveInvitesTab('completed')}
              className={`pb-3 px-1 border-b-2 font-semibold text-sm transition-colors ${activeInvitesTab === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Completed
            </button>
          </div>

          {/* Content Section */}
          {activeInvitesTab === 'invites' ? (
            /* Brand Invitations Section */
            invitations.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invites Yet</h3>
                  <p className="text-gray-600">
                    When brands invite you to collaborate, they'll appear here.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {invitations.map((invite) => {
                  const showDetails = expandedInviteId === invite._id;
                  const creatorHandle = profiles.find(p => p.platform === invite.target_platform)?.handle || 'your_handle';

                  // Format placement type
                  const formatPlacementName = (type) => {
                    const names = {
                      reel: 'Reels',
                      staticPost: 'Post',
                      carousel: 'Carousel',
                      story: 'Story',
                      dedicatedVideo: 'Dedicated Video',
                      integratedVideo: 'Integrated Video',
                      shorts: 'Shorts',
                      communityPost: 'Community Post'
                    };
                    return names[type] || type;
                  };

                  const placementType = invite.selected_placement?.type || invite.campaign?.contentType || 'Post';
                  const deliverables = invite.selected_placement?.deliverables || 1;
                  const isAccepted = invite.status === 'creator_accepted';

                  return (
                    <div key={invite._id}>
                      {!showDetails ? (
                        // Compact Invitation Card - Redesigned to match Reference
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-5 cursor-pointer max-w-sm" onClick={() => {
                          setExpandedInviteId(invite._id);
                          setActiveDetailTab('deal-info');
                        }}>
                          <div className="flex items-start gap-4">
                            {/* Brand Logo/Icon */}
                            <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                              {invite.campaign?.extendedDetails?.businessLogo || invite.brand?.logo ? (
                                <img src={invite.campaign?.extendedDetails?.businessLogo || invite.brand?.logo} alt="" className="w-8 h-8 object-contain" />
                              ) : (
                                <span className="text-lg font-bold text-gray-900">{(invite.campaign?.extendedDetails?.businessName || invite.brand?.name || 'B').charAt(0)}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Card Title */}
                              <h3 className="font-bold text-gray-900 leading-snug mb-3">
                                {invite.campaign?.extendedDetails?.businessName || invite.brand?.name || 'Brand'} x {creatorHandle}
                              </h3>

                              {/* Badges Stack */}
                              <div className="space-y-2">
                                {/* Brand Name Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                                  <Briefcase className="w-3.5 h-3.5" />
                                  {invite.campaign?.extendedDetails?.businessName || invite.brand?.name || 'Brand Name'}
                                </div>

                                {/* Website Badge */}
                                {(invite.campaign?.extendedDetails?.website || invite.brand?.website) && (
                                  <div className="flex">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 max-w-full truncate">
                                      <Globe2 className="w-3.5 h-3.5" />
                                      <span className="truncate max-w-[150px]">{(invite.campaign?.extendedDetails?.website || invite.brand?.website).replace(/^https?:\/\//, '')}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Content Type Badge */}
                                <div className="flex">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                                    {placementType.toLowerCase().includes('video') || placementType.toLowerCase().includes('reel') ? (
                                      <TrendingUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <BarChart3 className="w-3.5 h-3.5" />
                                    )}
                                    {formatPlacementName(placementType)}
                                  </div>
                                </div>

                                {/* Handle Badge */}
                                <div className="flex">
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                                    {invite.target_platform === 'instagram' && <Instagram className="w-3.5 h-3.5 text-pink-600" />}
                                    {invite.target_platform === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-600" />}
                                    @{creatorHandle}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedInviteId(invite._id); }}
                              className="flex-1 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                            >
                              View Details
                            </button>
                            {/* Check for counter-offer first */}
                            {invite.negotiation?.status === 'counter_offered' && invite.negotiation?.counterOffer ? (
                              <div className="flex-1 flex flex-col gap-2">
                                <div className="text-xs font-bold text-purple-700 text-center">
                                  Counter-Offer: ₹{invite.negotiation.counterOffer.rate?.toLocaleString('en-IN')}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      handleAcceptCounterOffer(invite._id, invite.negotiation.counterOffer.rate); 
                                    }}
                                    className="flex-1 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                  >
                                    I'm interested
                                  </button>
                                  <button
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      handleRejectCounterOffer(invite._id); 
                                    }}
                                    className="flex-1 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                  >
                                    Not Interested
                                  </button>
                                </div>
                              </div>
                            ) : !isAccepted ? (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAcceptInvite(invite._id); }}
                                  className="flex-1 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRejectInvite(invite._id); }}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                  title="Decline"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <div className="flex-1 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg border border-yellow-200 text-center flex items-center justify-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                Brand Approval Pending
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Detailed View Modal (reusing the existing modal structure)
                        renderDetailedModal(invite)
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            activeInvitesTab === 'active' ? (
              /* Active Collaborations Section */
              loadingActive ? (
                <Card className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                </Card>
              ) : activeCollaborations.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Collaborations</h3>
                    <p className="text-gray-600">
                      Once you accept an invite, your active collaborations will appear here.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {activeCollaborations.map((collab) => {
                    const showDetails = expandedInviteId === collab._id;
                    return (
                      <div key={collab._id}>
                        {!showDetails ? (
                          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-5 cursor-pointer max-w-sm" onClick={() => {
                            setExpandedInviteId(collab._id);
                            setActiveDetailTab('deal-info');
                          }}>
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                {collab.campaign?.extendedDetails?.businessLogo ? (
                                  <img src={collab.campaign?.extendedDetails?.businessLogo} alt="" className="w-8 h-8 object-contain" />
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">{(collab.campaign?.extendedDetails?.businessName || 'B').charAt(0)}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 leading-snug mb-3 text-sm line-clamp-2">
                                  {collab.campaign?.extendedDetails?.businessName || 'Brand'} x {profiles.find(p => p.platform === collab.target_platform)?.handle || 'You'}
                                </h3>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-100 w-full justify-center">
                                  <Sparkles className="w-3 h-3 mr-1" /> Active Collaboration
                                </Badge>
                              </div>
                            </div>
                            <Button
                              className="w-full bg-blue-600 text-white hover:bg-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedInviteId(collab._id);
                                setActiveDetailTab('deal-info');
                              }}
                            >
                              View Campaign Manager
                            </Button>
                          </div>
                        ) : (
                          renderDetailedModal(collab)
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Completed Collaborations Section */
              activeInvitesTab === 'completed' && (
                loadingActive ? (
                  <Card className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  </Card>
                ) : completedCollaborations.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Collaborations</h3>
                      <p className="text-gray-600">
                        Campaigns you have finished or that were closed will appear here.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {completedCollaborations.map((collab) => {
                      const showDetails = expandedInviteId === collab._id;
                      return (
                        <div key={collab._id}>
                          {!showDetails ? (
                            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-5 cursor-pointer max-w-sm grayscale-[0.1]" onClick={() => {
                              setExpandedInviteId(collab._id);
                              setActiveDetailTab('deal-info');
                            }}>
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-gray-400">
                                  {collab.campaign?.extendedDetails?.businessLogo ? (
                                    <img src={collab.campaign?.extendedDetails?.businessLogo} alt="" className="w-8 h-8 object-contain opacity-70" />
                                  ) : (
                                    <span className="text-lg font-bold">{(collab.campaign?.extendedDetails?.businessName || 'B').charAt(0)}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 leading-snug mb-3 text-sm line-clamp-2">
                                    {collab.campaign?.extendedDetails?.businessName || 'Brand'} x {profiles.find(p => p.platform === collab.target_platform)?.handle || 'You'}
                                  </h3>
                                  {/* Dynamic Status Logic: Trust Data */}
                                  {(() => {
                                    const hasFinalLink = collab.content?.finalLink && typeof collab.content.finalLink === 'string' && collab.content.finalLink.length > 10;
                                    const isSuccessful = ['completed', 'paid', 'published', 'final_link_submitted'].includes(collab.status) || hasFinalLink;
                                    const isRejected = ['rejected', 'brand_rejected', 'withdrawn'].includes(collab.status);

                                    if (isSuccessful) {
                                      // Show appropriate success badge based on status
                                      let label = 'Completed';
                                      if (collab.status === 'paid') label = 'Paid';
                                      else if (collab.status === 'published') label = 'Published';
                                      else if (collab.status === 'final_link_submitted') label = 'Link Submitted';
                                      
                                      return (
                                        <Badge className="bg-green-50 text-green-700 border-green-100 w-full justify-center">
                                          <CheckCircle className="w-3 h-3 mr-1" /> {label}
                                        </Badge>
                                      );
                                    } else if (isRejected) {
                                      // Show appropriate rejection badge
                                      let label = 'Rejected';
                                      if (collab.status === 'brand_rejected') label = 'Brand Rejected';
                                      else if (collab.status === 'withdrawn') label = 'Withdrawn';
                                      
                                      return (
                                        <Badge className="bg-red-50 text-red-700 border-red-100 w-full justify-center">
                                          <XCircle className="w-3 h-3 mr-1" /> {label}
                                        </Badge>
                                      );
                                    } else {
                                      // Fallback for any other status
                                      return (
                                        <Badge className="bg-gray-50 text-gray-700 border-gray-100 w-full justify-center">
                                          {collab.status}
                                        </Badge>
                                      );
                                    }
                                  })()}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedInviteId(collab._id);
                                  setActiveDetailTab('deal-info');
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          ) : (
                            renderDetailedModal(collab)
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )
            )
          )}


        </div >

        {/* Success Modal (Congratulations) */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
              {/* Confetti or Decoration would go here */}

              <div className="mx-auto mb-6 w-24 h-24 bg-green-100 rounded-full flex items-center justify-center relative">
                <DollarSign className="w-12 h-12 text-green-600" />
                <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center -mr-2 -mt-2 animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Congratulations!</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You've successfully submitted the final link. We will deliver the payment to you in 7 days.
              </p>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-semibold shadow-lg shadow-blue-200"
                onClick={() => {
                  setShowSuccessModal(false);
                  // Optionally navigate or refresh
                  fetchActiveCollaborations();
                }}
              >
                Complete deal
              </Button>
            </div>
          </div>
        )}

        {/* Onboarding Training Modal */}
        {
          showOnboardingModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-space">
              <div className="bg-white rounded-2xl w-full max-w-5xl h-[650px] flex overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Left Sidebar - Steps */}
                <div className="w-72 bg-gray-50 p-6 border-r border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold font-space text-gray-900 mb-2">Onboarding Training</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 mb-6">Paid sponsorship</Badge>

                    <p className="text-xs text-gray-500 mb-8 leading-relaxed">
                      Learn Sera Creator essentials to ensure a successful collaboration and get paid for your work
                    </p>

                    <div className="space-y-6">
                      {[
                        { id: 1, label: 'Delivery timeline', color: 'bg-indigo-600' },
                        { id: 2, label: 'CTA requirements', color: 'bg-blue-600' },
                        { id: 3, label: 'Platform policy', color: 'bg-indigo-600' },
                        { id: 4, label: 'Payment', color: 'bg-blue-600' }
                      ].map((step) => (
                        <div
                          key={step.id}
                          onClick={() => setOnboardingStep(step.id)}
                          className={`flex items-center gap-3 cursor-pointer transition-colors ${onboardingStep === step.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${onboardingStep === step.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {step.id}
                          </div>
                          <span className={`text-sm font-semibold ${onboardingStep === step.id ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">Tips</h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          Timely submission not only ensures smooth collaboration but also increases your chances for future collaborations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 p-10 overflow-y-auto relative bg-white">
                  <button
                    onClick={() => setShowOnboardingModal(false)}
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>

                  {onboardingStep === 1 && (
                    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <h2 className="text-3xl font-bold font-space text-gray-900 mb-2">Delivery timeline</h2>
                      <p className="text-gray-500 mb-8">Understand the collaboration delivery timeline to ensure a successful collaboration on Sera Creator</p>

                      <div className="flex gap-3 mb-12">
                        {['YouTube', 'TikTok', 'Instagram', 'LinkedIn', 'X (Twitter)'].map(p => (
                          <div key={p} className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 flex items-center gap-2">
                            {p === 'YouTube' && <Youtube className="w-4 h-4 text-red-600" />}
                            {p === 'Instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                            {p.includes('X') && <span className="text-black font-bold text-xs">𝕏</span>}
                            {p}
                          </div>
                        ))}
                      </div>

                      <div className="bg-gray-50 rounded-xl p-8 mb-10 border border-gray-100">
                        {/* Timeline Visual */}
                        <div className="relative pt-8 pb-12">
                          <div className="h-0.5 bg-gray-200 absolute left-0 right-0 top-1/2 -translate-y-1/2 z-0"></div>
                          <div className="relative z-10 flex justify-between">
                            <div className="text-center">
                              <div className="border border-red-500 bg-white text-red-600 px-4 py-1.5 rounded-full text-xs font-bold inline-block mb-3 shadow-sm">Show interest</div>
                              <div className="w-4 h-4 bg-red-500 rounded-full mx-auto ring-4 ring-white"></div>
                            </div>

                            <div className="text-center">
                              <div className="text-orange-400 text-xs font-medium mb-3">Brand confirmation</div>
                              <div className="w-2 h-2 bg-orange-300 rounded-full mx-auto mb-1"></div>
                              <div className="h-4 w-0.5 bg-orange-200 mx-auto"></div>
                              <div className="mt-2 text-xs font-bold text-red-500">10 days after confirmation</div>
                              <div className="text-[10px] text-gray-500">1st draft due</div>
                            </div>

                            <div className="text-center">
                              <div className="text-orange-400 text-xs font-medium mb-3">Brand content review</div>
                              <div className="w-2 h-2 bg-orange-300 rounded-full mx-auto mb-1"></div>
                              <div className="h-4 w-0.5 bg-orange-200 mx-auto"></div>
                              <div className="mt-2 text-xs font-bold text-red-500">5 days after review</div>
                              <div className="text-[10px] text-gray-500">2nd-5th draft video due</div>
                            </div>

                            <div className="text-center">
                              <div className="text-orange-400 text-xs font-medium mb-3">Brand content approval</div>
                              <div className="w-2 h-2 bg-orange-300 rounded-full mx-auto mb-1"></div>
                              <div className="h-4 w-0.5 bg-orange-200 mx-auto"></div>
                              <div className="mt-2 text-xs font-bold text-red-500">2 days after approval</div>
                              <div className="text-[10px] text-gray-500">Final link due</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <h4 className="font-bold text-gray-900 text-base">Notes:</h4>
                        <ul className="list-disc ml-5 space-y-3">
                          <li>To ensure your creative work is properly compensated, <strong className="text-gray-900">please do not start production</strong> until the collaboration is confirmed by the brand</li>
                          <li>For YouTube videos, you can choose to submit a script or not before submitting video content.</li>
                          <li>The brand may request up to 4 times revision. For each revision you have 5 days to submit your revised content.</li>
                          <li>Any specific <strong className="text-gray-900">requirements from the brand</strong> are shown in the "Requirement" section. Please make sure to review them before producing content</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {onboardingStep === 2 && (
                    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <h2 className="text-3xl font-bold font-serif text-gray-900 mb-2">CTA requirements</h2>
                      <p className="text-gray-500 mb-8">Achieving high conversion rates enhances your collaboration opportunities on Sera Creator.</p>

                      <div className="flex gap-8">
                        <div className="w-1/2 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center justify-center">
                          {/* Mock Phone UI */}
                          <div className="w-56 bg-white rounded-[32px] overflow-hidden shadow-xl border-4 border-gray-800 relative aspect-[9/19]">
                            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 z-20 flex justify-center">
                              <div className="w-20 h-4 bg-black rounded-b-xl"></div>
                            </div>
                            {/* Screen Content */}
                            <div className="w-full h-full bg-gray-100 relative pt-8 pb-12 flex flex-col">
                              <div className="flex-1 bg-gray-200 flex items-center justify-center text-gray-400">Video Content</div>

                              {/* Overlay Elements */}
                              <div className="absolute bottom-20 left-4 right-4 z-10">
                                <div className="text-xs font-bold text-white shadow-sm mb-1">Check link in bio for more info</div>
                                <div className="bg-white/90 backdrop-blur rounded p-1.5 inline-block text-[8px] font-mono mb-2">
                                  Link in bio
                                </div>
                                <div className="h-1.5 w-32 bg-gray-300/50 rounded mb-1"></div>
                                <div className="h-1.5 w-24 bg-gray-300/50 rounded"></div>
                              </div>

                              {/* UI Controls */}
                              <div className="absolute right-2 bottom-24 flex flex-col gap-3">
                                <div className="w-8 h-8 bg-gray-800/20 rounded-full"></div>
                                <div className="w-8 h-8 bg-gray-800/20 rounded-full"></div>
                                <div className="w-8 h-8 bg-gray-800/20 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="w-1/2 space-y-6">
                          <h4 className="font-bold text-gray-900">Notes:</h4>
                          <ul className="space-y-4 text-sm text-gray-600">
                            <li>
                              <strong className="text-gray-900 block mb-1">• Ending CTA:</strong>
                              If you are posting a Reel, clearly state, "Check the link in bio!" depending on the features available.
                            </li>
                            <li>
                              <strong className="text-gray-900 block mb-1">• Caption:</strong>
                              Use a concise and engaging caption with a strong call-to-action. E.g., : "Check the link in bio now! 🌟"
                            </li>
                            <li>
                              <strong className="text-gray-900 block mb-1">• Link in bio:</strong>
                              The link should be placed at the top of bio. If you're using Linktree, position your promotional link directly above Linktree or add it as the first link within Linktree to ensure it's easily accessible.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {onboardingStep === 3 && (
                    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <h2 className="text-3xl font-bold font-serif text-gray-900 mb-6">Platform policy</h2>
                      <div className="space-y-6 text-gray-600">
                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                          <h3 className="text-orange-800 font-bold mb-3 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> Late submission policy
                          </h3>
                          <ul className="list-disc ml-5 space-y-2 text-sm text-orange-700">
                            <li>Small orders (&lt;200 USD): 15% deduction</li>
                            <li>Medium orders (200-1000 USD): 10% deduction</li>
                            <li>Large orders (&gt;1000 USD): 5% deduction</li>
                          </ul>
                        </div>
                        <p>We value smooth collaboration and want to help you secure more brand opportunities. To keep things fair, late submissions may lead to a small deduction based on order size.</p>
                        <p>This way, the impact stays moderate and balanced, while encouraging timely delivery so you can shine in future collaborations.</p>
                      </div>
                    </div>
                  )}

                  {onboardingStep === 4 && (
                    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <h2 className="text-3xl font-bold font-serif text-gray-900 mb-6">Payment</h2>
                      <div className="bg-green-50 p-8 rounded-2xl border border-green-100 text-center mb-8">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <CreditCard className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-800 mb-2">100% Secured Payment</h3>
                        <p className="text-green-700 max-w-md mx-auto">
                          Your payment is secured once the brand confirms your interest.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 font-bold">01</div>
                          <div>
                            <h4 className="font-bold text-gray-900">Deal Confirmation</h4>
                            <p className="text-sm text-gray-500">Brand accepts your application and funds are locked in escrow.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 font-bold">02</div>
                          <div>
                            <h4 className="font-bold text-gray-900">Content Approval</h4>
                            <p className="text-sm text-gray-500">You submit content, revisions are made, and final content is approved.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 font-bold">03</div>
                          <div>
                            <h4 className="font-bold text-gray-900">Payment Release</h4>
                            <p className="text-sm text-gray-500">Funds are released to your wallet 10 days after final submission.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-12 pt-6 border-t border-gray-100 flex justify-end gap-3">
                    {onboardingStep > 1 && (
                      <Button variant="outline" onClick={() => setOnboardingStep(s => s - 1)}>
                        Back
                      </Button>
                    )}
                    {onboardingStep < 4 ? (
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setOnboardingStep(s => s + 1)}>
                        Next
                      </Button>
                    ) : (
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowOnboardingModal(false)}>
                        Finish Training
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Partnership Certificate Modal */}
        {
          showCertModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl max-w-md w-full p-8 relative shadow-2xl animate-in zoom-in-95"
                style={{ backgroundImage: 'radial-gradient(circle at top right, #fefce8 0%, #ffffff 40%)' }}>
                <button
                  onClick={() => setShowCertModal(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-yellow-50/50">
                    <CheckCircle className="w-10 h-10 text-yellow-500" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-1">Partnership Authorized</h3>
                  <p className="text-sm text-gray-500">Official Verification Certificate</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Brand Identity</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      {invite.brand?.name} <CheckCircle className="w-3 h-3 text-blue-500" />
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Campaign Budget</span>
                    <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">Secured in Escrow</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Authorization Date</span>
                    <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Platform</span>
                    <span className="font-bold text-blue-600">Sera AI Verified</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-4">
                    This certificate confirms that Sera AI has verified the brand's identity and secured the campaign funds.
                  </p>
                  <Button onClick={() => setShowCertModal(false)} className="w-full bg-gray-900 hover:bg-black text-white">
                    Close Certificate
                  </Button>
                </div>
              </div>
            </div>
          )
        }

      </>
    );
  };

  // Render Payments Page
  const renderPaymentsPage = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</h3>
          <p className="text-gray-600">
            Your earnings and payment history will appear here.
          </p>
        </div>
      </Card>
    </div>
  );

  if (loading || (expandedInviteId && (loadingInvites || loadingActive))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="/logo-name-top.png"
                alt="Sera AI"
                className="h-8 w-auto"
              />
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveNav('home')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeNav === 'home'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Home className="w-4 h-4 inline mr-2" />
                Home
              </button>
              <button
                onClick={() => setActiveNav('invites')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeNav === 'invites'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Invites
              </button>
              <button
                onClick={() => setActiveNav('payments')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeNav === 'payments'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Payments
              </button>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                <Bell className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Creator</div>
                      <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveSettingsTab('account');
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        Account
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveSettingsTab('profile');
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Sparkles className="w-4 h-4 text-gray-400" />
                        Creator Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveSettingsTab('ratings');
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Star className="w-4 h-4 text-gray-400" />
                        Ratings
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveSettingsTab('security');
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Shield className="w-4 h-4 text-gray-400" />
                        Security
                      </button>
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={onLogout}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto px-6 lg:px-12 py-8">
        {!activeSettingsTab && activeNav === 'home' && renderHomePage()}
        {!activeSettingsTab && activeNav === 'invites' && renderInvitesPage()}
        {!activeSettingsTab && activeNav === 'payments' && renderPaymentsPage()}
        {activeSettingsTab && (
          <CreatorSettingsPage
            activeTab={activeSettingsTab}
            setActiveTab={setActiveSettingsTab}
            user={user}
            creatorProfile={creatorProfile}
            onUpdate={fetchCreatorProfile}
            connectedProfiles={profiles.map(p => ({ platform: p.platform, handle: p.handle }))}
            onDisconnect={handleDisconnectProfile}
          />
        )}
      </main>

      {/* Connect Socials Modal */}
      <ConnectSocialsModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onAnalyze={handleAnalyze}
        analyzing={analyzing}
        connectedPlatforms={getConnectedPlatforms()}
      />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Submit {submissionType === 'script' ? 'Script' : submissionType === 'video' ? 'Video Draft' : 'Final Link'}
              </h3>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {submissionType === 'script' ? 'Paste your script or provide a link' :
                    submissionType === 'video' ? 'Video URL (Drive/YouTube/Vimeo)' : 'Post URL'}
                </label>

                {submissionType === 'script' ? (
                  <div className="space-y-3">
                    <textarea
                      className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Title: My Awesome Video&#10;Hook: ..."
                      value={scriptText}
                      onChange={(e) => setScriptText(e.target.value)}
                    ></textarea>

                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Link to document (Google Doc, Notion, etc.)"
                        value={scriptLink}
                        onChange={(e) => setScriptLink(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={submissionType === 'video' ? "https://drive.google.com/..." : "https://instagram.com/reel/..."}
                        value={submissionType === 'video' ? videoLink : finalLink}
                        onChange={(e) => submissionType === 'video' ? setVideoLink(e.target.value) : setFinalLink(e.target.value)}
                      />
                    </div>
                    {submissionType === 'video' && (
                      <p className="text-xs text-gray-500 ml-1">
                        *Please ensure link sharing is turned on for "Anyone with the link"
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="flex-1 py-3 px-4 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Find current application/invite
                      const invite = invitations.find(i => i._id === expandedInviteId) || activeCollaborations.find(i => i._id === expandedInviteId);
                      if (invite) {
                        const campaignId = typeof invite.campaignId === 'object' ? invite.campaignId._id : invite.campaignId;

                        if (submissionType === 'script') {

                          if (!scriptText && !scriptLink) {
                            toast.error('Please provide script text or a link');
                            return;
                          }

                          await axios.post(`/api/campaign-collaboration/${campaignId}/collaboration/${expandedInviteId}/script/submit`, {
                            text: scriptText,
                            fileUrl: scriptLink,
                            type: 'manual'
                          });
                        } else if (submissionType === 'video') {
                          if (!videoLink) {
                            toast.error('Please provide a video link');
                            return;
                          }
                          await axios.post(`/api/campaign-collaboration/${campaignId}/collaboration/${expandedInviteId}/video/submit`, {
                            videoLink: videoLink,
                            version: (invite.content?.video?.drafts?.length || 0) + 1
                          }); // FIXED: Removed extra bracket here? No, matched closing.
                        } else if (submissionType === 'publish') {
                        } else if (submissionType === 'publish') {
                          const finalLink = document.querySelector('input[placeholder*="instagram"]')?.value;
                          if (!finalLink) {
                            toast.error('Please provide the published post link');
                            return;
                          }
                          await axios.post(`/api/campaign-collaboration/${campaignId}/collaboration/${expandedInviteId}/final/submit`, {
                            finalLink: finalLink
                          });
                        }

                        // Success
                        setShowSubmissionModal(false);
                        setApprovalStatus('pending'); // Set to pending logic
                        toast.success('Submitted! Waiting for brand approval.');

                        // Update local state (optimistic)
                        // Update local state (optimistic)
                        const updateApp = (prev) => prev.map(app => {
                          if (app._id === expandedInviteId) {
                            return { ...app, content: { ...app.content, script: { ...app.content?.script, status: 'submitted' } } };
                          }
                          return app;
                        });

                        setInvitations(updateApp);
                        setActiveCollaborations(updateApp);
                      }
                    } catch (error) {
                      console.error('Submission error:', error);
                      toast.error('Failed to submit. Please try again.');
                    }
                  }}
                  className="flex-1 py-3 px-4 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit {submissionType === 'script' ? 'Script' : 'Work'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation Modal (YOUR FEATURE) */}
      {showNegotiationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Negotiate Rate</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposed Rate (₹)
                </label>
                <input
                  type="number"
                  value={negotiationRate}
                  onChange={(e) => setNegotiationRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your rate"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justification (Optional)
                </label>
                <textarea
                  value={negotiationJustification}
                  onChange={(e) => setNegotiationJustification(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Explain why you deserve this rate..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseNegotiation}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submittingNegotiation}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNegotiation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={submittingNegotiation}
              >
                {submittingNegotiation ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreatorDashboard;

