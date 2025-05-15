const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  buttonName: { type: String, required: true }, // 'vip', 'canal', 'redes'
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Click", clickSchema);
