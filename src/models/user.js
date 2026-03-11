const mongoose = require('mongoose');
const crypto = require('crypto');

const generateApiKey = () => {
  return 'esc-' + crypto.randomBytes(16).toString('hex');
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    default: generateApiKey
  },
  allowedIPs: [{
    type: String
  }],
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to find user by email
userSchema.statics.findUserByEmail = function(email) {
  return this.findOne({ email });
};

// Static method to find user by ID
userSchema.statics.findById = function(id) {
  return this.findOne({ _id: id });
};

module.exports = mongoose.model('User', userSchema);