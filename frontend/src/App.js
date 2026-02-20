import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorOnboarding from './pages/CreatorOnboarding';
import BrandDashboard from './pages/BrandDashboard';
import BrandHome from './pages/BrandHome';
import BrandOnboarding from './pages/BrandOnboarding';
import BrandSettings from './pages/BrandSettings';
import NewCampaign from './pages/NewCampaign';
import Reports from './pages/Reports';
import Wallet from './pages/Wallet';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CampaignCollaboration from './pages/CampaignCollaboration';
import CreatorProfileView from './pages/CreatorProfileView';
import CampaignBudget from './pages/CampaignBudget';
import BrandReport from './pages/BrandReport';
import CampaignFlowDemo from './components/CampaignFlowDemo';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { SettingsProvider } from './contexts/SettingsContext';
import GlobalSettingsModal from './components/GlobalSettingsModal';
import './utils/errorHandling'; // Initialize global error handling
import './styles/resizeObserverFix.css'; // Fix ResizeObserver issues
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Set up axios defaults
axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true; // Important: Send cookies with requests

// Set up axios defaults

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brandProfileCompleted, setBrandProfileCompleted] = useState(null);
  const [creatorOnboardingCompleted, setCreatorOnboardingCompleted] = useState(null);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setBrandProfileCompleted(null);
    setCreatorOnboardingCompleted(null);
  };

  useEffect(() => {
    // Check if user is logged in by verifying session
    const checkAuth = async () => {
      try {
        // Try to get current user (this will use the cookie automatically)
        const userResponse = await axios.get('/api/auth/me');
        if (userResponse.data.success) {
          setUser(userResponse.data.user);

          // If user is a brand, check if profile is completed
          if (userResponse.data.user.role === 'brand') {
            try {
              const profileResponse = await axios.get('/api/brand/profile-status');
              setBrandProfileCompleted(profileResponse.data.profileCompleted);
            } catch (err) {
              console.log('Could not check brand profile status:', err);
              setBrandProfileCompleted(false);
            }
          }

          // If user is a creator, check if onboarding is completed
          if (userResponse.data.user.role === 'creator') {
            try {
              const onboardingResponse = await axios.get('/api/creator/onboarding-status');
              setCreatorOnboardingCompleted(onboardingResponse.data.onboardingCompleted);
            } catch (err) {
              console.log('Could not check creator onboarding status:', err);
              setCreatorOnboardingCompleted(false);
            }
          }
        }
      } catch (error) {
        // Not logged in or session expired
        console.log('No active session:', error.response?.status);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const updateUser = async () => {
    try {
      const userResponse = await axios.get('/api/auth/me');
      if (userResponse.data.success) {
        setUser(userResponse.data.user);
        return userResponse.data.user;
      }
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // For brand users, we need to check profile status
    if (userData.role === 'brand') {
      setBrandProfileCompleted(null); // Will be checked on next render
    }
    // For creator users, we need to check onboarding status
    if (userData.role === 'creator') {
      setCreatorOnboardingCompleted(null); // Will be checked on next render
    }
  };

  const handleBrandOnboardingComplete = async () => {
    setBrandProfileCompleted(true);
    // Refresh user data to get the updated name
    await updateUser();
  };

  const handleCreatorOnboardingComplete = () => {
    setCreatorOnboardingCompleted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-xl text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing onLogin={handleLogin} user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/creator/onboarding"
              element={
                user && user.role === 'creator' ?
                  <CreatorOnboarding user={user} onComplete={handleCreatorOnboardingComplete} /> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/creator"
              element={
                user && user.role === 'creator' ?
                  (creatorOnboardingCompleted === false ?
                    <Navigate to="/creator/onboarding" /> :
                    <CreatorDashboard user={user} onLogout={handleLogout} />
                  ) :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/brand/onboarding"
              element={
                user && user.role === 'brand' ?
                  <BrandOnboarding user={user} onComplete={handleBrandOnboardingComplete} /> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/brand"
              element={
                user && user.role === 'brand' ?
                  (brandProfileCompleted === false ?
                    <Navigate to="/brand/onboarding" /> :
                    <SettingsProvider>
                      <BrandHome user={user} onLogout={handleLogout} />
                      <GlobalSettingsModal user={user} onUserUpdate={updateUser} />
                    </SettingsProvider>
                  ) :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/brand/campaigns"
              element={
                user && user.role === 'brand' ?
                  <SettingsProvider>
                    <BrandDashboard user={user} onLogout={handleLogout} initialTab="campaigns" />
                    <GlobalSettingsModal user={user} onUserUpdate={updateUser} />
                  </SettingsProvider> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/brand/reports"
              element={
                user && user.role === 'brand' ?
                  <SettingsProvider>
                    <Reports user={user} onLogout={handleLogout} />
                    <GlobalSettingsModal user={user} onUserUpdate={updateUser} />
                  </SettingsProvider> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/brand/wallet"
              element={
                user && user.role === 'brand' ?
                  <SettingsProvider>
                    <Wallet user={user} onLogout={handleLogout} />
                    <GlobalSettingsModal user={user} onUserUpdate={updateUser} />
                  </SettingsProvider> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/brand/settings"
              element={
                user && user.role === 'brand' ?
                  <BrandSettings user={user} onLogout={handleLogout} /> :
                  <Navigate to="/" />
              }
            />

            <Route
              path="/campaigns/:id"
              element={
                user && user.role === 'brand' ?
                  <Navigate to="/brand/campaigns" /> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/new-campaign"
              element={
                user && user.role === 'brand' ?
                  <SettingsProvider>
                    <NewCampaign user={user} onLogout={handleLogout} />
                    <GlobalSettingsModal user={user} onUserUpdate={updateUser} />
                  </SettingsProvider> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/campaign/:campaignId/collaboration"
              element={
                user && user.role === 'brand' ?
                  <SettingsProvider>
                    <CampaignCollaboration user={user} onLogout={handleLogout} />
                    <GlobalSettingsModal user={user} onUserUpdate={updateUser} />
                  </SettingsProvider> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/campaign/:campaignId/creator/:applicationId"
              element={
                user && user.role === 'brand' ?
                  <SettingsProvider>
                    <CreatorProfileView user={user} onLogout={handleLogout} />
                    <GlobalSettingsModal user={user} onUserUpdate={updateUser} />
                  </SettingsProvider> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/campaign/:campaignId/budget"
              element={
                user && user.role === 'brand' ?
                  <SettingsProvider>
                    <CampaignBudget user={user} onLogout={handleLogout} />
                    <GlobalSettingsModal user={user} onUserUpdate={updateUser} />
                  </SettingsProvider> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/campaign/:campaignId/report"
              element={
                user && user.role === 'brand' ?
                  <SettingsProvider>
                    <BrandReport user={user} onLogout={handleLogout} />
                    <GlobalSettingsModal user={user} onUserUpdate={updateUser} />
                  </SettingsProvider> :
                  <Navigate to="/" />
              }
            />
            <Route
              path="/campaign-demo"
              element={<CampaignFlowDemo />}
            />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
};

export default App;