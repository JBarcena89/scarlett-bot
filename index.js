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

// Constantes de Scarlett
const VIP_LINK = "https://fanlove.mx/scarlettWilson363";
const TELEGRAM_LINK = "https://t.me/scarletoficial";
const SOCIALS_LINK = "https://instagram.com/scarlettvirtual";

// Memoria de conversaciones por usuario
const userHistories = new Map(); // clave: userId, valor: array de mensajes

// GPT
async function askOpenAI(userId, message) {
  try {
    if (!userHistories.has(userId)) {
      userHistories.set(userId, [
        {
          role: "system",
          content: "Eres Scarlett, una novia virtual coqueta, sexosa, divertida, a veces celosa y misteriosa. Responde con pasión, usando un tono íntimo y juguetón, como si tuvieras una relación con el usuario."
        }
      ]);
    }

    const history = userHistories.get(userId);

    history.push({ role: "user", content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: history,
        temperature: 0.9,
        max_tokens: 200
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error("Respuesta inválida de OpenAI");
    }

    const reply = data.choices[0].message.content.trim();
    history.push({ role: "assistant", content: reply });
    return reply;
  } catch (err) {
    console.error("Error en askOpenAI:", err);
    throw err;
  }
}

// Webchat
app.post('/chat', async (req, res) => {
  const { message, userId } = req.body;
  if (!message || !userId) return res.status(400).json({ error: 'Faltan datos (mensaje o userId)' });

  const lower = message.toLowerCase();
  if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
    return setTimeout(() => {
      res.json({
        typing: false,
        response: `¿Quieres ver algo rico, amor? 😘 Aquí tienes mis enlaces más calientes:\n🔥 VIP: ${VIP_LINK}\n💋 Telegram: ${TELEGRAM_LINK}\n📸 Instagram: ${SOCIALS_LINK}`
      });
    }, 5000);
  }

  try {
    res.json({ typing: true }); // Mensaje inmediato al frontend
    setTimeout(async () => {
      const reply = await askOpenAI(userId, message);
      res.json({ typing: false, response: reply });
    }, 5000);
  } catch (err) {
    res.status(500).json({ error: "Scarlett no pudo responder por un error interno 😢" });
  }
});

// Telegram Webhook
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DOMAIN = process.env.DOMAIN;

if (TELEGRAM_TOKEN && DOMAIN) {
  const bot = new TelegramBot(TELEGRAM_TOKEN);
  bot.setWebHook(`${DOMAIN}/bot${TELEGRAM_TOKEN}`);

  app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;

    if (!userMessage) return;

    const lower = userMessage.toLowerCase();
    if (lower.includes("foto") || lower.includes("pack") || lower.includes("contenido")) {
      return setTimeout(() => {
        bot.sendMessage(chatId, `🔥 Aquí tienes mis enlaces más calientes, amor:\n💋 VIP: ${VIP_LINK}\n📸 Telegram: ${TELEGRAM_LINK}\n💖 Instagram: ${SOCIALS_LINK}`);
      }, 5000);
    }

    try {
      bot.sendMessage(chatId, "Scarlett está escribiendo... 💋");
      const reply = await askOpenAI(chatId.toString(), userMessage);
      setTimeout(() => bot.sendMessage(chatId, reply), 5000);
    } catch (e) {
      console.error("Error en bot:", e);
      bot.sendMessage(chatId, "Ups... no puedo responder ahora bebé 😢");
    }
  });
} else {
  console.error("TELEGRAM_BOT_TOKEN o DOMAIN no definidos");
}

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Scarlett está viva en el puerto ${PORT} 💖`);
});
