const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  telegramId: String, // Para distinguir usuarios en Telegram
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
