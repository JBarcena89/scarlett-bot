const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  userId: String,
  button: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Click", clickSchema);
