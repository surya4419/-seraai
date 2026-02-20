const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME
});

const User = require('../models/User');

async function migrateUsers() {
  console.log('🔄 Starting user migration for email verification...');

  try {
    // Update all existing users to have verified emails
    // This is a one-time migration for existing users
    const result = await User.updateMany(
      { isEmailVerified: { $exists: false } },
      { 
        $set: { 
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          passwordResetToken: null,
          passwordResetExpires: null,
          googleId: null,
          profilePicture: null
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} existing users`);
    console.log('📧 Existing users now have verified email status');
    console.log('🔐 New users will require email verification');

    // Show current user stats
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const unverifiedUsers = await User.countDocuments({ isEmailVerified: false });

    console.log('\n📊 User Statistics:');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Verified users: ${verifiedUsers}`);
    console.log(`Unverified users: ${unverifiedUsers}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateUsers();