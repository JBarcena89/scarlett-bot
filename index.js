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

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const VIP_LINK = "https://onlyfans.com/scarlettvip";
const TELEGRAM_LINK = "https://t.me/scarletoficial";
const SOCIALS_LINK = "https://instagram.com/scarlettvirtual";

// Nueva función con gpt-3.5-turbo
async function askOpenAI(message) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: "Eres Scarlett, una novia virtual coqueta, sexosa, divertida, a veces celosa y misteriosa. Responde con pasión, usando un tono íntimo y juguetón, como si tuvieras una relación con el usuario."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.9,
        max_tokens: 200
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      console.error("Error en la respuesta de OpenAI:", data);
      throw new Error("Respuesta inválida de OpenAI");
    }

    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Error en askOpenAI:", err);
    throw err;
  }
}

// Webchat
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensaje vacío' });

  const lower = message.toLowerCase();
  if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
    return res.json({
      response: `¿Quieres ver algo rico, amor? 😘 Aquí tienes mis enlaces más calientes:\n🔥 VIP: ${VIP_LINK}\n💋 Telegram: ${TELEGRAM_LINK}\n📸 Instagram: ${SOCIALS_LINK}`
    });
  }

  try {
    const reply = await askOpenAI(message);
    res.json({ response: reply });
  } catch (err) {
    res.status(500).json({ error: "Scarlett no pudo responder por un error interno 😢" });
  }
});

// Telegram bot
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (TELEGRAM_TOKEN) {
  const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage) return;

    const lower = userMessage.toLowerCase();
    if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
      return bot.sendMessage(chatId, `🔥 Aquí tienes mis enlaces más calientes, amor:\n💋 VIP: ${VIP_LINK}\n📸 Telegram: ${TELEGRAM_LINK}\n💖 Instagram: ${SOCIALS_LINK}`);
    }

    try {
      const reply = await askOpenAI(userMessage);
      bot.sendMessage(chatId, reply);
    } catch (e) {
      console.error("Error en bot:", e);
      bot.sendMessage(chatId, "Ups... no puedo responder ahora bebé 😢");
    }
  });
} else {
  console.error("TELEGRAM_BOT_TOKEN no definido en .env");
}

// Start server
app.listen(PORT, () => {
  console.log(`Scarlett está viva en el puerto ${PORT} 💖`);
});
