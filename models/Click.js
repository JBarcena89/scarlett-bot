const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
  userId: String,
  type: String, // 'vip', 'canal', 'socials'
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Click', ClickSchema);
