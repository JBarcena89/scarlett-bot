import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true, enum: ['user', 'bot'] },
  content: { type: String, required: true },
  platform: { type: String, required: true, enum: ['web', 'telegram', 'facebook', 'whatsapp'] },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
