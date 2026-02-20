import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import BrandNavbar from '../components/BrandNavbar';
import {
  Save, Edit, User, Building2, Bell, CreditCard, Shield,
  Lock, MapPin, Calendar, Briefcase, ArrowLeft, Upload
} from 'lucide-react';

// Brand Account Settings Component
const BrandAccountSettings = ({ user, brandData, onUpdate, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brandData) {
      setFormData(prev => ({
        ...prev,
        name: brandData.contactInfo?.name || user?.name || '',
        location: brandData.contactInfo?.address?.country || ''
      }));
    }
  }, [brandData, user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/auth/update-profile', {
        name: formData.name,
        location: formData.location
      });
      
      toast.success('Profile updated successfully');
      onUpdate();
      if (onUserUpdate) onUserUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
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

// Brand Security Settings Component
const BrandSecuritySettings = ({ user }) => {
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

// Workspace Settings Component
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateWorkspace} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Website
              </label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>

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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
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
            </div>

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

const BillingSettings = () => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Billing & Payments</h3>
      <p className="text-gray-600">Manage your billing and payment methods</p>
    </div>
    <Card>
      <CardContent className="py-12 text-center text-gray-500">
        Billing settings coming soon
      </CardContent>
    </Card>
  </div>
);

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

// Main Settings Page Component
const BrandSettings = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandData();
  }, []);

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

  const updateUser = async () => {
    try {
      const userResponse = await axios.get('/api/auth/me');
      if (userResponse.data.success) {
        return userResponse.data.user;
      }
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  };

  const settingsTabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandNavbar user={user} onLogout={onLogout} />

      <div className="p-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/brand')}
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'account' && (
                    <BrandAccountSettings user={user} brandData={brandData} onUpdate={fetchBrandData} onUserUpdate={updateUser} />
                  )}
                  {activeTab === 'workspace' && <WorkspaceSettings user={user} brandData={brandData} onUpdate={fetchBrandData} />}
                  {activeTab === 'security' && <BrandSecuritySettings user={user} />}
                  {activeTab === 'billing' && <BillingSettings />}
                  {activeTab === 'notifications' && <NotificationSettings user={user} onUpdate={fetchBrandData} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSettings;
