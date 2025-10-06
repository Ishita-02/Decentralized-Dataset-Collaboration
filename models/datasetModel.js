const mongoose = require('mongoose');

// Dataset Schema
const DatasetSchema = new mongoose.Schema({
    // Basic Dataset Information
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    
    // Uploader and Ownership
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Dataset Characteristics
    dataType: {
      type: String,
      enum: ['structured', 'unstructured', 'time_series', 'image', 'text', 'other'],
      required: true
    },
    fileFormat: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    
    // Verification Status
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      timestamp: Date
    }],
    
    // Pricing and Access
    price: {
      type: Number,
      required: true,
      min: 0
    },
    // verificationReward: {
    //   type: Number,
    //   required: true,
    //   min: 0
    // },
    
    // Blockchain and Storage
    dataHash: {
      type: String,
      required: true,
      unique: true
    },
    storageLocation: {
      type: String,
      required: true
    },
    
    // Purchase Tracking
    purchasedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    tags: [String],
    category: String,
    
    downloadCount: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  }, {
    timestamps: true
  });

  const Dataset = mongoose.model('Dataset', DatasetSchema);

  module.exports = {Dataset}

