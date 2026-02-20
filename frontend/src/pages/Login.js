import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { getAuthUrl } from '../config/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);
      const userData = response.data.user;
      onLogin(userData);
      
      // For brand users, check if profile is completed
      if (userData.role === 'brand') {
        try {
          const profileResponse = await axios.get('/api/brand/profile-status');
          if (!profileResponse.data.profileCompleted) {
            navigate('/brand/onboarding');
            return;
          }
        } catch (err) {
          // If we can't check, redirect to onboarding to be safe
          navigate('/brand/onboarding');
          return;
        }
      }
      
      // For creator users, check if onboarding is completed
      if (userData.role === 'creator') {
        try {
          const onboardingResponse = await axios.get('/api/creator/onboarding-status');
          if (!onboardingResponse.data.onboardingCompleted) {
            navigate('/creator/onboarding');
            return;
          }
        } catch (err) {
          // If we can't check, redirect to onboarding to be safe
          navigate('/creator/onboarding');
          return;
        }
      }
      
      navigate(userData.role === 'creator' ? '/creator' : '/brand');
    } catch (error) {
      const errorData = error.response?.data?.error;
      let errorMessage = 'Login failed';
      
      if (errorData) {
        if (errorData.code === 'EMAIL_NOT_VERIFIED') {
          errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.';
        } else if (errorData.code === 'OAUTH_ONLY_USER') {
          errorMessage = 'This account uses Google sign-in. Please sign in with Google.';
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      // For login, user type defaults to 'creator' but existing users will keep their role
      const authUrl = getAuthUrl('GOOGLE_OAUTH');
      const stateParam = encodeURIComponent(JSON.stringify({ userType: 'creator' }));
      const urlWithUserType = `${authUrl}?state=${stateParam}`;
      window.location.href = urlWithUserType;
    } catch (error) {
      setError('Failed to initiate Google authentication');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <div className="space-y-4">
          <GoogleAuthButton
            onClick={handleGoogleAuth}
            isLoading={isGoogleLoading}
            text="Sign in with Google"
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
              <Link to="/signup" className="text-blue-600 hover:text-blue-500">
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;