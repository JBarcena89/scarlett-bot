// models/Conversation.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: { type: String, required: true }, // "user" o "assistant"
  content: { type: String, required: true },
});

const ConversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [MessageSchema],
});

export default mongoose.model("Conversation", ConversationSchema);
