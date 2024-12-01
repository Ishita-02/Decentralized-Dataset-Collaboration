const mongoose = require('mongoose');
  
  // Transaction Schema
  const TransactionSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dataset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionType: {
      type: String,
      enum: ['dataset_purchase', 'verification_reward', 'token_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    blockchainTransactionHash: String
  }, {
    timestamps: true
  });

  const Transaction = mongoose.model('Transaction', TransactionSchema);

    module.exports = {Transaction}

