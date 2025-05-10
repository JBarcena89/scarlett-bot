import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  userId: String,
  button: String,
  source: String, // webchat, telegram, facebook
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Click", clickSchema);
