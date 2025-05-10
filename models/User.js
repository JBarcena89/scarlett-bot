const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  source: String, // 'webchat', 'telegram', 'facebook'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
