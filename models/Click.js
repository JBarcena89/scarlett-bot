// models/Click.js
const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
  userId: String,
  button: String, // 'vip', 'canal', 'socials'
  source: String, // 'webchat', 'telegram', etc.
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Click', ClickSchema);
