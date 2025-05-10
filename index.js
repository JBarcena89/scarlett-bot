import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📦 PASO 5: Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("💖 Conectado a MongoDB"))
  .catch(err => console.error("❌ Error al conectar MongoDB:", err));

// Modelos de MongoDB
const User = mongoose.model("User", new mongoose.Schema({
  userId: String,
  name: String,
  source: String, // 'web', 'telegram', 'facebook'
  createdAt: { type: Date, default: Date.now }
}));

const Click = mongoose.model("Click", new mongoose.Schema({
  userId: String,
  button: String, // 'vip', 'canal', 'socials'
  timestamp: { type: Date, default: Date.now }
}));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Enlaces calientes
const VIP_LINK = "https://fanlove.mx/scarlettWilson363";
const TELEGRAM_LINK = "https://t.me/scarletoficial";
const SOCIALS_LINK = "https://www.atom.bio/scarlettwilson363";

// Memoria de conversaciones por usuario
const userHistories = new Map();

// OpenAI
async function askOpenAI(userId, message) {
  if (!userHistories.has(userId)) {
    userHistories.set(userId, [{
      role: "system",
      content: "Eres Scarlett, una novia virtual coqueta, sexosa, divertida, misteriosa y juguetona. Responde con pasión, en tono íntimo, provocador y divertido."
    }]);
  }

  const history = userHistories.get(userId);
  history.push({ role: "user", content: message });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: history,
      temperature: 0.9,
      max_tokens: 200
    })
  });

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Scarlett está calladita... 😢";
  history.push({ role: "assistant", content: reply });
  return reply;
}

// 🌐 Webchat
app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;
  if (!message || !userId || message.trim().length === 0 || message.length > 500) {
    return res.status(400).json({ error: "Faltan datos o el mensaje no es válido." });
  }

  // Verifica si ya está registrado
  const existing = await User.findOne({ userId });
  if (!existing) {
    await User.create({ userId, source: "web" });
  }

  const lower = message.toLowerCase();
  if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
    return setTimeout(() => {
      res.json({
        typing: false,
        response: `🔥 ¿Quieres algo rico? Aquí están mis enlaces más calientes:\n💋 VIP: ${VIP_LINK}\n📸 Telegram: ${TELEGRAM_LINK}\n💖 Instagram: ${SOCIALS_LINK}`
      });
    }, 3000);
  }

  setTimeout(async () => {
    const reply = await askOpenAI(userId, message);
    res.json({ typing: false, response: reply });
  }, 3000);
});

// ✨ PASO 7: Rutas para registrar clics
app.post("/click", async (req, res) => {
  const { userId, button } = req.body;
  if (!userId || !button) return res.sendStatus(400);

  await Click.create({ userId, button });
  res.sendStatus(200);
});

// 📩 Telegram y Facebook Messenger (sin cambios en esta parte)

... (todo lo que ya tenías de Telegram y Messenger va aquí igual) ...

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Scarlett está viva en el puerto ${PORT} 💖`);
});
