const { OAuth2Client } = require('google-auth-library');
const logger = require('./logger');

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
  }

  // Generate Google OAuth URL
  getAuthUrl(state = null) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrlOptions = {
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    };

    // Include state parameter if provided
    if (state) {
      authUrlOptions.state = state;
    }

    return this.client.generateAuthUrl(authUrlOptions);
  }

  // Verify Google OAuth token and get user info
  async verifyToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      logger.error('Google token verification failed', { error: error.message });
      throw new Error('Invalid Google token');
    }
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code) {
    try {
      const { tokens } = await this.client.getToken(code);
      this.client.setCredentials(tokens);

      // Get user info using the access token
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
      );
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userInfo = await userInfoResponse.json();
      
      return {
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        emailVerified: userInfo.verified_email,
        tokens
      };
    } catch (error) {
      logger.error('Google code exchange failed', { error: error.message });
      throw new Error('Failed to exchange Google authorization code');
    }
  }

  // Refresh Google access token
  async refreshAccessToken(refreshToken) {
    try {
      this.client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.client.refreshAccessToken();
      return credentials;
    } catch (error) {
      logger.error('Google token refresh failed', { error: error.message });
      throw new Error('Failed to refresh Google access token');
    }
  }
}

module.exports = new GoogleAuthService();