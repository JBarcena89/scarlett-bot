import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  telegramId: { type: String, unique: true, sparse: true },
  whatsappId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
}, {
  // Deshabilitar el índice automático de _id si no es necesario
  autoIndex: false
});

// Eliminar índices problemáticos
userSchema.index({ userId: 1 }, { unique: false });

const User = mongoose.model("User", userSchema);
export default User;
