import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { useSettings } from '../contexts/SettingsContext';
import {
  X, Save, Edit, User, Building2, Bell, CreditCard, Shield,
  Mail, Lock, Trash2, AlertTriangle, Globe, Phone, MapPin,
  Clock, Calendar, Upload, Download, Search, FileText, Briefcase
} from 'lucide-react';

// Brand Account Settings Component
const BrandAccountSettings = ({ user, brandData, onUpdate, onUserUpdate }) => {
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(user?.profilePicture || null);
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    location: ''
  });

  // Update form data when brandData changes
  useEffect(() => {
    if (brandData) {
      setFormData(prev => ({
        ...prev,
        name: brandData.contactName || brandData.name || user?.name || '',
        location: brandData.contactInfo?.address?.country || ''
      }));
    }
  }, [brandData, user]);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Update form data when brandData changes
  useEffect(() => {
    if (brandData) {
      setFormData(prev => ({
        ...prev,
        name: brandData.contactInfo?.name || user?.name || '',
        location: brandData.contactInfo?.address?.country || ''
      }));
    }
  }, [brandData, user]);

  // Update profile image when user data changes
  useEffect(() => {
    setProfileImage(user?.profilePicture || null);
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      // Check for HEIC files and inform user about conversion
      if (file.name.toLowerCase().includes('.heic') || file.name.toLowerCase().includes('.heif')) {
        toast.info('HEIC image detected - converting to JPEG for web compatibility');
      }
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const uploadData = new FormData();
      uploadData.append('profileImage', file);
      
      try {
        const response = await axios.post('/api/brand/update-profile-image', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.success) {
          // Update the local state with the image from server response
          if (response.data.profilePicture) {
            setProfileImage(response.data.profilePicture);
          }
          toast.success('Profile image updated successfully');
          onUpdate();
          // Also refresh user data to get the updated profile picture
          if (onUserUpdate) {
            const updatedUser = await onUserUpdate();
            if (updatedUser && updatedUser.profilePicture) {
              setProfileImage(updatedUser.profilePicture);
            }
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.error?.message || 'Failed to upload image');
        setProfileImage(user?.profilePicture || null); // Revert on error
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update user profile (name, email, etc.)
      await axios.put('/api/auth/update-profile', {
        name: formData.name,
        email: formData.email,
        timezone: formData.timezone,
        location: formData.location
      });
      
      toast.success('Profile updated successfully');
      onUpdate();
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
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Account</h3>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {/* Profile Section */}
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country / Region</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Your location"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
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
              <span className="font-medium">Brand</span>
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
  );
};

// Brand Security Settings Component (Password Management)
const BrandSecuritySettings = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Security</h3>
        <p className="text-gray-600">Manage your password and security settings</p>
      </div>

      {/* Password Settings */}
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
              <p className="text-sm text-gray-600">
                Keep your account secure with a strong password
              </p>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
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
                  setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


// Workspace Settings Component (renamed from Brand Profile)
const WorkspaceSettings = ({ user, brandData, onUpdate }) => {
  const fileInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    organizationName: brandData?.name || '',
    website: brandData?.website || '',
    industry: brandData?.industry || 'other',
    monthlyBudget: brandData?.monthlyBudget || '',
    phone: brandData?.contactInfo?.phone || '',
    country: brandData?.contactInfo?.address?.country || '',
    contactInfo: brandData?.description || ''
  });
  const [loading, setLoading] = useState(false);

  // Update logo preview and form data when brandData changes
  useEffect(() => {
    if (brandData) {
      setLogoPreview(brandData.logoUrl || null);
      setFormData({
        organizationName: brandData.name || '',
        website: brandData.website || '',
        industry: brandData.industry || 'other',
        monthlyBudget: brandData.monthlyBudget || '',
        phone: brandData.contactInfo?.phone || '',
        country: brandData.contactInfo?.address?.country || '',
        contactInfo: brandData.description || ''
      });
    }
  }, [brandData]);

  const budgetOptions = [
    { value: 'under_5k', label: 'Under $5,000' },
    { value: '5k_15k', label: '$5,000 - $15,000' },
    { value: '15k_50k', label: '$15,000 - $50,000' },
    { value: '50k_100k', label: '$50,000 - $100,000' },
    { value: 'over_100k', label: 'Over $100,000' }
  ];

  const industryOptions = [
    { value: 'fashion', label: 'Fashion & Beauty' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'fitness', label: 'Health & Fitness' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'travel', label: 'Travel & Tourism' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'technology', label: 'Technology' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ];

  const countryOptions = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'India', 'Japan', 'Brazil', 'Mexico', 'Spain', 'Italy',
    'Netherlands', 'Singapore', 'United Arab Emirates', 'Other'
  ];

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Logo must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('organizationName', formData.organizationName);
      submitData.append('website', formData.website);
      submitData.append('industry', formData.industry);
      submitData.append('monthlyBudget', formData.monthlyBudget);
      submitData.append('country', formData.country);
      submitData.append('phone', formData.phone);
      submitData.append('contactInfo', formData.contactInfo);
      
      if (logoPreview && logoPreview !== brandData?.logoUrl) {
        // Convert base64 to file if it's a new upload
        const response = await fetch(logoPreview);
        const blob = await response.blob();
        submitData.append('logo', blob, 'logo.png');
      }

      await axios.put('/api/brand/workspace-settings', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Workspace settings updated successfully');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Workspace</h2>
        <p className="text-gray-600">Manage your organization details and settings</p>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateWorkspace} className="space-y-4">
            {/* Logo and Name */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Logo
                </Button>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <Input
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="Your organization name"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourcompany.com"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Industry and Budget */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {industryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget</label>
                <select
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select budget range</option>
                  {budgetOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone and Country */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select country</option>
                    {countryOptions.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Contact Info
              </label>
              <Input
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder="LinkedIn / WhatsApp / Slack"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Workspace Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};


// Billing & Payments Settings Component
const BillingSettings = ({ user, brandData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('billing');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [billingHistory] = useState([]);
  const [depositHistory] = useState([]);

  const billingInfo = {
    email: user?.email || 'Not set',
    companyProfile: brandData?.name ? `${brandData.name} - ${brandData.contactInfo?.address?.country || 'N/A'}` : 'Not set'
  };

  const availableFunds = {
    amount: 0,
    currency: 'USD'
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Billing & Payments</h2>
        <p className="text-gray-600">Manage your billing information and payment history</p>
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Billing Information</CardTitle>
          <Button variant="link" className="text-blue-600 p-0 h-auto">Edit</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Billing email</span>
              <span className="text-gray-900">{billingInfo.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Company billing profile</span>
              <span className="text-gray-900">{billingInfo.companyProfile}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Funds */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
            <circle cx="80" cy="20" r="40" fill="currentColor" />
            <circle cx="60" cy="60" r="30" fill="currentColor" />
          </svg>
        </div>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Available Funds</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{availableFunds.amount}</span>
                <span className="text-gray-500">{availableFunds.currency}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                All major credit and debit cards are supported. For alternative payment methods or for bank transfers, please contact{' '}
                <a href="mailto:support@sera-ai.com" className="text-blue-600 hover:underline">support@sera-ai.com</a>
              </p>
              <a href="#" className="text-sm text-orange-500 hover:underline mt-2 inline-block">
                Limited time offer: Deposit funds now and get extra ad credits
              </a>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
              Deposit funds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Set up payment method */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Set up payment method</span>
            <Button 
              variant="outline"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
            >
              Set up
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Tabs */}
      <Card>
        <CardContent className="pt-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('billing')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'billing'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Billing history
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'deposit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Deposit history
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Start date"
                />
              </div>
              <span className="text-gray-400">—</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="End date"
              />
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Influencer name"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download details
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Total amount</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Campaign name</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Influencer name</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Payment status</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'billing' ? billingHistory : depositHistory).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">No data</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (activeTab === 'billing' ? billingHistory : depositHistory).map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-2 text-sm">{item.date}</td>
                      <td className="py-3 px-2 text-sm">{item.amount}</td>
                      <td className="py-3 px-2 text-sm font-mono text-xs">{item.orderId}</td>
                      <td className="py-3 px-2 text-sm">{item.campaignName}</td>
                      <td className="py-3 px-2 text-sm">{item.influencerName}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-700' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


// Notification Settings Component
const NotificationSettings = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    campaignUpdates: true,
    creatorApplications: true,
    performanceReports: true,
    paymentNotifications: true,
    marketingEmails: false
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      await axios.put('/api/auth/brand-notification-settings', settings);
      toast.success('Notification settings updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Notifications</h2>
        <p className="text-gray-600">Choose what notifications you want to receive</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries({
            emailNotifications: { label: 'Email Notifications', desc: 'Receive notifications via email' },
            campaignUpdates: { label: 'Campaign Updates', desc: 'Updates on your active campaigns and milestones' },
            creatorApplications: { label: 'Creator Applications', desc: 'Get notified when creators apply to your campaigns' },
            performanceReports: { label: 'Performance Reports', desc: 'Weekly and monthly campaign performance reports' },
            paymentNotifications: { label: 'Payment Notifications', desc: 'Notifications about payments and billing' },
            marketingEmails: { label: 'Marketing Emails', desc: 'Tips, updates, and promotional content' }
          }).map(([key, { label, desc }]) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}

          <Button onClick={handleUpdateSettings} disabled={loading} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Privacy & Security Settings Component
const PrivacySecuritySettings = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    dataSharing: false,
    analytics: true,
    thirdPartyIntegrations: true,
    campaignVisibility: 'verified-creators'
  });
  const [loading, setLoading] = useState(false);

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      await axios.put('/api/auth/brand-privacy-settings', settings);
      toast.success('Privacy settings updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to delete your brand account? This action cannot be undone. Type "DELETE" to confirm:'
    );
    
    if (confirmation !== 'DELETE') {
      return;
    }

    try {
      await axios.delete('/api/auth/delete-brand-account');
      toast.success('Account deleted successfully');
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Privacy & Security</h2>
        <p className="text-gray-600">Control your privacy and data sharing preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="public">Public - Visible to everyone</option>
              <option value="private">Private - Only visible to you</option>
              <option value="creators">Creators Only - Visible to verified creators</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Visibility
            </label>
            <select
              value={settings.campaignVisibility}
              onChange={(e) => setSettings({ ...settings, campaignVisibility: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="public">Public - Anyone can see and apply</option>
              <option value="verified-creators">Verified Creators Only</option>
              <option value="invited-only">Invitation Only</option>
            </select>
          </div>

          {['dataSharing', 'analytics', 'thirdPartyIntegrations'].map((key) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">
                  {key === 'dataSharing' ? 'Data Sharing' : 
                   key === 'analytics' ? 'Analytics Tracking' : 'Third-party Integrations'}
                </p>
                <p className="text-sm text-gray-500">
                  {key === 'dataSharing' ? 'Share anonymized data to improve our services' :
                   key === 'analytics' ? 'Allow us to track usage for better experience' :
                   'Allow connections to external services'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}

          <Button onClick={handleUpdateSettings} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Delete Account</h4>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data including campaigns, analytics, and billing history. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


// Main Global Settings Modal Component
const GlobalSettingsModal = ({ user, onUserUpdate }) => {
  const { showSettings, activeSettingsTab, setActiveSettingsTab, closeSettings } = useSettings();
  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showSettings) {
      fetchBrandData();
    }
  }, [showSettings]);

  const fetchBrandData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/brand/profile-status');
      if (response.data.brand) {
        setBrandData(response.data.brand);
      }
    } catch (error) {
      console.error('Failed to fetch brand data:', error);
    } finally {
      setLoading(false);
    }
  };



  if (!showSettings) return null;

  const settingsTabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeSettings();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Settings Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <button
              onClick={closeSettings}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <nav className="space-y-1">
            {settingsTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSettingsTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  activeSettingsTab === id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-full">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {activeSettingsTab === 'account' && (
                  <BrandAccountSettings user={user} brandData={brandData} onUpdate={fetchBrandData} onUserUpdate={onUserUpdate} />
                )}
                {activeSettingsTab === 'workspace' && (
                  <WorkspaceSettings user={user} brandData={brandData} onUpdate={fetchBrandData} />
                )}
                {activeSettingsTab === 'security' && (
                  <BrandSecuritySettings user={user} onUpdate={fetchBrandData} />
                )}
                {activeSettingsTab === 'billing' && (
                  <BillingSettings user={user} brandData={brandData} onUpdate={fetchBrandData} />
                )}
                {activeSettingsTab === 'notifications' && (
                  <NotificationSettings user={user} onUpdate={fetchBrandData} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettingsModal;
