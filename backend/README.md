# Sera Ai Backend - Node.js API

A Node.js backend API built with Express and MongoDB for the Sera Ai creator-brand matching platform.

## Features

- **Enhanced Authentication**: 
  - Email verification required for new users
  - Google OAuth integration
  - Password reset via email
  - JWT-based sessions with refresh tokens
- **Security**: Comprehensive security middleware including rate limiting, input validation, and XSS protection
- **Email System**: Automated verification and welcome emails
- **Health Monitoring**: Health check endpoints for system monitoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens, email verification, Google OAuth
- **Email**: Nodemailer with Gmail SMTP
- **Validation**: Joi for request validation
- **Security**: Helmet, CORS, Rate limiting, MongoDB sanitization

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   - Create a `.env` file with the following variables:
     ```env
     NODE_ENV=development
     PORT=8000
     MONGO_URL=mongodb://localhost:27017
     DB_NAME=sera_ai_db
     JWT_SECRET=your_jwt_secret_key
     JWT_ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=43200
     REFRESH_TOKEN_EXPIRE_DAYS=90
     FRONTEND_URL=http://localhost:3000
     CORS_ORIGINS=http://localhost:3000
     GEMINI_API_KEY=your_gemini_api_key
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_app_password
     CLOUDINARY_URL=your_cloudinary_url
     ```
   - Ensure MongoDB is running locally or update `MONGO_URL`

3. **Start development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/google/verify` - Verify Google token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/update-password` - Update password
- `GET /api/auth/sessions` - Get active sessions
- `DELETE /api/auth/sessions/:sessionId` - Revoke session
- `POST /api/auth/logout-all` - Logout from all devices

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## Environment Variables

```env
NODE_ENV=development
PORT=8000
MONGO_URL=mongodb://localhost:27017
DB_NAME=sera_ai_db
CORS_ORIGINS=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
REFRESH_TOKEN_EXPIRE_DAYS=90
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_URL=your_cloudinary_url
```

## Development

- Uses `nodemon` for auto-restart during development
- Run `npm run dev` for development mode
- Run `npm test` for tests (when implemented)

## Security Features

- Password hashing with bcrypt
- JWT token authentication with refresh tokens
- Request rate limiting
- CORS protection
- Security headers with Helmet
- Input validation and sanitization with Joi
- MongoDB injection prevention
- XSS protection
- SQL injection protection

## Project Structure

```
backend/
├── config/           # Configuration files
├── middleware/       # Express middleware (auth, error handling, security, validation)
├── migrations/       # Database migrations
├── models/           # Mongoose models (User, Session)
├── routes/           # API route handlers (auth, health)
├── utils/            # Utility functions (JWT, logger, email, etc.)
├── server.js         # Main server file
└── package.json      # Dependencies and scripts
```
