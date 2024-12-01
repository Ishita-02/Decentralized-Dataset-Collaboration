const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    
    // User Roles
    role: {
      type: String,
      enum: ['uploader', 'verifier', 'end_user', 'admin'],
      default: 'end_user'
    },
    
    // Blockchain-related Fields
    walletAddress: {
      type: String,
      unique: true,
      sparse: true
    },
    
    // Profile and Reputation
    profilePicture: {
      type: String,
      default: null
    },
    reputation: {
      type: Number,
      default: 0
    },
    
    // Verification and Authentication
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Tracks and Metrics
    datasetsUploaded: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset'
    }],
    datasetsPurchased: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset'
    }],
    verificationsDone: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset'
    }],
    
    // Earnings and Tokens
    totalEarnings: {
      type: Number,
      default: 0
    },
    tokenBalance: {
      type: Number,
      default: 0
    }
  }, {
    timestamps: true
  });
  
  // Create and export models
  const User = mongoose.model('User', UserSchema);
  
  module.exports = {
    User
  };
