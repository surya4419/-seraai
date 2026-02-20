// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/api/auth/signup',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      ME: '/api/auth/me',
      VERIFY_EMAIL: '/api/auth/verify-email',
      RESEND_VERIFICATION: '/api/auth/resend-verification',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      GOOGLE_OAUTH: '/api/auth/google',
      GOOGLE_CALLBACK: '/api/auth/google/callback',
      GOOGLE_VERIFY: '/api/auth/google/verify'
    }
  }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth URLs
export const getAuthUrl = (type) => {
  return getApiUrl(API_CONFIG.ENDPOINTS.AUTH[type.toUpperCase()]);
};

export default API_CONFIG;