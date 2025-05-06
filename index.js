import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const VIP_LINK = "https://onlyfans.com/scarlettvip";
const TELEGRAM_LINK = "https://t.me/scarletoficial";
const SOCIALS_LINK = "https://instagram.com/scarlettvirtual";

// OpenAI
async function askOpenAI(message) {
  const prompt = `
Eres Scarlett, una novia virtual coqueta, sexosa, divertida, a veces celosa y misteriosa. Responde como si tuvieras una relación apasionada y caliente con el usuario, usando un tono íntimo. Nunca envíes links a menos que te pidan específicamente una foto. 
Usuario: ${message}
Scarlett:`;

  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 150,
      temperature: 0.9
    })
  });

  const data = await response.json();
  return data.choices[0].text.trim();
}

// Web App route
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensaje vacío' });

  const lower = message.toLowerCase();
  if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
    return res.json({
      response: `¿Quieres ver algo rico, amor? 😘 Aquí tienes mis enlaces más calientes:
🔥 VIP: ${VIP_LINK}
💋 Telegram: ${TELEGRAM_LINK}
📸 Instagram: ${SOCIALS_LINK}`
    });
  }

  try {
    const reply = await askOpenAI(message);
    res.json({ response: reply });
  } catch (err) {
    res.status(500).json({ error: "Error al responder con Scarlett" });
  }
});

// Telegram Bot
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (TELEGRAM_TOKEN) {
  const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage) return;

    const lower = userMessage.toLowerCase();
    if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
      return bot.sendMessage(chatId, `🔥 Aquí tienes mis enlaces más calientes, amor:
💋 VIP: ${VIP_LINK}
📸 Telegram: ${TELEGRAM_LINK}
💖 Instagram: ${SOCIALS_LINK}`);
    }

    try {
      const reply = await askOpenAI(userMessage);
      bot.sendMessage(chatId, reply);
    } catch (e) {
      bot.sendMessage(chatId, "Ups... no puedo responder ahora bebé 😢");
    }
  });
} else {
  console.error("TELEGRAM_BOT_TOKEN no definido en .env");
}

app.listen(PORT, () => {
  console.log(`Scarlett está viva en el puerto ${PORT} 💖`);
});
