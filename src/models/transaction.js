const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    apiKeyUsed: String,
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    paymentProvider: {
        type: String,
        enum: ['stripe', 'paystack', 'kora'],
        required: true
    },
    paymentRef: String,
    status: {
        type: String,
        enum: ['pending', 'held', 'delivered', 'released', 'disputed', 'refunded', 'failed', 'timed_out'],
        default: 'pending'
    },
    buyerEmail: String,
    sellerEmail: String,
    description: String,
    deliveryProof: {
        type: String
    },
    evidence: [{
        party: { type: String, enum: ['buyer', 'seller'], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    timeoutDays: {
        type: Number,
        default: 7
    },
    deliveredAt: Date,
    releasedAt: Date,
    disputedAt: Date,
}, { timestamps: true });

// Add indexes for faster queries
transactionSchema.index({ status: 1, creator: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);