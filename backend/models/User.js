const mongoose = require('mongoose');
const passwordManager = require('../utils/password');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    default: null
  },
  passwordHash: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required for Google OAuth users
    }
  },
  role: {
    type: String,
    required: true,
    enum: ['creator', 'brand', 'admin']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  location: {
    type: String,
    default: null
  },
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  // Google OAuth fields
  googleId: {
    type: String,
    default: null
  },
  profilePicture: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v) || /^data:image\/.+;base64,.+/.test(v);
      },
      message: 'Profile picture must be a valid HTTP/HTTPS URL or base64 data URL'
    }
  },
  // Password reset fields
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (this.passwordHash && this.passwordHash.match(/^\$2[aby]\$\d+\$/)) {
      return next();
    }
    
    // Hash the password
    this.passwordHash = await passwordManager.hashPassword(this.passwordHash);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return passwordManager.verifyPassword(password, this.passwordHash);
};

// Add refresh token
userSchema.methods.addRefreshToken = function(token, expiresAt) {
  this.refreshTokens.push({
    token,
    expiresAt
  });
  return this.save();
};

// Remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function() {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > now);
  return this.save();
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token;
};

// Verify email
userSchema.methods.verifyEmail = function() {
  this.isEmailVerified = true;
  // Keep the token for a while to handle duplicate clicks gracefully
  // We'll extend expiration to 1 hour from now instead of clearing immediately
  this.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  return this.save();
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.refreshTokens;
  delete user.__v;
  return user;
};

// Index for performance (email index is already created by unique: true)
userSchema.index({ 'refreshTokens.token': 1 });
userSchema.index({ 'refreshTokens.expiresAt': 1 });

module.exports = mongoose.model('User', userSchema);