import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    unique: true,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} no es un email válido!`
    }
  },
  telegramId: { type: String, unique: true, sparse: true },
  whatsappId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true,
  autoIndex: process.env.NODE_ENV !== 'production'
});

// Índice compuesto para búsquedas eficientes
userSchema.index({ email: 1, lastActive: -1 });

const User = mongoose.model('User', userSchema);

export default User;
