const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  accessToken: {
    type: String,
    required: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: true,
    index: true
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    browser: String,
    os: String,
    device: String
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days default
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for cleanup of expired sessions
sessionSchema.index({ expiresAt: 1, isActive: 1 });

// Index for finding user's active sessions
sessionSchema.index({ userId: 1, isActive: 1, expiresAt: 1 });

// Method to check if session is valid
sessionSchema.methods.isValid = function() {
  return this.isActive && this.expiresAt > new Date();
};

// Method to update last activity
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Method to invalidate session
sessionSchema.methods.invalidate = function() {
  this.isActive = false;
  return this.save();
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    { 
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ]
    },
    { 
      $set: { isActive: false } 
    }
  );
  return result;
};

// Static method to get user's active sessions
sessionSchema.statics.getUserActiveSessions = function(userId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ lastActivity: -1 });
};

// Static method to invalidate all user sessions (for logout all devices)
sessionSchema.statics.invalidateAllUserSessions = function(userId) {
  return this.updateMany(
    { userId },
    { $set: { isActive: false } }
  );
};

// Static method to find session by token
sessionSchema.statics.findByAccessToken = function(accessToken) {
  return this.findOne({
    accessToken,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
};

sessionSchema.statics.findByRefreshToken = function(refreshToken) {
  return this.findOne({
    refreshToken,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
};

module.exports = mongoose.model('Session', sessionSchema);
